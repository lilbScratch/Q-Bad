import React, { useState, useEffect, useRef } from 'react';
import { useQueue } from '../context/QueueContext';
import { sounds } from '../utils/sound';
import { LogOut, UserPlus, Play } from 'lucide-react';

const AVATARS = ['🏸', '🔥', '⚡', '🌟', '🎯', '🏆', '🚀', '🌱', '🥇', '✨'];

export const PlayerView = () => {
  const { queue, courts, currentPlayerIds, addPlayerToQueue, removePlayerFromQueue, venueName } = useQueue();
  const [inputName, setInputName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🏸');
  const [queueCount, setQueueCount] = useState(1);

  const myStatuses = currentPlayerIds.map(id => {
    const queueIndex = queue.findIndex(p => p.id === id);
    const queueItem = queueIndex !== -1 ? queue[queueIndex] : null;
    const playingCourt = courts.find(c =>
      c.teamA.some(p => p.id === id) || c.teamB.some(p => p.id === id)
    );
    const playerObj = queueItem || (playingCourt ? [...playingCourt.teamA, ...playingCourt.teamB].find(p => p.id === id) : null);

    return { id, queueIndex, queueItem, playingCourt, playerObj };
  }).filter(s => s.playerObj);

  const hasActivePlayers = myStatuses.length > 0;


  const alertedRef = useRef({});

  useEffect(() => {
    let triggered = false;
    myStatuses.forEach(s => {
      // แจ้งเตือนเมื่อถึงคิว (คิวที่ 0) และยังไม่เคยแจ้งเตือนมาก่อน
      if (s.queueIndex === 0 && !alertedRef.current[`${s.id}-turn-0`]) {
        triggered = true;
        alertedRef.current[`${s.id}-turn-0`] = true;
      }
      // แจ้งเตือนเมื่อใกล้ถึงคิว (คิวที่ 1)
      else if (s.queueIndex === 1 && !alertedRef.current[`${s.id}-turn-1`]) {
        triggered = true;
        alertedRef.current[`${s.id}-turn-1`] = true;
      }
    });

    if (triggered) {
      sounds.playTurnAlert();
    }
  }, [myStatuses]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    addPlayerToQueue(inputName.trim(), selectedAvatar, queueCount);
  };

  const handleCancelAll = () => {
    if (confirm('ยกเลิกการต่อคิวทั้งหมดของคุณ?')) {
      myStatuses.forEach(s => {
        if (s.queueItem) removePlayerFromQueue(s.id);
      });
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <span className="badge badge-blue" style={{ fontSize: '0.8rem', marginBottom: '6px' }}>🏸 {venueName}</span>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '6px' }}>ระบบต่อคิวผู้เล่น</h2>
      </div>

      {hasActivePlayers ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {myStatuses.map((status, index) => {
            const { id, queueIndex, queueItem, playingCourt, playerObj } = status;

            if (playingCourt) {
              return (
                <div key={id} className="card glow-animation" style={{
                  padding: '16px', textAlign: 'center',
                  background: 'var(--success-light)', border: '2px solid var(--success)',
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🔥</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                    {playerObj.name} กำลังเล่นอยู่ใน {playingCourt.name}!
                  </h3>
                </div>
              );
            }

            if (queueItem) {
              return (
                <div key={id} className="card" style={{
                  padding: '16px', textAlign: 'center',
                  border: queueIndex < 2 ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: queueIndex < 2 ? 'var(--primary-light)' : '#fff',
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 8px',
                    background: queueIndex < 2 ? 'var(--primary)' : 'var(--bg)',
                    color: queueIndex < 2 ? '#fff' : 'var(--text)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', fontWeight: 800,
                  }}>#{queueIndex + 1}</div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                    {queueIndex === 0 ? '🎉 ถึงคิวของคุณแล้ว!' : `เหลืออีก ${queueIndex} คิว`}
                  </h3>

                  <div style={{
                    background: 'var(--bg)', padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginTop: '8px'
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>{queueItem.avatar}</span>
                    <span style={{ fontWeight: 600 }}>{queueItem.name}</span>
                  </div>
                </div>
              );
            }

            return null;
          })}

          {myStatuses.some(s => s.queueItem) && (
            <button className="btn btn-danger" onClick={handleCancelAll} style={{ width: '100%' }}>
              <LogOut size={14} /> ยกเลิกต่อคิวที่เหลือทั้งหมด
            </button>
          )}
        </div>
      ) : (
        /* State: Join form */
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>ลงชื่อเข้าต่อคิว</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            กรอกข้อมูลเพื่อรับลำดับคิวทันที
          </p>
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>ชื่อ *</label>
              <input type="text" className="form-input" placeholder="ชื่อเล่น / ฉายา" value={inputName} onChange={e => setInputName(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>จำนวนคนที่จะต่อคิว</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="range"
                  min="1" max="10"
                  value={queueCount}
                  onChange={e => setQueueCount(parseInt(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontWeight: 600, width: '30px', textAlign: 'center' }}>{queueCount}</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>ไอคอน / อิโมจิ</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  value={selectedAvatar}
                  onChange={e => setSelectedAvatar(e.target.value.substring(0, 2))}
                  style={{ width: '50px', textAlign: 'center', fontSize: '1.2rem', padding: '6px' }}
                  placeholder="อิโมจิ"
                />
                <span style={{ color: 'var(--border)', margin: '0 4px' }}>|</span>
                {AVATARS.map(av => (
                  <button type="button" key={av} onClick={() => setSelectedAvatar(av)} style={{
                    fontSize: '1.2rem', padding: '6px', borderRadius: 'var(--radius-sm)',
                    background: selectedAvatar === av ? 'var(--primary-light)' : 'var(--bg)',
                    border: selectedAvatar === av ? '1px solid var(--primary)' : '1px solid var(--border)',
                    cursor: 'pointer',
                  }}>{av}</button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '4px' }}>
              <UserPlus size={16} /> เข้าต่อคิว ({queueCount} คน)
            </button>
          </form>
        </div>
      )}

      {/* Courts overview */}
      <div className="card" style={{ padding: '14px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Play size={14} /> สนามที่กำลังเล่น ({courts.length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {courts.map(court => (
            <div key={court.id} style={{
              padding: '8px 10px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
              display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem',
            }}>
              <strong>{court.name}</strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                {court.teamA.map(p => p.name).join('/') || 'ว่าง'} vs {court.teamB.map(p => p.name).join('/') || 'ว่าง'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
