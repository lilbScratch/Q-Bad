import React, { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import { sounds } from '../utils/sound';
import { LogOut, UserPlus, Play } from 'lucide-react';

const AVATARS = ['🏸', '🔥', '⚡', '🌟', '🎯', '🏆', '🚀', '🌱', '🥇', '✨'];

export const PlayerView = () => {
  const { queue, courts, currentPlayerId, addPlayerToQueue, removePlayerFromQueue, venueName } = useQueue();
  const [inputName, setInputName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🏸');

  const myQueueIndex = queue.findIndex(p => p.id === currentPlayerId);
  const myQueueItem = myQueueIndex !== -1 ? queue[myQueueIndex] : null;
  const playingCourt = courts.find(c =>
    c.teamA.some(p => p.id === currentPlayerId) || c.teamB.some(p => p.id === currentPlayerId)
  );

  useEffect(() => {
    if (myQueueIndex >= 0 && myQueueIndex < 2) sounds.playTurnAlert();
  }, [myQueueIndex]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    addPlayerToQueue(inputName.trim(), selectedAvatar);
  };

  const handleCancel = () => {
    if (confirm('ยกเลิกการต่อคิว?') && currentPlayerId) removePlayerFromQueue(currentPlayerId);
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <span className="badge badge-blue" style={{ fontSize: '0.8rem', marginBottom: '6px' }}>🏸 {venueName}</span>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '6px' }}>ระบบต่อคิวผู้เล่น</h2>
      </div>

      {/* State: Playing on court */}
      {playingCourt ? (
        <div className="card glow-animation" style={{
          padding: '24px', textAlign: 'center',
          background: 'var(--success-light)', border: '2px solid var(--success)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔥</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
            กำลังเล่นอยู่ใน {playingCourt.name}!
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            เอนจอยครับ! เมื่อจบ ระบบจะนำคุณกลับเข้าคิวอัตโนมัติ
          </p>
        </div>

      ) : myQueueItem ? (
        /* State: In queue */
        <div className="card" style={{
          padding: '24px', textAlign: 'center',
          border: myQueueIndex < 2 ? '2px solid var(--primary)' : '1px solid var(--border)',
          background: myQueueIndex < 2 ? 'var(--primary-light)' : '#fff',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 12px',
            background: myQueueIndex < 2 ? 'var(--primary)' : 'var(--bg)',
            color: myQueueIndex < 2 ? '#fff' : 'var(--text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 800,
          }}>#{myQueueIndex + 1}</div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
            {myQueueIndex === 0 ? '🎉 ถึงคิวของคุณแล้ว!' : `เหลืออีก ${myQueueIndex} คิว`}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {myQueueIndex === 0 ? 'เตรียมตัวไปที่สนามได้เลย' : 'กรุณารอสักครู่'}
          </p>

          <div style={{
            background: 'var(--bg)', padding: '10px 16px', borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '14px',
          }}>
            <span style={{ fontSize: '1.2rem' }}>{myQueueItem.avatar}</span>
            <span style={{ fontWeight: 600 }}>{myQueueItem.name}</span>
          </div>

          <button className="btn btn-danger" onClick={handleCancel} style={{ width: '100%' }}>
            <LogOut size={14} /> ยกเลิกต่อคิว
          </button>
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
              <UserPlus size={16} /> เข้าต่อคิว
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
