'use client';
import { useEffect, useState } from 'react';

export default function ThemeController() {
  const brands = [
    { id: 'brand-kickstar', label: 'Kickstar', color: '#9945FF' },
    { id: 'brand-linear', label: 'Aether', color: '#8b5cf6' },
    { id: 'brand-attio', label: 'Attio', color: '#6366f1' },
    { id: 'brand-vercel', label: 'Vercel', color: '#ffffff' },
    { id: 'brand-stripe', label: 'Stripe', color: '#00d4ff' },
    { id: 'brand-mono', label: 'Mono', color: '#ffffff' }
  ];

  const [selectedBrand, setSelectedBrand] = useState('brand-kickstar');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('matchsass-brand-theme') || 'brand-kickstar';
    
    // Apply initial theme class
    const html = document.documentElement;
    brands.forEach(b => html.classList.remove(b.id));
    html.classList.add(saved);

    // Defer state update to next event tick to prevent cascading render warnings
    const timer = setTimeout(() => {
      setSelectedBrand(saved);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleBrandChange = (themeId) => {
    setSelectedBrand(themeId);
    
    // Apply new theme class
    const html = document.documentElement;
    brands.forEach(b => html.classList.remove(b.id));
    html.classList.add(themeId);
    
    localStorage.setItem('matchsass-brand-theme', themeId);
    // Dispatch custom event for theme change
    window.dispatchEvent(new CustomEvent('brand-theme-change', { detail: themeId }));
  };

  return (
    <div 
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        background: 'rgba(10, 8, 19, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '100px',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        maxWidth: expanded ? '350px' : '48px',
        overflow: 'hidden',
        height: '44px',
        whiteSpace: 'nowrap'
      }}
    >
      {/* Icon Trigger */}
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'var(--accent-gradient)',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        flexShrink: 0
      }}>
        <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: '#040308' }}>
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
        </svg>
      </div>

      {/* Expanded Presets switcher */}
      {expanded && (
        <div style={{ display: 'flex', gap: '4px', paddingRight: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary)', marginRight: '6px', fontWeight: 700 }}>THEME:</span>
          {brands.map(b => (
            <button
              key={b.id}
              onClick={() => handleBrandChange(b.id)}
              style={{
                background: selectedBrand === b.id ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: `1px solid ${selectedBrand === b.id ? 'var(--border-line)' : 'transparent'}`,
                color: selectedBrand === b.id ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                borderRadius: '100px',
                padding: '4px 10px',
                fontSize: '11px',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: b.color, display: 'inline-block' }}></span>
              {b.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
