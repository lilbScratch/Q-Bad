import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { CourtCard } from './CourtCard';
import { QueueList } from './QueueList';
import { FinishMatchModal } from './FinishMatchModal';
import { AddPlayerModal } from './AddPlayerModal';
import { Plus, QrCode, Trophy, Users, History } from 'lucide-react';

export const OrganizerView = ({ onOpenQR }) => {
  const { courts, addCourt, queue, history } = useQueue();
  const [selectedCourtForFinish, setSelectedCourtForFinish] = useState(null);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [newCourtName, setNewCourtName] = useState('');
  const [isAddingCourt, setIsAddingCourt] = useState(false);

  const handleAddCourt = (e) => {
    e.preventDefault();
    addCourt(newCourtName || `สนาม ${courts.length + 1}`, '2out');
    setNewCourtName('');
    setIsAddingCourt(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trophy size={22} color="var(--primary)" />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>สนามที่เปิด</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{courts.length}</div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={22} color="var(--success)" />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>คิวที่รออยู่</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)' }}>{queue.length} คน</div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>สแกนเข้าคิว</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>เปิด QR Code</div>
          </div>
          <button className="btn btn-primary" onClick={onOpenQR} style={{ padding: '8px 12px' }}>
            <QrCode size={16} /> QR
          </button>
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>

        {/* Courts Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>สนามแข่งขัน ({courts.length})</h2>
            {isAddingCourt ? (
              <form onSubmit={handleAddCourt} style={{ display: 'flex', gap: '4px' }}>
                <input type="text" className="form-input" placeholder="ชื่อสนาม" value={newCourtName} onChange={e => setNewCourtName(e.target.value)} style={{ width: '120px', padding: '6px 8px', fontSize: '0.8rem' }} autoFocus />
                <button type="submit" className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>เพิ่ม</button>
                <button type="button" className="btn btn-secondary" style={{ padding: '6px 8px', fontSize: '0.8rem' }} onClick={() => setIsAddingCourt(false)}>✕</button>
              </form>
            ) : (
              <button className="btn btn-secondary" onClick={() => setIsAddingCourt(true)} style={{ fontSize: '0.8rem' }}>
                <Plus size={14} /> เพิ่มสนาม
              </button>
            )}
          </div>

          {courts.length > 0 ? courts.map(court => (
            <CourtCard key={court.id} court={court} onOpenFinishModal={c => setSelectedCourtForFinish(c)} />
          )) : (
            <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              ยังไม่มีสนาม — กด "เพิ่มสนาม" เพื่อเริ่ม
            </div>
          )}

          {/* Match History */}
          {history.length > 0 && (
            <div className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={15} /> ประวัติล่าสุด
              </h3>
              <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {history.slice(0, 10).map(item => (
                  <div key={item.id} style={{
                    padding: '6px 10px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span><strong>{item.courtName}</strong> — {item.players}</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {item.score} ({new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Queue Column */}
        <QueueList onOpenAddPlayer={() => setIsAddPlayerOpen(true)} />
      </div>

      {/* Modals */}
      {selectedCourtForFinish && <FinishMatchModal court={selectedCourtForFinish} onClose={() => setSelectedCourtForFinish(null)} />}
      {isAddPlayerOpen && <AddPlayerModal onClose={() => setIsAddPlayerOpen(false)} />}
    </div>
  );
};
