export default function Footer() {
  const columns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'API Playground', href: '#commands' },
        { label: 'Live Telemetry', href: '#demo' },
        { label: 'Tuner', href: '#tuner' }
      ]
    },
    {
      title: 'Company',
      links: [
        {/* label: 'About Us', href: '#faq' */},
        { label: 'GitHub', href: 'https://github.com/kickstar-app', target: '_blank' },
        { label: 'Solana Devs', href: 'https://solana.com/developers', target: '_blank' },
        { label: 'Support', href: 'mailto:support@kickstar.app' }
      ]
    },
    {
      title: 'Consensus',
      links: [
        { label: 'TxLINE Data', href: 'https://kinetics.colorion.co/', target: '_blank' },
        { label: 'TxODDS Hackathon', href: 'https://superteam.fun/earn/listing/consumer-and-fan-experiences/', target: '_blank' },
        { label: 'Leaderboard', href: '#features' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms', href: '#' },
        { label: 'Trust Center', href: '#' },
        { label: 'Cookie Settings', href: '#' }
      ]
    }
  ];

  return (
    <>
      {/* Bottom CTA Band */}
      <section className="section">
        <div className="wrap">
          <div className="cta-band">
            <h2>Bring your football matches to life.</h2>
            <p>Launch the Kickstar Hub. Leverage live TxLINE data to predict match events and claim rewards on Solana.</p>
            <a href="/dashboard" className="btn btn-cyan">Launch Web Hub Portal</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-top-row">
            {/* Left Column: Brand & Copy */}
            <div className="footer-brand-col">
              <div className="brand">
                <div className="brand-symbol" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.03)', width: 32, height: 32 }}>
                  <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'none', stroke: 'url(#kickstarFooterGrad)', strokeWidth: 2.5 }}>
                    <defs>
                      <linearGradient id="kickstarFooterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-violet)" />
                        <stop offset="100%" stopColor="var(--accent-cyan)" />
                      </linearGradient>
                    </defs>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.912 5.886h6.19l-5.008 3.638 1.913 5.886-5.007-3.638-5.008 3.638 1.913-5.886-5.008-3.638h6.19L12 3z" />
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.1, letterSpacing: '0.05em', color: '#fff' }}>KICKSTAR</span>
                  <span style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.15em', textTransform: 'uppercase', lineHeight: 1 }}>Football Companion</span>
                </div>
              </div>
              <p className="desc">
                Kickstar is the complete AI-powered punditry and consensus fan experience platform for football, powered by TxLINE &amp; Solana.
              </p>
              <p className="copyright">
                Kickstar App © 2026
              </p>
            </div>

            {/* Right Column: Links Grid */}
            <div className="footer-links-grid">
              {columns.map((col, idx) => (
                <div key={idx} className="footer-link-col">
                  <h3>{col.title}</h3>
                  <div className="footer-link-group">
                    {col.links.map((link, lIdx) => (
                      <a 
                        key={lIdx} 
                        href={link.href} 
                        className="footer-arrow-link"
                        target={link.target}
                        rel={link.target ? "noopener noreferrer" : undefined}
                      >
                        {link.label}
                        <span className="arrow-icon">
                          <svg fill="none" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd"></path>
                          </svg>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="footer-bottom-row">
            <div className="desc" style={{ color: 'var(--ink-dim)', fontSize: '13px' }}>
              AI-Powered live punditry built for TxODDS Hackathon.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
