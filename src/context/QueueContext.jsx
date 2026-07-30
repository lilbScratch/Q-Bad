import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { sounds } from '../utils/sound';
import Peer from 'peerjs';

const QueueContext = createContext();

const STORAGE_KEY = 'badminton_queue_app_state_v2';

const INITIAL_DEMO_DATA = {
  venueName: 'Badminton Club (ก๊วนแบดมินตัน)',
  courts: [],
  queue: [],
  history: []
};

export const QueueProvider = ({ children }) => {
  // Determine Role based on URL parameter
  const [viewRole, setViewRole] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('room') ? 'player' : 'organizer';
  });

  const [roomId, setRoomId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) return roomParam; // Player connects to this room

    // Organizer generates or loads a room ID
    let id = localStorage.getItem('badminton_room_id');
    if (!id) {
      id = `BDM-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem('badminton_room_id', id);
    }
    return id;
  });

  const [state, setState] = useState(() => {
    if (viewRole === 'organizer') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse local storage', e);
      }
      return INITIAL_DEMO_DATA;
    }
    return INITIAL_DEMO_DATA; // Player starts empty, waits for sync
  });

  const [currentPlayerId, setCurrentPlayerId] = useState(() => {
    return localStorage.getItem('badminton_current_player_id') || null;
  });

  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, disconnected

  // PeerJS setup
  const peerRef = useRef(null);
  const connectionsRef = useRef([]); // For Organizer
  const hostConnectionRef = useRef(null); // For Player

  const stateRef = useRef(state); // Keep latest state for processing actions
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const peer = new Peer(viewRole === 'organizer' ? roomId : undefined);
    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      if (viewRole === 'player') {
        // Player connects to Organizer
        const conn = peer.connect(roomId);
        hostConnectionRef.current = conn;

        conn.on('open', () => {
          setConnectionStatus('connected');
        });

        conn.on('data', (data) => {
          if (data.type === 'SYNC_STATE') {
            setState(data.payload);
          }
        });

        conn.on('close', () => setConnectionStatus('disconnected'));
        conn.on('error', () => setConnectionStatus('disconnected'));
      } else {
        setConnectionStatus('connected');
      }
    });

    if (viewRole === 'organizer') {
      peer.on('connection', (conn) => {
        connectionsRef.current.push(conn);
        
        conn.on('open', () => {
          // Send current state to new connection
          conn.send({ type: 'SYNC_STATE', payload: stateRef.current });
        });

        conn.on('data', (data) => {
          if (data.type === 'ACTION') {
            processAction(data.actionType, data.payload);
          }
        });

        conn.on('close', () => {
          connectionsRef.current = connectionsRef.current.filter(c => c.peer !== conn.peer);
        });
      });
    }

    peer.on('disconnected', () => setConnectionStatus('disconnected'));
    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setConnectionStatus('disconnected');
    });

    return () => {
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [roomId, viewRole]);

  const updateAndBroadcastState = (newState) => {
    setState(newState);
    if (viewRole === 'organizer') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        // Broadcast to all connected players
        connectionsRef.current.forEach(conn => {
          if (conn.open) {
            conn.send({ type: 'SYNC_STATE', payload: newState });
          }
        });
      } catch (e) {
        console.error('Failed to broadcast state', e);
      }
    }
  };

  const processAction = (actionType, payload) => {
    const currentState = stateRef.current;
    let newState = { ...currentState };

    switch (actionType) {
      case 'SET_VENUE_NAME':
        newState.venueName = payload.name;
        break;
      case 'ADD_COURT':
        newState.courts = [...currentState.courts, {
          id: `court-${Date.now()}`,
          name: payload.courtName || `สนาม ${currentState.courts.length + 1}`,
          mode: payload.defaultMode,
          targetScore: 21,
          teamA: [], teamB: [], scoreA: 0, scoreB: 0, status: 'playing',
        }];
        break;
      case 'REMOVE_COURT':
        const courtToRemove = currentState.courts.find(c => c.id === payload.courtId);
        if (courtToRemove) {
          const activePlayers = [...courtToRemove.teamA, ...courtToRemove.teamB];
          newState.queue = [...activePlayers, ...currentState.queue];
        }
        newState.courts = currentState.courts.filter(c => c.id !== payload.courtId);
        break;
      case 'UPDATE_COURT_MODE':
        newState.courts = currentState.courts.map(c => c.id === payload.courtId ? { ...c, mode: payload.mode } : c);
        break;
      case 'UPDATE_SCORE':
        newState.courts = currentState.courts.map(court => {
          if (court.id !== payload.courtId) return court;
          if (payload.team === 'A') return { ...court, scoreA: Math.max(0, court.scoreA + payload.delta) };
          return { ...court, scoreB: Math.max(0, court.scoreB + payload.delta) };
        });
        sounds.playPointSound();
        break;
      case 'FINISH_MATCH': {
        const court = currentState.courts.find(c => c.id === payload.courtId);
        if (!court) break;
        sounds.playFinishSound();
        const allPlayers = [...court.teamA, ...court.teamB];
        let exiting = [], staying = [];
        
        if (payload.rotationMode === '4out') {
          exiting = allPlayers;
        } else {
          if (payload.selectedExitingPlayerIds && payload.selectedExitingPlayerIds.length === 2) {
            exiting = allPlayers.filter(p => payload.selectedExitingPlayerIds.includes(p.id));
            staying = allPlayers.filter(p => !payload.selectedExitingPlayerIds.includes(p.id));
          } else {
            if (court.scoreA < court.scoreB) { exiting = court.teamA; staying = court.teamB; }
            else { exiting = court.teamB; staying = court.teamA; }
          }
        }
        
        const exitingWithStats = exiting.map(p => ({ ...p, matchesPlayed: (p.matchesPlayed || 0) + 1, joinedAt: Date.now() }));
        let newQueue = [...currentState.queue, ...exitingWithStats];
        
        const needed = 4 - staying.length;
        const pulled = newQueue.slice(0, needed);
        newQueue = newQueue.slice(needed);
        
        const combined = [...staying, ...pulled];
        newState.courts = currentState.courts.map(c => c.id === payload.courtId ? {
          ...c, teamA: combined.slice(0, 2), teamB: combined.slice(2, 4), scoreA: 0, scoreB: 0, status: 'playing'
        } : c);
        newState.queue = newQueue;
        newState.history = [{
          id: `h-${Date.now()}`, courtName: court.name,
          winner: court.scoreA > court.scoreB ? 'Team A' : court.scoreB > court.scoreA ? 'Team B' : 'เสมอ',
          score: `${court.scoreA} - ${court.scoreB}`, timestamp: Date.now(), players: allPlayers.map(p => p.name).join(', '),
        }, ...currentState.history];
        break;
      }
      case 'ADD_PLAYER':
        newState.queue = [...currentState.queue, payload.player];
        break;
      case 'REMOVE_PLAYER':
        newState.queue = currentState.queue.filter(p => p.id !== payload.playerId);
        break;
      case 'MOVE_QUEUE': {
        const nq = [...currentState.queue];
        const tgt = payload.index + payload.direction;
        if (tgt >= 0 && tgt < nq.length) {
          const temp = nq[payload.index];
          nq[payload.index] = nq[tgt];
          nq[tgt] = temp;
        }
        newState.queue = nq;
        break;
      }
      case 'AUTO_FILL': {
        let cq = [...currentState.queue];
        newState.courts = currentState.courts.map(court => {
          let ta = [...court.teamA], tb = [...court.teamB];
          while (ta.length < 2 && cq.length > 0) ta.push(cq.shift());
          while (tb.length < 2 && cq.length > 0) tb.push(cq.shift());
          return { ...court, teamA: ta, teamB: tb };
        });
        newState.queue = cq;
        break;
      }
      case 'RESET_DEMO':
        newState = INITIAL_DEMO_DATA;
        break;
      case 'CLEAR_PLAYERS':
        newState.courts = currentState.courts.map(c => ({ ...c, teamA: [], teamB: [], scoreA: 0, scoreB: 0 }));
        newState.queue = [];
        break;
    }
    updateAndBroadcastState(newState);
  };

  const dispatchAction = (actionType, payload) => {
    if (viewRole === 'organizer') {
      processAction(actionType, payload);
    } else {
      if (hostConnectionRef.current && hostConnectionRef.current.open) {
        hostConnectionRef.current.send({ type: 'ACTION', actionType, payload });
      } else {
        alert('ไม่ได้เชื่อมต่อกับคนจัดสนาม (Host Disconnected)');
      }
    }
  };

  const setVenueName = (name) => dispatchAction('SET_VENUE_NAME', { name });
  const addCourt = (courtName, defaultMode = '2out') => dispatchAction('ADD_COURT', { courtName, defaultMode });
  const removeCourt = (courtId) => dispatchAction('REMOVE_COURT', { courtId });
  const updateCourtMode = (courtId, mode) => dispatchAction('UPDATE_COURT_MODE', { courtId, mode });
  const updateScore = (courtId, team, delta) => dispatchAction('UPDATE_SCORE', { courtId, team, delta });
  const finishMatch = (courtId, rotationMode, selectedExitingPlayerIds) => dispatchAction('FINISH_MATCH', { courtId, rotationMode, selectedExitingPlayerIds });
  
  const addPlayerToQueue = (playerName, level = 'Intermediate', avatar = '🏸') => {
    const newPlayer = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: playerName.trim(),
      level, avatar, joinedAt: Date.now(), matchesPlayed: 0,
    };
    if (!currentPlayerId) {
      setCurrentPlayerId(newPlayer.id);
      localStorage.setItem('badminton_current_player_id', newPlayer.id);
    }
    dispatchAction('ADD_PLAYER', { player: newPlayer });
    return newPlayer;
  };
  
  const removePlayerFromQueue = (playerId) => {
    if (playerId === currentPlayerId) {
      setCurrentPlayerId(null);
      localStorage.removeItem('badminton_current_player_id');
    }
    dispatchAction('REMOVE_PLAYER', { playerId });
  };
  
  const moveQueue = (index, direction) => dispatchAction('MOVE_QUEUE', { index, direction });
  const autoFillCourts = () => dispatchAction('AUTO_FILL');
  const resetDemoData = () => dispatchAction('RESET_DEMO');
  const clearAllPlayers = () => dispatchAction('CLEAR_PLAYERS');

  return (
    <QueueContext.Provider
      value={{
        ...state,
        viewRole,
        roomId,
        connectionStatus,
        currentPlayerId,
        setCurrentPlayerId,
        setVenueName, addCourt, removeCourt, updateCourtMode, updateScore, finishMatch,
        addPlayerToQueue, removePlayerFromQueue, moveQueue, autoFillCourts, resetDemoData, clearAllPlayers,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => useContext(QueueContext);
