import React from 'react';
import { useQueue } from '../context/QueueContext';
import { UserPlus, ArrowUp, ArrowDown, Trash2, Sparkles, AlertCircle } from 'lucide-react';

export const QueueList = ({ onOpenAddPlayer }) => {
  const { queue, removePlayerFromQueue, moveQueue, autoFillCourts, viewRole } = useQueue();

  return (
    <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            คิวรอเล่น
            <span className="badge badge-blue">{queue.length} คน</span>
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>คนที่จบเกมจะต่อท้ายคิวอัตโนมัติ</span>
        </div>
        {viewRole === 'organizer' && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-secondary" onClick={autoFillCourts} style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
              <Sparkles size={14} /> ดึงเข้าสนาม
            </button>
            <button className="btn btn-primary" onClick={onOpenAddPlayer} style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
              <UserPlus size={14} /> เพิ่มผู้เล่น
            </button>
          </div>
        )}
      </div>

      {/* Queue Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '460px', overflowY: 'auto' }}>
        {queue.length > 0 ? queue.map((player, index) => {
          const isNext = index < 4;
          return (
            <div
              key={player.id}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: isNext ? 'var(--primary-light)' : 'var(--bg)',
                border: isNext ? '1px solid #bfdbfe' : '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: isNext ? 'var(--primary)' : 'var(--border)',
                  color: isNext ? '#fff' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: '0.75rem',
                }}>{index + 1}</div>
                <span style={{ fontSize: '1.1rem' }}>{player.avatar}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {player.name}
                    {isNext && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>เตรียมพร้อม</span>}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {player.level} • เล่นแล้ว {player.matchesPlayed || 0} เกม
                  </div>
                </div>
              </div>
              {viewRole === 'organizer' && (
                <div style={{ display: 'flex', gap: '3px' }}>
                  <button className="btn btn-secondary btn-icon" disabled={index === 0} onClick={() => moveQueue(index, -1)} style={{ padding: '4px' }}><ArrowUp size={12} /></button>
                  <button className="btn btn-secondary btn-icon" disabled={index === queue.length - 1} onClick={() => moveQueue(index, 1)} style={{ padding: '4px' }}><ArrowDown size={12} /></button>
                  <button className="btn btn-danger btn-icon" onClick={() => { if (confirm(`ลบ ${player.name}?`)) removePlayerFromQueue(player.id); }} style={{ padding: '4px' }}><Trash2 size={12} /></button>
                </div>
              )}
            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)' }}>
            <AlertCircle size={24} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '0.85rem' }}>ยังไม่มีผู้เล่นในคิว</p>
            {viewRole === 'organizer' && (
              <button className="btn btn-primary" onClick={onOpenAddPlayer} style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                <UserPlus size={14} /> เพิ่มผู้เล่นคนแรก
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
