export const dynamic = 'force-dynamic';

import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Tuner from './components/Tuner';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import ScrollReveal from './components/ScrollReveal';

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Features />
        <Tuner />
        <FAQ />
        <Footer />
      </main>
      <ScrollReveal />
    </>
  );
}
