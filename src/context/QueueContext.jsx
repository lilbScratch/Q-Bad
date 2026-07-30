import React, { createContext, useContext, useState, useEffect } from 'react';
import { sounds } from '../utils/sound';

const QueueContext = createContext();

const STORAGE_KEY = 'badminton_queue_app_state_v1';
const CHANNEL_NAME = 'badminton_queue_sync_channel';

// Default initial state with mock data for demonstration
const INITIAL_DEMO_DATA = {
  venueName: 'Badminton Club (ก๊วนแบดมินตัน)',
  courts: [
    {
      id: 'court-1',
      name: 'สนาม 1',
      mode: '2out', // '2out' (ออก 2 คน) or '4out' (ออก 4 คน)
      targetScore: 21,
      teamA: [
        { id: 'p-1', name: 'กิตติศักดิ์', level: 'Intermediate', avatar: '🏸' },
        { id: 'p-2', name: 'วิชัย', level: 'Advanced', avatar: '🔥' },
      ],
      teamB: [
        { id: 'p-3', name: 'ภานุเดช', level: 'Intermediate', avatar: '⚡' },
        { id: 'p-4', name: 'ณัฐพงษ์', level: 'Beginner', avatar: '🌟' },
      ],
      scoreA: 18,
      scoreB: 16,
      status: 'playing', // 'playing', 'finished'
    },
    {
      id: 'court-2',
      name: 'สนาม 2',
      mode: '4out',
      targetScore: 21,
      teamA: [
        { id: 'p-5', name: 'อนันต์', level: 'Intermediate', avatar: '🎯' },
        { id: 'p-6', name: 'สุรชัย', level: 'Intermediate', avatar: '🏸' },
      ],
      teamB: [
        { id: 'p-7', name: 'ธนากร', level: 'Advanced', avatar: '🏆' },
        { id: 'p-8', name: 'ประวิทย์', level: 'Beginner', avatar: '⭐' },
      ],
      scoreA: 12,
      scoreB: 14,
      status: 'playing',
    },
  ],
  queue: [
    { id: 'p-9', name: 'สมชาย', level: 'Intermediate', avatar: '🚀', joinedAt: Date.now() - 600000, matchesPlayed: 2 },
    { id: 'p-10', name: 'วีระ', level: 'Beginner', avatar: '🌱', joinedAt: Date.now() - 500000, matchesPlayed: 1 },
    { id: 'p-11', name: 'ชัยวัฒน์', level: 'Advanced', avatar: '🥇', joinedAt: Date.now() - 400000, matchesPlayed: 3 },
    { id: 'p-12', name: 'ปรีชา', level: 'Intermediate', avatar: '🏸', joinedAt: Date.now() - 300000, matchesPlayed: 2 },
    { id: 'p-13', name: 'เอกชัย', level: 'Beginner', avatar: '✨', joinedAt: Date.now() - 200000, matchesPlayed: 1 },
    { id: 'p-14', name: 'สิทธิชัย', level: 'Intermediate', avatar: '💫', joinedAt: Date.now() - 100000, matchesPlayed: 0 },
  ],
  history: [
    {
      id: 'h-1',
      courtName: 'สนาม 1',
      winner: 'Team A (กิตติศักดิ์ / วิชัย)',
      score: '21 - 19',
      timestamp: Date.now() - 1200000,
    }
  ]
};

export const QueueProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse local storage', e);
    }
    return INITIAL_DEMO_DATA;
  });

  // Current session view mode (organizer vs player) and player ID on this device
  const [viewRole, setViewRole] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    if (roleParam === 'player') return 'player';
    if (roleParam === 'organizer') return 'organizer';
    return 'organizer';
  });

  const [currentPlayerId, setCurrentPlayerId] = useState(() => {
    return localStorage.getItem('badminton_current_player_id') || null;
  });

  // Broadcast Channel for sync across tabs
  useEffect(() => {
    let channel;
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_STATE') {
          setState(event.data.payload);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported', e);
    }

    // Save to local storage on state change
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }

    return () => {
      if (channel) channel.close();
    };
  }, [state]);

  const updateAndBroadcastState = (newState) => {
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'SYNC_STATE', payload: newState });
      channel.close();
    } catch (e) {
      console.warn('Broadcast postMessage failed', e);
    }
  };

  // --- ACTIONS ---

  // Set Venue Name
  const setVenueName = (name) => {
    updateAndBroadcastState({
      ...state,
      venueName: name,
    });
  };

  // Add Court
  const addCourt = (courtName, defaultMode = '2out') => {
    const newCourt = {
      id: `court-${Date.now()}`,
      name: courtName || `สนาม ${state.courts.length + 1}`,
      mode: defaultMode,
      targetScore: 21,
      teamA: [],
      teamB: [],
      scoreA: 0,
      scoreB: 0,
      status: 'playing',
    };
    updateAndBroadcastState({
      ...state,
      courts: [...state.courts, newCourt],
    });
  };

  // Delete Court
  const removeCourt = (courtId) => {
    // If court has active players, put them back into queue
    const court = state.courts.find(c => c.id === courtId);
    let updatedQueue = [...state.queue];
    if (court) {
      const activePlayers = [...court.teamA, ...court.teamB];
      updatedQueue = [...activePlayers, ...updatedQueue];
    }

    updateAndBroadcastState({
      ...state,
      courts: state.courts.filter(c => c.id !== courtId),
      queue: updatedQueue,
    });
  };

  // Update Court Mode (2 Out vs 4 Out)
  const updateCourtMode = (courtId, mode) => {
    updateAndBroadcastState({
      ...state,
      courts: state.courts.map(c => c.id === courtId ? { ...c, mode } : c),
    });
  };

  // Update Score
  const updateScore = (courtId, team, delta) => {
    const updatedCourts = state.courts.map(court => {
      if (court.id !== courtId) return court;
      if (team === 'A') {
        const newScore = Math.max(0, court.scoreA + delta);
        return { ...court, scoreA: newScore };
      } else {
        const newScore = Math.max(0, court.scoreB + delta);
        return { ...court, scoreB: newScore };
      }
    });

    sounds.playPointSound();
    updateAndBroadcastState({
      ...state,
      courts: updatedCourts,
    });
  };

  // Finish Match & Rotation logic (2 OUT vs 4 OUT)
  const finishMatch = (courtId, rotationMode, selectedExitingPlayerIds) => {
    const court = state.courts.find(c => c.id === courtId);
    if (!court) return;

    sounds.playFinishSound();

    const allCourtPlayers = [...court.teamA, ...court.teamB];
    let exitingPlayers = [];
    let stayingPlayers = [];

    if (rotationMode === '4out') {
      // All 4 players exit
      exitingPlayers = allCourtPlayers;
      stayingPlayers = [];
    } else {
      // 2 Players exit (2out mode)
      if (selectedExitingPlayerIds && selectedExitingPlayerIds.length === 2) {
        exitingPlayers = allCourtPlayers.filter(p => selectedExitingPlayerIds.includes(p.id));
        stayingPlayers = allCourtPlayers.filter(p => !selectedExitingPlayerIds.includes(p.id));
      } else {
        // Default: Loser team exits
        if (court.scoreA < court.scoreB) {
          exitingPlayers = court.teamA;
          stayingPlayers = court.teamB;
        } else {
          exitingPlayers = court.teamB;
          stayingPlayers = court.teamA;
        }
      }
    }

    // Increase matchesPlayed counter for exiting players
    const exitingWithStats = exitingPlayers.map(p => ({
      ...p,
      matchesPlayed: (p.matchesPlayed || 0) + 1,
      joinedAt: Date.now(),
    }));

    // Put exiting players back to end of queue
    let newQueue = [...state.queue, ...exitingWithStats];

    // Determine how many new players needed to fill court (up to 4)
    const needed = 4 - stayingPlayers.length;
    const playersToPull = newQueue.slice(0, needed);
    newQueue = newQueue.slice(needed);

    // Form new Team A & Team B
    const combinedNewCourtPlayers = [...stayingPlayers, ...playersToPull];
    const newTeamA = combinedNewCourtPlayers.slice(0, 2);
    const newTeamB = combinedNewCourtPlayers.slice(2, 4);

    // Save match history
    const matchHistoryRecord = {
      id: `h-${Date.now()}`,
      courtName: court.name,
      winner: court.scoreA > court.scoreB ? 'Team A' : court.scoreB > court.scoreA ? 'Team B' : 'เสมอ',
      score: `${court.scoreA} - ${court.scoreB}`,
      timestamp: Date.now(),
      players: allCourtPlayers.map(p => p.name).join(', '),
    };

    const updatedCourts = state.courts.map(c => {
      if (c.id !== courtId) return c;
      return {
        ...c,
        teamA: newTeamA,
        teamB: newTeamB,
        scoreA: 0,
        scoreB: 0,
        status: 'playing',
      };
    });

    updateAndBroadcastState({
      ...state,
      courts: updatedCourts,
      queue: newQueue,
      history: [matchHistoryRecord, ...state.history],
    });
  };

  // Add new Player to Queue (from Organizer or Player scanner)
  const addPlayerToQueue = (playerName, level = 'Intermediate', avatar = '🏸') => {
    const newPlayer = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: playerName.trim(),
      level: level,
      avatar: avatar,
      joinedAt: Date.now(),
      matchesPlayed: 0,
    };

    // Save current player ID to device localStorage if added in Player mode
    if (!currentPlayerId) {
      setCurrentPlayerId(newPlayer.id);
      localStorage.setItem('badminton_current_player_id', newPlayer.id);
    }

    updateAndBroadcastState({
      ...state,
      queue: [...state.queue, newPlayer],
    });

    return newPlayer;
  };

  // Remove Player from Queue
  const removePlayerFromQueue = (playerId) => {
    if (playerId === currentPlayerId) {
      setCurrentPlayerId(null);
      localStorage.removeItem('badminton_current_player_id');
    }

    updateAndBroadcastState({
      ...state,
      queue: state.queue.filter(p => p.id !== playerId),
    });
  };

  // Move Queue order
  const moveQueue = (index, direction) => {
    const newQueue = [...state.queue];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newQueue.length) return;

    const temp = newQueue[index];
    newQueue[index] = newQueue[targetIndex];
    newQueue[targetIndex] = temp;

    updateAndBroadcastState({
      ...state,
      queue: newQueue,
    });
  };

  // Auto Fill Empty Court Seats from Queue
  const autoFillCourts = () => {
    let currentQueue = [...state.queue];
    const updatedCourts = state.courts.map(court => {
      let teamA = [...court.teamA];
      let teamB = [...court.teamB];

      while (teamA.length < 2 && currentQueue.length > 0) {
        teamA.push(currentQueue.shift());
      }
      while (teamB.length < 2 && currentQueue.length > 0) {
        teamB.push(currentQueue.shift());
      }

      return {
        ...court,
        teamA,
        teamB,
      };
    });

    updateAndBroadcastState({
      ...state,
      courts: updatedCourts,
      queue: currentQueue,
    });
  };

  // Reset demo data
  const resetDemoData = () => {
    updateAndBroadcastState(INITIAL_DEMO_DATA);
  };

  // Clear all players
  const clearAllPlayers = () => {
    updateAndBroadcastState({
      ...state,
      courts: state.courts.map(c => ({ ...c, teamA: [], teamB: [], scoreA: 0, scoreB: 0 })),
      queue: [],
    });
  };

  return (
    <QueueContext.Provider
      value={{
        ...state,
        viewRole,
        setViewRole,
        currentPlayerId,
        setCurrentPlayerId,
        setVenueName,
        addCourt,
        removeCourt,
        updateCourtMode,
        updateScore,
        finishMatch,
        addPlayerToQueue,
        removePlayerFromQueue,
        moveQueue,
        autoFillCourts,
        resetDemoData,
        clearAllPlayers,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => useContext(QueueContext);
