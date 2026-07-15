export default function FAQ() {
  const faqs = [
    {
      q: "What are $SASS Fan Tokens and how do they work?",
      a: "$SASS is the native utility token of the Kickstar platform deployed on Solana. Holding $SASS acts as your membership license, granting you access to official club channels, voting rights in team polls, and a multiplier on all prediction rewards."
    },
    {
      q: "How do fans influence clubs and match experiences?",
      a: "Clubs issue binding and non-binding polls on Kickstar. By staking your $SASS tokens, you cast votes on various team decisions, such as deciding the next caricature match graphic style, selecting stadium entry playlists, or rating controversial VAR decisions."
    },
    {
      q: "How does the TxLINE data layer power the Predict-to-Earn engine?",
      a: "Kickstar connects to TxLINE's real-time events and consensus betting odds feed. We generate dynamic prediction pools (e.g. 'Will Barca score in the next 5 mins?'). Correct predictions are verified by live TxLINE match results, rewarding you with SSU Loyalty Points."
    },
    {
      q: "What exclusive rewards can fans redeem SSU points for?",
      a: "SSU Loyalty Points earned from predictions, quizzes, and voting can be redeemed in our Rewards Center. Rewards range from digital collectibles (AI match caricatures) to signed shirts, VIP stadium box tickets, and meet-and-greets with top players."
    },
    {
      q: "Is there a maximum cap on voting rights?",
      a: "Yes. To ensure fair consensus and prevent single whales from dominating the polls, each club sets a maximum voting cap per user, regardless of how many $SASS Fan Tokens they hold. This guarantees a decentralized, fan-first voting system."
    }
  ];

  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="section-head">
          <h2>Fan Hub &amp; Voting Architecture</h2>
          <span className="tagline">How Kickstar uses Solana and TxLINE data layers to provide Web3 rewards and voting privileges to sports fans.</span>
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
