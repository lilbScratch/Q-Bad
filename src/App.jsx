import React, { useState } from 'react';
import { QueueProvider, useQueue } from './context/QueueContext';
import { Navbar } from './components/Navbar';
import { OrganizerView } from './components/OrganizerView';
import { PlayerView } from './components/PlayerView';
import { QRCodeModal } from './components/QRCodeModal';

function MainContent() {
  const { viewRole } = useQueue();
  const [isQROpen, setIsQROpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onOpenQR={() => setIsQROpen(true)} />

      <main style={{ flex: 1 }}>
        {viewRole === 'organizer' ? (
          <OrganizerView onOpenQR={() => setIsQROpen(true)} />
        ) : (
          <PlayerView onOpenQR={() => setIsQROpen(true)} />
        )}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '16px',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)',
        marginTop: '40px',
      }}>
        🏸 Badminton Queue Manager
      </footer>

      {isQROpen && <QRCodeModal onClose={() => setIsQROpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <QueueProvider>
      <MainContent />
    </QueueProvider>
  );
}
