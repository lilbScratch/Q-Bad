import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { UserPlus, X, Sparkles } from 'lucide-react';

const AVATARS = ['🏸', '🔥', '⚡', '🌟', '🎯', '🏆', '🚀', '🌱', '🥇', '✨', '💫', '🦁'];

export const AddPlayerModal = ({ onClose }) => {
  const { addPlayerToQueue } = useQueue();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🏸');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addPlayerToQueue(name.trim(), selectedAvatar);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} color="var(--primary)" /> เพิ่มผู้เล่นเข้าคิว
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>ชื่อ / ฉายา *</label>
            <input type="text" className="form-input" placeholder="เช่น สมชาย, พี่นก" value={name} onChange={e => setName(e.target.value)} required autoFocus />
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
                <button
                  type="button" key={av} onClick={() => setSelectedAvatar(av)}
                  style={{
                    fontSize: '1.3rem', padding: '6px', borderRadius: 'var(--radius-sm)',
                    background: selectedAvatar === av ? 'var(--primary-light)' : 'var(--bg)',
                    border: selectedAvatar === av ? '1px solid var(--primary)' : '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >{av}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>ยกเลิก</button>
            <button type="submit" className="btn btn-primary"><Sparkles size={14} /> เข้าต่อคิว</button>
          </div>
        </form>
      </div>
    </div>
  );
};
