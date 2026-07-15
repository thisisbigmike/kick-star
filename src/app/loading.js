export default function Loading() {
  return (
    <div style={{
      background: 'var(--bg-obsidian)',
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        position: 'relative'
      }}>
        {/* Animated Double Ring Pulse Spinner */}
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '3px solid transparent',
          borderTopColor: 'var(--accent-violet)',
          borderRadius: '50%',
          animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          inset: '4px',
          border: '3px solid transparent',
          borderTopColor: 'var(--accent-cyan)',
          borderRadius: '50%',
          animation: 'spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse'
        }}></div>
      </div>
      
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--ink-secondary)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }}>
        Loading Kickstar...
      </span>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
