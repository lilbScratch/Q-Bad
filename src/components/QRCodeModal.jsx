import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Check, X, ExternalLink } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

export const QRCodeModal = ({ onClose }) => {
  const { venueName } = useQueue();
  const [copied, setCopied] = useState(false);
  const playerUrl = `${window.location.origin}${window.location.pathname}?role=player`;

  const handleCopy = () => {
    navigator.clipboard.writeText(playerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <QrCode size={18} color="var(--primary)" /> QR Code สำหรับต่อคิว
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          ให้ผู้เล่นสแกนเพื่อเข้าหน้าต่อคิวของ <strong>{venueName}</strong>
        </p>

        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: 'var(--radius)',
          display: 'inline-block',
          margin: '0 auto 16px',
          border: '2px solid var(--primary)',
        }}>
          <QRCodeSVG value={playerUrl} size={200} bgColor="#fff" fgColor="#1e293b" level="H" includeMargin />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg)',
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          marginBottom: '16px',
        }}>
          <input type="text" readOnly value={playerUrl} style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', width: '100%', outline: 'none', fontFamily: 'monospace',
          }} />
          <button className="btn btn-secondary" onClick={handleCopy} style={{ padding: '4px 10px', fontSize: '0.75rem', flexShrink: 0 }}>
            {copied ? <><Check size={12} /> คัดลอกแล้ว</> : <><Copy size={12} /> คัดลอก</>}
          </button>
        </div>

        <a href={playerUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: '0.8rem' }}>
          <ExternalLink size={14} /> เปิดหน้าผู้เล่นในแท็บใหม่
        </a>
      </div>
    </div>
  );
};
