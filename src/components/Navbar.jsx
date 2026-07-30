import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { QrCode, Edit3, Check, X, RefreshCw } from 'lucide-react';

export const Navbar = ({ onOpenQR }) => {
  const { venueName, setVenueName, viewRole, queue, courts, resetDemoData, connectionStatus } = useQueue();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(venueName);

  const handleSaveName = () => {
    if (nameInput.trim()) setVenueName(nameInput.trim());
    setIsEditingName(false);
  };

  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '10px 20px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        {/* Left: Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🏸</span>
          <div>
            {isEditingName && viewRole === 'organizer' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  style={{ padding: '4px 8px', fontSize: '0.9rem', width: '200px' }}
                  autoFocus
                />
                <button className="btn btn-primary btn-icon" onClick={handleSaveName}><Check size={14} /></button>
                <button className="btn btn-secondary btn-icon" onClick={() => setIsEditingName(false)}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h1 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{venueName}</h1>
                {viewRole === 'organizer' && (
                  <button
                    onClick={() => { setNameInput(venueName); setIsEditingName(true); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                  ><Edit3 size={13} /></button>
                )}
              </div>
            )}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {courts.length} สนาม • {queue.length} คนในคิว
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Connection Status indicator */}
          <div style={{
             display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem',
             color: 'var(--text-secondary)',
             padding: '4px 8px',
             background: 'var(--bg)',
             borderRadius: 'var(--radius-sm)',
             border: '1px solid var(--border)',
             marginRight: '4px'
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: connectionStatus === 'connected' ? 'var(--success)' : 
                          connectionStatus === 'connecting' ? '#eab308' : 'var(--danger)'
            }} title={connectionStatus} />
            <span style={{ fontWeight: 500 }}>
              {viewRole === 'organizer' ? '🛠 คนจัดสนาม' : '🙋 ผู้เล่น'}
            </span>
          </div>

          {viewRole === 'organizer' && (
            <button className="btn btn-primary" onClick={onOpenQR} style={{ padding: '6px 10px' }}>
              <QrCode size={16} /> QR
            </button>
          )}

          {viewRole === 'organizer' && (
            <button
              className="btn btn-secondary"
              onClick={() => { if (confirm('รีเซ็ตข้อมูลตัวอย่าง?')) resetDemoData(); }}
              style={{ padding: '6px 10px' }}
              title="รีเซ็ต Demo"
            ><RefreshCw size={14} /></button>
          )}
        </div>
      </div>
    </header>
  );
};
