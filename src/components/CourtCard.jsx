import React from 'react';
import { useQueue } from '../context/QueueContext';
import { Plus, Minus, Trash2, ArrowRightLeft, Trophy } from 'lucide-react';

export const CourtCard = ({ court, onOpenFinishModal }) => {
  const { updateScore, updateCourtMode, removeCourt, viewRole } = useQueue();
  const isFull = court.teamA.length === 2 && court.teamB.length === 2;
  const totalPlayers = court.teamA.length + court.teamB.length;

  const PlayerSlot = ({ player, align = 'left' }) => (
    <div style={{
      padding: '8px 10px',
      background: 'var(--bg)',
      borderRadius: 'var(--radius-sm)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
    }}>
      {align === 'left' && <span>{player.avatar || '🏸'}</span>}
      <div style={{ textAlign: align }}>
        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{player.name}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>เล่นแล้ว {player.matchesPlayed || 0} เกม</div>
      </div>
      {align === 'right' && <span>{player.avatar || '🏸'}</span>}
    </div>
  );

  const EmptySlot = () => (
    <div style={{
      padding: '12px',
      background: 'var(--bg)',
      borderRadius: 'var(--radius-sm)',
      textAlign: 'center',
      fontSize: '0.8rem',
      color: 'var(--text-muted)',
      border: '1px dashed var(--border)',
    }}>รอผู้เล่น...</div>
  );

  return (
    <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{court.name}</h3>
          <span className={`badge ${court.mode === '2out' ? 'badge-blue' : 'badge-amber'}`}>
            {court.mode === '2out' ? 'ออก 2 คน' : 'ออก 4 คน'}
          </span>
          {viewRole === 'organizer' && (
            <button
              onClick={() => updateCourtMode(court.id, court.mode === '2out' ? '4out' : '2out')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font)' }}
            >สลับ</button>
          )}
        </div>
        {viewRole === 'organizer' && (
          <button
            onClick={() => { if (confirm(`ลบ ${court.name}?`)) removeCourt(court.id); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          ><Trash2 size={15} /></button>
        )}
      </div>

      {/* Match Area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '10px',
        alignItems: 'center',
        padding: '12px',
        background: 'var(--bg)',
        borderRadius: 'var(--radius-sm)',
      }}>
        {/* Team A */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ฝั่ง A</div>
          {court.teamA.length > 0 ? court.teamA.map(p => <PlayerSlot key={p.id} player={p} />) : <EmptySlot />}
        </div>

        {/* Score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text)' }}>
            {court.scoreA} : {court.scoreB}
          </div>
          {viewRole === 'organizer' && isFull && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button className="btn btn-secondary btn-icon" onClick={() => updateScore(court.id, 'A', 1)} style={{ padding: '4px' }}><Plus size={12} /></button>
                <button className="btn btn-secondary btn-icon" onClick={() => updateScore(court.id, 'A', -1)} style={{ padding: '4px' }}><Minus size={12} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button className="btn btn-secondary btn-icon" onClick={() => updateScore(court.id, 'B', 1)} style={{ padding: '4px' }}><Plus size={12} /></button>
                <button className="btn btn-secondary btn-icon" onClick={() => updateScore(court.id, 'B', -1)} style={{ padding: '4px' }}><Minus size={12} /></button>
              </div>
            </div>
          )}
        </div>

        {/* Team B */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>ฝั่ง B</div>
          {court.teamB.length > 0 ? court.teamB.map(p => <PlayerSlot key={p.id} player={p} align="right" />) : <EmptySlot />}
        </div>
      </div>

      {/* Finish Button */}
      {viewRole === 'organizer' && (
        <button
          className="btn btn-primary"
          disabled={totalPlayers === 0}
          onClick={() => onOpenFinishModal(court)}
          style={{ width: '100%', opacity: totalPlayers === 0 ? 0.5 : 1 }}
        >
          <Trophy size={16} /> จบเกม / หมุนเวียนคิว
        </button>
      )}
    </div>
  );
};
