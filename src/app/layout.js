import ThemeController from './components/ThemeController';
import WalletProviders from './components/WalletProviders';
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
  title: 'Kickstar — The Football Companion You Never Have to Read',
  description: 'Kickstar is a zero-reading football companion for World Cup fans. Tap your team to onboard, mint your Fan Pass on Solana, predict match moments with a tap, and hear the "Why" behind every goal and card in Pidgin voice — no typing, no stat tables, no odds, ever.',
  openGraph: {
    type: 'website',
    title: 'Kickstar — The Football Companion You Never Have to Read',
    description: 'A zero-reading football companion: tap-to-onboard, a Solana Fan Pass, tap-to-predict, and a Pidgin voice "Why Engine" that explains every match moment out loud.',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            @supports ((animation-timeline: view()) and (animation-range: entry)) {
              @keyframes reveal-up {
                from { opacity: 0; transform: translateY(40px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
              .feature-card, .faq-item, .cta-band, .component-showcase, .tuner-card {
                view-timeline: --reveal block;
                animation: reveal-up auto linear forwards;
                animation-timeline: --reveal;
                animation-range: entry 10% entry 45%;
              }
            }
          }
        `}</style>
      </head>
      <body suppressHydrationWarning>
        <WalletProviders>
          {children}
          <ThemeController />
        </WalletProviders>
      </body>
    </html>
  );
}
