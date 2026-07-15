import ThemeController from './components/ThemeController';
import './styles/base.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/gallery.css';
import './styles/closing.css';

export const viewport = {
  themeColor: '#0B0A10',
};

export const metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Kickstar — Real-time Football Analytics & Companion App',
  description: 'Kickstar is a high-performance Web3 football companion and predictive reward portal. We parse real-time match telemetry and consensus odds shifts from the TxLINE data layer into dynamic prediction pools. Solana integrated.',
  openGraph: {
    type: 'website',
    title: 'Kickstar — Real-time Football Analytics & Companion App',
    description: 'Kickstar is a high-performance Web3 football companion and predictive reward portal. We parse real-time match telemetry and consensus odds shifts from the TxLINE data layer into dynamic prediction pools. Solana integrated.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            @supports ((animation-timeline: view()) and (animation-range: entry)) {
              @keyframes reveal-up {
                from { opacity: 0; transform: translateY(40px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
              .feature-card, .faq-item, .cta-band, .component-showcase, .tuner-card, .command-console-card {
                view-timeline: --reveal block;
                animation: reveal-up auto linear forwards;
                animation-timeline: --reveal;
                animation-range: entry 10% entry 45%;
              }
            }
          }
        `}</style>
      </head>
      <body>
        {children}
        <ThemeController />
      </body>
    </html>
  );
}
