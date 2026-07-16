export default function FAQ() {
  const faqs = [
    {
      q: "Do I need to type anything to use Kickstar?",
      a: "No. Onboarding is tap-only — tap your club badge to set up your profile, tap to connect your wallet, and tap to predict match moments. There are no forms anywhere in the core experience."
    },
    {
      q: "What is a Fan Pass?",
      a: "Your Fan Pass is a compressed NFT minted on Solana at onboarding. It's a visual badge and trophy display — not a stat table — that evolves as you earn achievements, and it's yours permanently, on-chain."
    },
    {
      q: "Is Kickstar a betting app?",
      a: "No. Kickstar never shows odds, never lets you wager money, and has no withdrawal mechanic. Predictions earn XP and bragging-rights badges only — it's an identity and collectible progression system, not gambling."
    },
    {
      q: "What is the Why Engine?",
      a: "The Why Engine turns live match events (goals, cards, corners, VAR reviews) into a spoken Pidgin explanation. Tap the Why button on any match moment to hear what happened, out loud, no reading required."
    },
    {
      q: "What happens to my predictions?",
      a: "Each locked prediction is recorded as a receipt on Solana devnet. XP is awarded for participating, not just for being right, so your progress keeps building match after match."
    }
  ];

  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="section-head">
          <h2>Frequently Asked Questions</h2>
          <span className="tagline">How Kickstar&apos;s zero-reading, Solana-based fan identity system actually works.</span>
        </div>

        <div className="faq-grid">
          {faqs.map((faq, i) => (
            <div className="faq-item" key={i}>
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
