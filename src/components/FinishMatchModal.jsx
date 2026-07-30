import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useQueue } from '../context/QueueContext';
import { Trophy, CheckCircle, X } from 'lucide-react';

export const FinishMatchModal = ({ court, onClose }) => {
  const { finishMatch } = useQueue();
  const [mode, setMode] = useState(court?.mode || '2out');

  const defaultExiting = court?.scoreA < court?.scoreB
    ? court.teamA.map(p => p.id)
    : court.teamB.map(p => p.id);
  const [selectedExitingIds, setSelectedExitingIds] = useState(defaultExiting);

  if (!court) return null;
  const allPlayers = [...court.teamA, ...court.teamB];

  const togglePlayerSelect = (id) => {
    if (selectedExitingIds.includes(id)) {
      setSelectedExitingIds(selectedExitingIds.filter(x => x !== id));
    } else if (selectedExitingIds.length < 2) {
      setSelectedExitingIds([...selectedExitingIds, id]);
    } else {
      setSelectedExitingIds([selectedExitingIds[1], id]);
    }
  };

  const handleConfirm = () => {
    try { confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } }); } catch (e) {}
    finishMatch(court.id, mode, mode === '2out' ? selectedExitingIds : null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>จบเกม — {court.name}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {/* Mode Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {[{ key: '2out', label: 'ออก 2 คน', desc: 'ผู้แพ้ออก, ผู้ชนะอยู่ต่อ' },
            { key: '4out', label: 'ออก 4 คน', desc: 'ทุกคนวนกลับคิวใหม่' }].map(opt => (
            <div
              key={opt.key}
              onClick={() => setMode(opt.key)}
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: mode === opt.key ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: mode === opt.key ? 'var(--primary-light)' : '#fff',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: mode === opt.key ? 'var(--primary)' : 'var(--text)' }}>{opt.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{opt.desc}</div>
            </div>
          ))}
        </div>

        {/* 2-out player selection */}
        {mode === '2out' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              เลือก 2 คนที่จะออกจากสนาม:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {allPlayers.map(player => {
                const sel = selectedExitingIds.includes(player.id);
                return (
                  <div
                    key={player.id}
                    onClick={() => togglePlayerSelect(player.id)}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      background: sel ? 'var(--danger-light)' : 'var(--bg)',
                      border: sel ? '1px solid #fecaca' : '1px solid var(--border)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                    }}
                  >
                    <span>{player.avatar} {player.name}</span>
                    {sel && <CheckCircle size={14} color="var(--danger)" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>ยกเลิก</button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={mode === '2out' && selectedExitingIds.length !== 2}
          >ยืนยันจบเกม</button>
        </div>
      </div>
    </div>
  );
};
