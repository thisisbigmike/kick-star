'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import XPReveal from '../components/onboarding/XPReveal';
import WhyButton from '../components/dashboard/WhyButton';
import { createSimulatedEvent, getEventVisual } from '../lib/matchEvents';
import { mintPredictionReceipt } from '../lib/solana/mintPredictionReceipt';
import '../styles/dashboard.css';

export default function Dashboard() {
  const walletAdapter = useWallet();

  // Wallet / Balance states
  const [walletConnected, setWalletConnected] = useState(true);
  const [walletAddress, setWalletAddress] = useState('Fx2a...9R7');
  const [ssuBalance, setSsuBalance] = useState(2480);

  // LiveScore Center states — events use the structured MatchEvent schema
  // (src/app/lib/matchEvents.js), shared with the Why Engine's Pidgin generator.
  const [scoresList, setScoresList] = useState([
    { id: 's1', league: 'FIFA World Cup', stadium: 'Lusail Iconic Stadium', home: 'ARG', away: 'FRA', homeScore: 2, awayScore: 1, status: 'live', minute: 73, events: [
      createSimulatedEvent('s1', 'penalty', { minute: 23, team: 'home', player: 'Messi', penalty: { outcome: 'scored' } }),
      createSimulatedEvent('s1', 'goal', { minute: 36, team: 'home', player: 'Di Maria' }),
      createSimulatedEvent('s1', 'penalty', { minute: 80, team: 'away', player: 'Mbappe', penalty: { outcome: 'scored' } }),
    ] },
    { id: 's2', league: 'Premier League', stadium: 'Stamford Bridge', home: 'CHE', away: 'ARS', homeScore: 0, awayScore: 0, status: 'live', minute: 15, events: [] },
    { id: 's3', league: 'La Liga', stadium: 'Santiago Bernabeu', home: 'RMA', away: 'FCB', homeScore: 1, awayScore: 3, status: 'ft', minute: 90, events: [
      createSimulatedEvent('s3', 'goal', { minute: 12, team: 'home', player: 'Vinicius' }),
      createSimulatedEvent('s3', 'goal', { minute: 34, team: 'away', player: 'Lewandowski' }),
      createSimulatedEvent('s3', 'goal', { minute: 56, team: 'away', player: 'Pedri' }),
      createSimulatedEvent('s3', 'goal', { minute: 82, team: 'away', player: 'Gavi' }),
    ] },
    { id: 's4', league: 'UEFA Champions League', stadium: 'Allianz Arena', home: 'BAY', away: 'PSG', homeScore: 0, awayScore: 1, status: 'ht', minute: 45, events: [
      createSimulatedEvent('s4', 'goal', { minute: 41, team: 'away', player: 'Neymar' }),
    ] },
    { id: 's5', league: 'Serie A', stadium: 'Allianz Stadium', home: 'JUV', away: 'MIL', homeScore: 0, awayScore: 0, status: 'scheduled', time: '20:45', events: [] }
  ]);
  const [goalHighlight, setGoalHighlight] = useState({});

  // Layout Tab state ('dashboard', 'rewards', 'leaderboard')
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dashboard Overview state
  const [searchQuery, setSearchQuery] = useState('');

  // Simulated live feed of activities — XP/identity framing, no shares/odds language
  const [activitiesList, setActivitiesList] = useState([
    { id: 1, user: '@ARG_Ultras', action: 'Predicted correctly', amount: '+50 XP', time: '3 mins ago', pct: '+50 XP', isPositive: true },
    { id: 2, user: '@PremBantz', action: 'Predicted wrong', amount: '0 XP', time: '12 mins ago', pct: '0 XP', isPositive: false },
    { id: 3, user: '@SassMaster', action: 'Predicted correctly', amount: '+50 XP', time: '22 mins ago', pct: '+50 XP', isPositive: true },
    { id: 4, user: '@GoonerWitty', action: 'Predicted wrong', amount: '0 XP', time: '40 mins ago', pct: '0 XP', isPositive: false },
    { id: 5, user: '@VARisAJoke', action: 'Predicted correctly', amount: '+65 XP', time: '1 hr ago', pct: '+65 XP', isPositive: true }
  ]);

  // Streaks & Multiplier
  const [predictionStreak, setPredictionStreak] = useState(4);
  const [streakMultiplier, setStreakMultiplier] = useState(1.4);

  // Interactive Live Poll voting state
  const [selectedPollOption, setSelectedPollOption] = useState(null);
  const [pollVoted, setPollVoted] = useState(false);
  const [pollPcts, setPollPcts] = useState({ A: 58, B: 24, C: 18 });

  // Interactive Prediction Slips
  const [predictionChoices, setPredictionChoices] = useState({});
  const [predictionLocked, setPredictionLocked] = useState({});
  
  // Real Solana devnet cNFT minting state (src/app/lib/solana/mintClient.js)
  const [cnftMinting, setCnftMinting] = useState({}); // matchId -> 'minting' | 'done'
  const [cnftReceipts, setCnftReceipts] = useState({}); // matchId -> { choice, timestamp, pointsGained, mintResult }
  const [resolvedMatches, setResolvedMatches] = useState({}); // matchId -> { outcome, isWin }

  // Animated XP reveal — replaces silent balance bumps, per PRD 6.4
  const [xpRevealAmount, setXpRevealAmount] = useState(null);

  // Squad Leaderboard Scope
  const [leaderboardScope, setLeaderboardScope] = useState('global'); // 'global' | 'squads'
  const [activeSquad, setActiveSquad] = useState('@SassSquad');

  // Cross-post modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareCardText || "Kickstar Fan Win / Roast Card");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1400);
  };



  // Connect Wallet Morphing state logic
  const [walletConnectState, setWalletConnectState] = useState('idle'); // 'idle' | 'loading' | 'success'
  const walletTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (walletTimeoutRef.current) clearTimeout(walletTimeoutRef.current);
    };
  }, []);

  const [shareCardType, setShareCardType] = useState('win'); // 'win' | 'roast'
  const [shareCardText, setShareCardText] = useState('');
  const [shareCardImage, setShareCardImage] = useState('/images/messi_kick.jpg');
  const [shareCardCategory, setShareCardCategory] = useState('MATCH WIN RECEIPT');
  const [shareRatio, setShareRatio] = useState('16-9'); // '16-9' | '9-16' | '1-1'

  // Sliding Tab Refs & Style States
  const dashTabsRef = useRef(null);
  const [dashPillStyle, setDashPillStyle] = useState({ left: 0, width: 0 });

  const squadTabsRef = useRef(null);
  const [squadPillStyle, setSquadPillStyle] = useState({ left: 0, width: 0 });

  const ratioTabsRef = useRef(null);
  const [ratioPillStyle, setRatioPillStyle] = useState({ left: 0, width: 0 });

  // Update main dash tab sliding pill
  useEffect(() => {
    if (dashTabsRef.current) {
      const activeBtn = dashTabsRef.current.querySelector('.active');
      if (activeBtn) {
        setDashPillStyle({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth
        });
      }
    }
  }, [activeTab]);

  // Update squad selector sliding pill
  useEffect(() => {
    if (activeTab === 'leaderboard' && squadTabsRef.current) {
      const timer = setTimeout(() => {
        const activeBtn = squadTabsRef.current.querySelector('.active');
        if (activeBtn) {
          setSquadPillStyle({
            left: activeBtn.offsetLeft,
            width: activeBtn.offsetWidth
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [leaderboardScope, activeTab]);

  // Update share modal ratio sliding pill
  useEffect(() => {
    if (shareModalOpen && ratioTabsRef.current) {
      const timer = setTimeout(() => {
        const activeBtn = ratioTabsRef.current.querySelector('.active');
        if (activeBtn) {
          setRatioPillStyle({
            left: activeBtn.offsetLeft,
            width: activeBtn.offsetWidth
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [shareRatio, shareModalOpen]);

  // Rewards redemption state
  const [redemptionMessage, setRedemptionMessage] = useState('');
  const [rewardsList, setRewardsList] = useState([
    {
      id: 'r1',
      title: 'World Cup VIP Box Pass',
      cost: 10000,
      stock: 4,
      total: 10,
      image: '/images/referee_var.jpg',
      category: 'Experiences'
    },
    {
      id: 'r2',
      title: 'Signed Argentina Final Shirt',
      cost: 5000,
      stock: 12,
      total: 25,
      image: '/images/messi_kick.jpg',
      category: 'Merchandise'
    },
    {
      id: 'r3',
      title: 'NFT Caricature: "Own Goal Maguire"',
      cost: 500,
      stock: 87,
      total: 150,
      image: '/images/own_goal.jpg',
      category: 'Digital'
    },
    {
      id: 'r4',
      title: 'NFT Caricature: "Var Review"',
      cost: 500,
      stock: 103,
      total: 200,
      image: '/images/referee_var.jpg',
      category: 'Digital'
    }
  ]);

  // Live Match Telemetry simulation
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [playByPlay, setPlayByPlay] = useState('Match active. Listening to play-by-play telemetry...');

  useEffect(() => {
    // Simulate ball moving on pitch every 4 seconds
    const interval = setInterval(() => {
      const x = Math.floor(Math.random() * 80) + 10;
      const y = Math.floor(Math.random() * 80) + 10;
      setBallPosition({ x, y });

      const movements = [
        "Messi driving forward through the middle channel...",
        "Mbappe crosses from the left flank, intercepted in the danger zone!",
        "Foul declared near the center circle. Referee warning issued.",
        "Momentum building for the away side after that defensive block.",
        "Griezmann wins possession, cycling back to defenders.",
        "VAR Check: Checking potential hand-ball in the penalty box!"
      ];
      const randomMsg = movements[Math.floor(Math.random() * movements.length)];
      setPlayByPlay(randomMsg);

      // Tick minutes and simulate random structured match events
      // (goal/card/corner) for the livescores center + Why Engine.
      setScoresList(prev => prev.map(match => {
        if (match.status === 'live') {
          const nextMinute = match.minute + 1;
          const nextStatus = nextMinute >= 90 ? 'ft' : 'live';
          const roll = Math.random();

          // Goal trigger (15% chance per tick)
          if (roll > 0.85) {
            const scoreHome = Math.random() > 0.5;
            const nextHome = scoreHome ? match.homeScore + 1 : match.homeScore;
            const nextAway = !scoreHome ? match.awayScore + 1 : match.awayScore;

            setGoalHighlight(h => ({ ...h, [match.id]: true }));
            setTimeout(() => {
              setGoalHighlight(h => ({ ...h, [match.id]: false }));
            }, 3000);

            return {
              ...match,
              minute: nextMinute,
              status: nextStatus,
              homeScore: nextHome,
              awayScore: nextAway,
              events: [...match.events, createSimulatedEvent(match.id, 'goal', {
                minute: nextMinute,
                team: scoreHome ? 'home' : 'away',
              })]
            };
          }

          // Card trigger (10% chance per tick)
          if (roll > 0.75) {
            const team = Math.random() > 0.5 ? 'home' : 'away';
            const color = Math.random() > 0.85 ? 'red' : 'yellow';
            return {
              ...match,
              minute: nextMinute,
              status: nextStatus,
              events: [...match.events, createSimulatedEvent(match.id, 'card', {
                minute: nextMinute,
                team,
                card: { color },
              })]
            };
          }

          // Corner trigger (8% chance per tick)
          if (roll > 0.67) {
            const team = Math.random() > 0.5 ? 'home' : 'away';
            return {
              ...match,
              minute: nextMinute,
              status: nextStatus,
              events: [...match.events, createSimulatedEvent(match.id, 'corner', {
                minute: nextMinute,
                team,
              })]
            };
          }

          return {
            ...match,
            minute: nextMinute,
            status: nextStatus
          };
        }
        return match;
      }));

      // Add a simulated live activity feed event randomly — XP/identity framing, no odds/shares language
      if (Math.random() > 0.65) {
        const fans = ['@SassMaster', '@ARG_Ultras', '@PremBantz', '@Messi_Goals', '@El_Pundit', '@GoonerWitty', '@SolanaFanatic'];
        const randomFan = fans[Math.floor(Math.random() * fans.length)];
        const correct = Math.random() > 0.5;
        const xpVal = correct ? Math.floor(Math.random() * 50 + 20) : 0;
        setActivitiesList(prev => [
          {
            id: Date.now(),
            user: randomFan,
            action: correct ? 'Predicted correctly' : 'Predicted wrong',
            amount: `+${xpVal} XP`,
            time: 'Just now',
            pct: `+${xpVal} XP`,
            isPositive: correct
          },
          ...prev.slice(0, 4)
        ]);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncAuth = () => {
      const saved = localStorage.getItem('matchsass-user-auth');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTimeout(() => {
            setWalletConnected(parsed.walletConnected || false);
            setWalletAddress(parsed.walletAddress || '');
            if (parsed.points) setSsuBalance(parsed.points);
          }, 0);
        } catch (e) {
          console.error("Failed to sync auth in dashboard", e);
        }
      } else {
        setTimeout(() => {
          setWalletConnected(false);
          setWalletAddress('');
        }, 0);
      }
    };
    syncAuth();
    window.addEventListener('auth-state-change', syncAuth);
    return () => window.removeEventListener('auth-state-change', syncAuth);
  }, []);

  // Connect/Disconnect wallet handler
  const handleWalletToggle = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWalletAddress('');
      setWalletConnectState('idle');
      // Update local storage
      const saved = localStorage.getItem('matchsass-user-auth');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.walletConnected = false;
          parsed.walletAddress = '';
          localStorage.setItem('matchsass-user-auth', JSON.stringify(parsed));
        } catch (e) {
          console.error(e);
        }
      }
      window.dispatchEvent(new CustomEvent('auth-state-change'));
    } else {
      if (walletConnectState !== 'idle') return;
      setWalletConnectState('loading');
      
      walletTimeoutRef.current = setTimeout(() => {
        setWalletConnectState('success');
        
        walletTimeoutRef.current = setTimeout(() => {
          setWalletConnected(true);
          setWalletAddress('Fx2a...9R7');
          setWalletConnectState('idle');
          setSassBalance(prev => prev + 100);
          setSsuBalance(prev => {
            const next = prev + 250;
            // Update local storage
            const saved = localStorage.getItem('matchsass-user-auth');
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                parsed.walletConnected = true;
                parsed.walletAddress = 'Fx2a...9R7';
                parsed.points = next;
                localStorage.setItem('matchsass-user-auth', JSON.stringify(parsed));
              } catch (e) {
                console.error(e);
              }
            } else {
              const authData = {
                email: 'solana@wallet.com',
                username: 'SolPundit',
                walletConnected: true,
                walletAddress: 'Fx2a...9R7',
                points: next
              };
              localStorage.setItem('matchsass-user-auth', JSON.stringify(authData));
            }
            return next;
          });
          window.dispatchEvent(new CustomEvent('auth-state-change'));
        }, 800);
      }, 1500);
    }
  };

  // Voting handler
  const handleVote = (option) => {
    if (pollVoted) return;
    setSelectedPollOption(option);
    setPollVoted(true);
    // Adjust percentages slightly based on user vote
    setPollPcts(prev => {
      const next = { ...prev };
      next[option] = next[option] + 1;
      return next;
    });
    setSsuBalance(prev => prev + 20); // Get loyalty reward for voting
  };

  // Prediction submission handler — mints a real Solana devnet cNFT
  // receipt via Bubblegum when NEXT_PUBLIC_MERKLE_TREE_ADDRESS is
  // configured; otherwise falls back to a clearly-labeled
  // 'fallback-recorded' state rather than faking a tx hash (PRD §10).
  const handlePredict = async (matchId, choice) => {
    if (predictionLocked[matchId] || cnftMinting[matchId]) return;

    setPredictionChoices(prev => ({ ...prev, [matchId]: choice }));
    setCnftMinting(prev => ({ ...prev, [matchId]: 'minting' }));

    const result = await mintPredictionReceipt(walletAdapter, { matchId, choice });

    setCnftMinting(prev => ({ ...prev, [matchId]: 'done' }));
    setPredictionLocked(prev => ({ ...prev, [matchId]: true }));

    const pointsGained = Math.round(50 * streakMultiplier);
    setSsuBalance(prev => prev + pointsGained);
    setXpRevealAmount(pointsGained);

    setCnftReceipts(prev => ({
      ...prev,
      [matchId]: {
        choice,
        timestamp: new Date().toLocaleTimeString(),
        pointsGained,
        mintResult: result,
      }
    }));
  };

  // Manual match-event settlement simulator (demo only) to trigger Win vs Roast cards
  const handleSettleMatch = (matchId, actualOutcome) => {
    if (!predictionLocked[matchId]) {
      alert("Please place and lock a prediction first before simulating settlement!");
      return;
    }

    const userChoice = predictionChoices[matchId];
    const isWin = userChoice === actualOutcome;

    setResolvedMatches(prev => ({
      ...prev,
      [matchId]: {
        outcome: actualOutcome,
        isWin
      }
    }));

    let roastOrWinText = "";
    let cardImage = "";

    if (matchId === 'goal') {
      cardImage = actualOutcome === 'messi' ? '/images/messi_kick.jpg' : actualOutcome === 'mbappe' ? '/images/referee_var.jpg' : '/images/own_goal.jpg';
      if (isWin) {
        roastOrWinText = `🐐 GOAL CALL! Messi broke gravity with a bicycle kick at 72' and I predicted it live on Solana! Streak extended!`;
      } else {
        const scorerName = actualOutcome === 'messi' ? 'Lionel Messi' : actualOutcome === 'mbappe' ? 'Kylian Mbappe' : 'No Goal';
        roastOrWinText = `🤡 CLOWNSHIP CALLED! Predicted ${userChoice === 'messi' ? 'Messi' : userChoice === 'mbappe' ? 'Mbappe' : 'No Goal'} but ${scorerName} scored instead. Stick to checkers.`;
        // reset streak
        setPredictionStreak(0);
        setStreakMultiplier(1.0);
      }
    } else if (matchId === 'corner') {
      cardImage = '/images/referee_var.jpg';
      if (isWin) {
        roastOrWinText = `🎯 CALLED IT! Predicted ${actualOutcome.toUpperCase()} corner correctly. XP streak extended!`;
      } else {
        roastOrWinText = `🤦‍♂️ BRICKED IT! Predicted ${userChoice.toUpperCase()} corner, but the ball sailed out of bounds for the other team. I am absolutely mudded.`;
        // reset streak
        setPredictionStreak(0);
        setStreakMultiplier(1.0);
      }
    }

    if (isWin) {
      setPredictionStreak(prev => {
        const next = prev + 1;
        setStreakMultiplier(Math.min(2.5, Math.round((1 + next * 0.1) * 10) / 10));
        return next;
      });
    }

    setShareCardType(isWin ? 'win' : 'roast');
    setShareCardText(roastOrWinText);
    setShareCardImage(cardImage);
    setShareCardCategory(isWin ? 'MATCH WIN RECEIPT' : 'PUNDIT ROAST COLLECTION');
    setShareModalOpen(true);
  };

  // Reward redemption handler
  const handleRedeem = (reward) => {
    if (ssuBalance < reward.cost) {
      setRedemptionMessage(`Insufficient SSU Loyalty Points. You need ${reward.cost - ssuBalance} more points.`);
      setTimeout(() => setRedemptionMessage(''), 4000);
      return;
    }
    if (reward.stock <= 0) {
      setRedemptionMessage('Sorry, this reward is out of stock!');
      setTimeout(() => setRedemptionMessage(''), 4000);
      return;
    }
    
    // Deduct points, update stock
    setSsuBalance(prev => prev - reward.cost);
    setRewardsList(prev => prev.map(r => {
      if (r.id === reward.id) {
        return { ...r, stock: r.stock - 1 };
      }
      return r;
    }));
    setRedemptionMessage(`Redeemed successfully! Claim ticket for ${reward.title} sent to connected address.`);
    setTimeout(() => setRedemptionMessage(''), 6000);
  };

  return (
    <div className="dashboard-root-container">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">
            <img src="/images/logo.png" alt="Kickstar Logo" style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '6px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1, letterSpacing: '0.05em', color: '#fff' }}>KICKSTAR</span>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.15em', textTransform: 'uppercase', lineHeight: 1 }}>Football Companion</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`sidebar-nav-btn${activeTab === 'dashboard' ? ' active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
              Dashboard
            </button>
            <button
              className={`sidebar-nav-btn${activeTab === 'markets' ? ' active' : ''}`}
              onClick={() => setActiveTab('markets')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              Live &amp; Predict
            </button>
            <button
              className={`sidebar-nav-btn${activeTab === 'rewards' ? ' active' : ''}`}
              onClick={() => setActiveTab('rewards')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
              Fan Rewards
            </button>
            <button
              className={`sidebar-nav-btn${activeTab === 'leaderboard' ? ' active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z"/></svg>
              Squads Leaderboard
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-nav-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="main-content-pane">
        {/* TOP UTILITY HEADER BAR */}
        <div className="utility-bar">
          <div className="utility-title">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'markets' && 'Live & Predict'}
            {activeTab === 'rewards' && 'Fan Rewards'}
            {activeTab === 'leaderboard' && 'Leaderboard'}
          </div>

          <div className="utility-controls">
            {/* Global Search Bar */}
            <div className="utility-search-container">
              <svg className="utility-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                className="utility-search-input" 
                placeholder="Global Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Wallet / Streak User details */}
            {walletConnected && (
              <div className="user-profile-badge">
                <div className="user-profile-avatar"></div>
                <span className="mono">@El_Pundit</span>
                <span style={{ fontSize: 9, fontWeight: 900, background: 'var(--accent-amber)', color: '#000', padding: '2px 5px', borderRadius: 4, textTransform: 'uppercase' }}>GOLD</span>
              </div>
            )}

            <button 
              onClick={handleWalletToggle}
              className={walletConnected ? 'wallet-connect-btn connected' : `wallet-connect-btn ${walletConnectState}`}
              disabled={walletConnectState === 'loading'}
            >
              {walletConnected ? (
                walletAddress
              ) : (
                <>
                  {walletConnectState === 'idle' && 'Connect Wallet'}
                  {walletConnectState === 'loading' && (
                    <span className="morph-btn-content">
                      <span className="spinner-ring" />
                      Connecting...
                    </span>
                  )}
                  {walletConnectState === 'success' && (
                    <span className="morph-btn-content">
                      <svg className="checkmark-svg">
                        <path className="checkmark-path" d="M2 7l4 4 6-7" />
                      </svg>
                      Connected ✓
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* MAIN PANEL CONTENT VIEWPORT */}
        <main className="dash-main" style={{ maxWidth: '100%', padding: 0 }}>
          
          {/* ==========================================
              TAB: DASHBOARD OVERVIEW GRID
              ========================================== */}
          {activeTab === 'dashboard' && (
            <div className="overview-grid">

              {/* Left Main Dashboard Area */}
              <div className="overview-main-col">

                {/* Active Subject Banner */}
                <div className="subject-banner">
                  <div className="subject-banner-info">
                    <div className="subject-banner-icon">⚽</div>
                    <div>
                      <div className="subject-banner-title">Argentina vs France World Cup Final</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-secondary)', marginTop: 2 }}>Lusail Iconic Stadium • Live match, tap to predict</div>
                    </div>
                  </div>
                  <button className="btn" style={{ padding: '8px 16px', fontSize: 12, background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', color: 'var(--ink-primary)' }} onClick={() => setActiveTab('markets')}>
                    Go to match ▾
                  </button>
                </div>

                {/* XP / Streak overview */}
                <div className="stats-visual-card">
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)', marginBottom: 4 }}>YOUR PROGRESS</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-score)' }}>{ssuBalance} XP</span>
                    <span style={{ fontSize: 12, color: 'var(--accent-amber)', fontFamily: 'var(--font-score)', fontWeight: 700 }}>🔥 {predictionStreak}x streak</span>
                  </div>
                </div>

              </div>

              {/* Right Side Column (Stats Panels) */}
              <div className="overview-side-col">

                {/* Recent Activity List Card */}
                <div className="stats-visual-card">
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)', marginBottom: 4 }}>RECENT ACTIVITY</span>

                  <div className="activity-feed-scroll">
                    {activitiesList.map((act) => (
                      <div className="activity-item" key={act.id}>
                        <div>
                          <strong style={{ color: '#fff' }}>{act.user}</strong>
                          <div style={{ fontSize: 10.5, color: 'var(--ink-dim)' }}>{act.action} • {act.time}</div>
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          fontWeight: 700,
                          color: act.isPositive ? 'var(--signal-success)' : 'var(--signal-error)'
                        }}>{act.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              TAB: MARKETS & LIVE TELEMETRY
              ========================================== */}
          {activeTab === 'markets' && (
            <div className="dash-tab-panel active" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 32 }}>
              
              {/* Telemetry banner and 2D Pitch */}
              <section className="live-match-banner" style={{ width: '100%' }}>
                <div className="live-match-teams">
                  <div className="live-status-row">
                    <span className="live-pulse"></span>
                    <span className="live-time-badge">Live 73&apos;</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-secondary)' }}>Live Match Feed</span>
                  </div>
                  
                  <div className="team-score-display">
                    <span className="team-name">ARG</span>
                    <span className="match-score">2 - 1</span>
                    <span className="team-name">FRA</span>
                  </div>

                  <div className="match-venue">
                    🏆 Lusail Iconic Stadium • World Cup Final
                  </div>
                </div>

                {/* Mini field telemetry visualizer */}
                <div className="live-telemetry-panel">
                  <div className="badge-glass active" style={{ fontSize: 9 }}>LIVE POSITION TELEMETRY</div>
                  <div className="mini-pitch">
                    <div className="mini-pitch-center-circle"></div>
                    {/* Ball */}
                    <div 
                      className="mini-ball" 
                      style={{ 
                        left: `${ballPosition.x}%`, 
                        top: `${ballPosition.y}%` 
                      }}
                    ></div>
                  </div>
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-secondary)', minHeight: '36px', lineHeight: 1.4 }}>
                    💬 {playByPlay}
                  </div>
                </div>
              </section>

              {/* Predict-to-Earn Slips (with cNFT Receipts & Event simulator) */}
              <div className="polls-grid">
                
                {/* Active Fan Voting Poll */}
                <div className="poll-card">
                  <div className="poll-header">
                    <span className="poll-tag">Binding Poll</span>
                    <span className="poll-timer">4m remaining</span>
                  </div>
                  <div className="poll-question">
                    Rate the Referee VAR Review Penalty Decision at 71&apos;:
                  </div>
                  <div className="poll-options">
                    <button 
                      className={`poll-option-btn${selectedPollOption === 'A' ? ' selected' : ''}`} 
                      onClick={() => handleVote('A')}
                      disabled={pollVoted}
                    >
                      <span>1. Correct Call (Clean Tackle)</span>
                      {pollVoted && <span className="mono">{pollPcts.A}%</span>}
                    </button>
                    <button 
                      className={`poll-option-btn${selectedPollOption === 'B' ? ' selected' : ''}`} 
                      onClick={() => handleVote('B')}
                      disabled={pollVoted}
                    >
                      <span>2. Unfair Penalty (Should be carded)</span>
                      {pollVoted && <span className="mono">{pollPcts.B}%</span>}
                    </button>
                    <button 
                      className={`poll-option-btn${selectedPollOption === 'C' ? ' selected' : ''}`} 
                      onClick={() => handleVote('C')}
                      disabled={pollVoted}
                    >
                      <span>3. Inconclusive (Referee blind)</span>
                      {pollVoted && <span className="mono">{pollPcts.C}%</span>}
                    </button>
                  </div>
                  {pollVoted && (
                    <div style={{ fontSize: 12, color: 'var(--signal-success)', textAlign: 'center', fontWeight: 600 }}>
                      ✓ Vote recorded on Solana! +20 SSU Loyalty points claimed.
                    </div>
                  )}
                </div>

                {/* Non-gambling Compliance Disclaimer */}
                <div className="compliance-disclaimer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <div className="compliance-text">
                    <strong>🏆 Non-Gambling Loyalty Program.</strong> All predictions earn XP and bragging-rights badges only — zero wagering, zero financial risk, no odds ever shown. This platform is designed for consumer safety and responsible fan engagement.
                  </div>
                </div>

                {/* Predict-to-Earn Slip 1: Next Goal */}
                <div className="poll-card">
                  <div className="poll-header">
                    <span className="poll-tag" style={{ color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.1)' }}>Tap to Predict</span>
                    <span className="poll-timer">In-Play</span>
                  </div>
                  <div className="poll-question">
                    Who will score the next goal in the match?
                  </div>
                  <div className="poll-options">
                    <button
                      className={`poll-option-btn${predictionChoices.goal === 'messi' ? ' selected' : ''}`}
                      onClick={() => handlePredict('goal', 'messi')}
                      disabled={predictionLocked.goal || !!cnftMinting.goal}
                    >
                      <span>Lionel Messi</span>
                    </button>
                    <button
                      className={`poll-option-btn${predictionChoices.goal === 'mbappe' ? ' selected' : ''}`}
                      onClick={() => handlePredict('goal', 'mbappe')}
                      disabled={predictionLocked.goal || !!cnftMinting.goal}
                    >
                      <span>Kylian Mbappe</span>
                    </button>
                    <button
                      className={`poll-option-btn${predictionChoices.goal === 'none' ? ' selected' : ''}`}
                      onClick={() => handlePredict('goal', 'none')}
                      disabled={predictionLocked.goal || !!cnftMinting.goal}
                    >
                      <span>No More Goals</span>
                    </button>
                  </div>

                  {/* cNFT Minting Terminal */}
                  {cnftMinting.goal && cnftMinting.goal !== 'done' && (
                    <div className="cnft-terminal">
                      <div>🔨 Minting compressed NFT receipt on Solana devnet...</div>
                      <div style={{ height: 3, background: 'var(--bg-surface)', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
                        <div style={{ height: '100%', width: '80%', background: 'var(--accent-gradient-cyan)', borderRadius: 4, transition: 'width 1s ease' }}></div>
                      </div>
                    </div>
                  )}

                  {/* cNFT Receipt */}
                  {cnftReceipts.goal && (
                    <div className="cnft-receipt">
                      <div className="cnft-receipt-title">
                        <span>⛓️ Solana cNFT Prediction Receipt</span>
                        <span style={{ color: cnftReceipts.goal.mintResult?.status === 'minted' ? 'var(--signal-success)' : 'var(--signal-warning)' }}>
                          {cnftReceipts.goal.mintResult?.status === 'minted' ? 'CONFIRMED' : 'PENDING SYNC'}
                        </span>
                      </div>
                      {cnftReceipts.goal.mintResult?.status === 'minted' ? (
                        <div className="cnft-row"><span>Transaction</span><a href={cnftReceipts.goal.mintResult.explorerUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>View on Explorer ↗</a></div>
                      ) : (
                        <div className="cnft-row"><span>Status</span><span>Recorded locally — will sync on-chain</span></div>
                      )}
                      <div className="cnft-row"><span>Prediction</span><span>{cnftReceipts.goal.choice === 'messi' ? 'Lionel Messi' : cnftReceipts.goal.choice === 'mbappe' ? 'Kylian Mbappe' : 'No More Goals'}</span></div>
                      <div className="cnft-row"><span>Points Earned</span><span style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-score)', fontWeight: 700 }}>+{cnftReceipts.goal.pointsGained} XP (×{streakMultiplier})</span></div>
                      <div className="cnft-row"><span>Minted At</span><span>{cnftReceipts.goal.timestamp}</span></div>
                    </div>
                  )}

                  {predictionLocked.goal && (
                    <div style={{ fontSize: 12, color: 'var(--signal-success)', textAlign: 'center', fontWeight: 600, marginTop: 8 }}>
                      ✓ Prediction locked on-chain as cNFT. Awaiting match-event settlement.
                    </div>
                  )}

                  {/* Settlement Simulator */}
                  {predictionLocked.goal && !resolvedMatches.goal && (
                    <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)', marginBottom: 8, textTransform: 'uppercase' }}>⚡ Simulate Match Event Settlement</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" onClick={() => handleSettleMatch('goal', 'messi')} style={{ flex: 1, padding: '8px 0', fontSize: 11, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', color: 'var(--accent-cyan)', borderRadius: 6, cursor: 'pointer' }}>Messi Scores</button>
                        <button className="btn" onClick={() => handleSettleMatch('goal', 'mbappe')} style={{ flex: 1, padding: '8px 0', fontSize: 11, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', color: 'var(--accent-cyan)', borderRadius: 6, cursor: 'pointer' }}>Mbappe Scores</button>
                        <button className="btn" onClick={() => handleSettleMatch('goal', 'none')} style={{ flex: 1, padding: '8px 0', fontSize: 11, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', color: 'var(--accent-cyan)', borderRadius: 6, cursor: 'pointer' }}>No Goal</button>
                      </div>
                    </div>
                  )}

                  {/* Resolution Badge */}
                  {resolvedMatches.goal && (
                    <div style={{ marginTop: 8, padding: '10px 16px', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: 13, fontWeight: 700, background: resolvedMatches.goal.isWin ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', border: `1px solid ${resolvedMatches.goal.isWin ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: resolvedMatches.goal.isWin ? 'var(--signal-success)' : 'var(--signal-error)' }}>
                      {resolvedMatches.goal.isWin ? '🎉 PREDICTION CORRECT! Streak extended!' : '😂 WRONG CALL! Roast card generated.'}
                      <button onClick={() => setShareModalOpen(true)} className="mono" style={{ display: 'block', margin: '8px auto 0', padding: '6px 16px', fontSize: 10, background: 'transparent', border: '1px solid currentColor', color: 'inherit', borderRadius: 100, cursor: 'pointer' }}>View & Share Card →</button>
                    </div>
                  )}
                </div>

                {/* Predict-to-Earn Slip 2: Corner Kick */}
                <div className="poll-card">
                  <div className="poll-header">
                    <span className="poll-tag" style={{ color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.1)' }}>Tap to Predict</span>
                    <span className="poll-timer">In-Play</span>
                  </div>
                  <div className="poll-question">
                    Which team will have the next corner kick?
                  </div>
                  <div className="poll-options">
                    <button
                      className={`poll-option-btn${predictionChoices.corner === 'arg' ? ' selected' : ''}`}
                      onClick={() => handlePredict('corner', 'arg')}
                      disabled={predictionLocked.corner || !!cnftMinting.corner}
                    >
                      <span>Argentina</span>
                    </button>
                    <button
                      className={`poll-option-btn${predictionChoices.corner === 'fra' ? ' selected' : ''}`}
                      onClick={() => handlePredict('corner', 'fra')}
                      disabled={predictionLocked.corner || !!cnftMinting.corner}
                    >
                      <span>France</span>
                    </button>
                  </div>

                  {/* cNFT Minting Terminal */}
                  {cnftMinting.corner && cnftMinting.corner !== 'done' && (
                    <div className="cnft-terminal">
                      <div>🔨 Minting compressed NFT receipt on Solana devnet...</div>
                      <div style={{ height: 3, background: 'var(--bg-surface)', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
                        <div style={{ height: '100%', width: '80%', background: 'var(--accent-gradient-cyan)', borderRadius: 4, transition: 'width 1s ease' }}></div>
                      </div>
                    </div>
                  )}

                  {/* cNFT Receipt */}
                  {cnftReceipts.corner && (
                    <div className="cnft-receipt">
                      <div className="cnft-receipt-title">
                        <span>⛓️ Solana cNFT Prediction Receipt</span>
                        <span style={{ color: cnftReceipts.corner.mintResult?.status === 'minted' ? 'var(--signal-success)' : 'var(--signal-warning)' }}>
                          {cnftReceipts.corner.mintResult?.status === 'minted' ? 'CONFIRMED' : 'PENDING SYNC'}
                        </span>
                      </div>
                      {cnftReceipts.corner.mintResult?.status === 'minted' ? (
                        <div className="cnft-row"><span>Transaction</span><a href={cnftReceipts.corner.mintResult.explorerUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>View on Explorer ↗</a></div>
                      ) : (
                        <div className="cnft-row"><span>Status</span><span>Recorded locally — will sync on-chain</span></div>
                      )}
                      <div className="cnft-row"><span>Prediction</span><span>{cnftReceipts.corner.choice === 'arg' ? 'Argentina' : 'France'}</span></div>
                      <div className="cnft-row"><span>Points Earned</span><span style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-score)', fontWeight: 700 }}>+{cnftReceipts.corner.pointsGained} XP (×{streakMultiplier})</span></div>
                      <div className="cnft-row"><span>Minted At</span><span>{cnftReceipts.corner.timestamp}</span></div>
                    </div>
                  )}

                  {predictionLocked.corner && (
                    <div style={{ fontSize: 12, color: 'var(--signal-success)', textAlign: 'center', fontWeight: 600, marginTop: 8 }}>
                      ✓ Prediction locked on-chain as cNFT. Awaiting match-event settlement.
                    </div>
                  )}

                  {/* Settlement Simulator */}
                  {predictionLocked.corner && !resolvedMatches.corner && (
                    <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)', marginBottom: 8, textTransform: 'uppercase' }}>⚡ Simulate Match Event Settlement</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" onClick={() => handleSettleMatch('corner', 'arg')} style={{ flex: 1, padding: '8px 0', fontSize: 11, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', color: 'var(--accent-cyan)', borderRadius: 6, cursor: 'pointer' }}>Argentina Corner</button>
                        <button className="btn" onClick={() => handleSettleMatch('corner', 'fra')} style={{ flex: 1, padding: '8px 0', fontSize: 11, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', color: 'var(--accent-cyan)', borderRadius: 6, cursor: 'pointer' }}>France Corner</button>
                      </div>
                    </div>
                  )}

                  {/* Resolution Badge */}
                  {resolvedMatches.corner && (
                    <div style={{ marginTop: 8, padding: '10px 16px', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: 13, fontWeight: 700, background: resolvedMatches.corner.isWin ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', border: `1px solid ${resolvedMatches.corner.isWin ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: resolvedMatches.corner.isWin ? 'var(--signal-success)' : 'var(--signal-error)' }}>
                      {resolvedMatches.corner.isWin ? '🎉 PREDICTION CORRECT! Streak extended!' : '😂 WRONG CALL! Roast card generated.'}
                      <button onClick={() => setShareModalOpen(true)} className="mono" style={{ display: 'block', margin: '8px auto 0', padding: '6px 16px', fontSize: 10, background: 'transparent', border: '1px solid currentColor', color: 'inherit', borderRadius: 100, cursor: 'pointer' }}>View & Share Card →</button>
                    </div>
                  )}
                </div>

              </div>

              {/* Livescores table list */}
              <div style={{ marginTop: 24 }}>
                <h2 className="mono" style={{ fontSize: '18px', color: 'var(--ink-primary)', marginBottom: '4px', textAlign: 'left', fontWeight: 800 }}>
                  Live &amp; Upcoming Matches
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginBottom: '16px', textAlign: 'left' }}>
                  Real-time scores and match events, with icon-based momentum indicators — no reading required.
                </p>

                <div className="livescore-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                  {scoresList.map(match => (
                    <div key={match.id} className="livescore-card">
                      <div className="livescore-head">
                        <span className="livescore-league">{match.league}</span>
                        <div className={`livescore-status-badge ${match.status === 'live' ? 'live' : ''}`}>
                          {match.status === 'live' && <span className="live-dot"></span>}
                          <span>
                            {match.status === 'live' ? `LIVE ${match.minute}'` : 
                             match.status === 'ht' ? 'HALF TIME' : 
                             match.status === 'ft' ? 'FULL TIME' : 
                             `SCHEDULED ${match.time}`}
                          </span>
                        </div>
                      </div>

                      <div className="livescore-body">
                        <div className="livescore-team-col home">
                          <span className="livescore-team-name">{match.home}</span>
                        </div>
                        
                        <div className={`livescore-score-box ${goalHighlight[match.id] ? 'goal-flash' : ''}`}>
                          {match.status === 'scheduled' ? (
                            <span style={{ fontSize: '14px', opacity: 0.6 }}>VS</span>
                          ) : (
                            <span>{match.homeScore} - {match.awayScore}</span>
                          )}
                        </div>

                        <div className="livescore-team-col away">
                          <span className="livescore-team-name">{match.away}</span>
                        </div>
                      </div>

                      {/* Icon-coded event log */}
                      {match.events.length > 0 && (
                        <div className="livescore-events-drawer">
                          {match.events.map((evt) => {
                            const visual = getEventVisual(evt);
                            return (
                              <div key={evt.id} className="livescore-event-item">
                                <span style={{ color: `var(${visual.signal})` }}>{visual.emoji} {evt.player || (evt.team === 'home' ? match.home : match.away)} {evt.minute}&apos;</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {match.status === 'live' && (
                        <div style={{ padding: '0 16px 12px' }}>
                          <WhyButton
                            latestEvent={match.events[match.events.length - 1]}
                            matchContext={{ teamName: (side) => (side === 'home' ? match.home : match.away) }}
                          />
                        </div>
                      )}

                      <div className="livescore-foot">
                        <span className="livescore-stadium">📍 {match.stadium}</span>

                        <div className="livescore-actions">
                          {match.status === 'live' ? (
                            <button className="livescore-btn predict-btn" onClick={() => setActiveTab('markets')}>
                              Predict In-Play
                            </button>
                          ) : match.status === 'scheduled' ? (
                            <button className="livescore-btn" onClick={() => setActiveTab('markets')}>
                              Predict Pre-Match
                            </button>
                          ) : (
                            <button className="livescore-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
                              Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB: FAN REWARDS
              ========================================== */}
          {activeTab === 'rewards' && (
            <div className="dash-tab-panel active" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 32 }}>
              {redemptionMessage && (
                <div className="mono" style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid var(--accent-cyan)',
                  color: 'var(--accent-cyan)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  textAlign: 'center'
                }}>
                  {redemptionMessage}
                </div>
              )}

              <div className="rewards-grid">
                {rewardsList.map((reward) => (
                  <div className="reward-card" key={reward.id}>
                    <div className="reward-img-container">
                      <Image 
                        src={reward.image} 
                        alt={reward.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 300px"
                        style={{ objectFit: 'cover' }} 
                      />
                      <div className="badge-glass" style={{ position: 'absolute', top: 12, left: 12, fontSize: 8.5 }}>
                        {reward.category}
                      </div>
                    </div>
                    <div className="reward-card-info">
                      <div className="reward-title">{reward.title}</div>
                      
                      <div className="reward-cost-badge">
                        🏆 {reward.cost} SSU Points
                      </div>

                      <div className="reward-progress">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-secondary)' }}>
                          <span>Claimed</span>
                          <span>{reward.total - reward.stock} / {reward.total}</span>
                        </div>
                        <div className="reward-progress-track">
                          <div 
                            className="reward-progress-bar" 
                            style={{ width: `${((reward.total - reward.stock) / reward.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleRedeem(reward)}
                        disabled={reward.stock <= 0}
                        className="btn btn-cyan" 
                        style={{ 
                          marginTop: 'auto', 
                          width: '100%', 
                          padding: '10px 0', 
                          fontSize: 12.5,
                          background: reward.stock <= 0 ? 'var(--bg-inset)' : 'var(--accent-gradient-cyan)',
                          color: reward.stock <= 0 ? 'var(--ink-dim)' : '#040308',
                          border: reward.stock <= 0 ? '1px solid var(--border-subtle)' : 'none'
                        }}
                      >
                        {reward.stock <= 0 ? 'Out of Stock' : 'Redeem Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB: LEADERBOARD (Global + Squads)
              ========================================== */}
          {activeTab === 'leaderboard' && (
            <div className="dash-tab-panel active" style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 32 }}>
              <div className="poll-card" style={{ padding: 30 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, textTransform: 'uppercase', marginBottom: 16 }}>SSU Loyalty Leaderboard</h3>
                
                {/* Scope Selector */}
                <div className="squad-selector" ref={squadTabsRef} style={{ position: 'relative' }}>
                  <div 
                    className="squad-pill-slider" 
                    style={{ 
                      position: 'absolute', 
                      top: '4px', 
                      bottom: '4px', 
                      left: `${squadPillStyle.left}px`, 
                      width: `${squadPillStyle.width}px`, 
                      background: 'rgba(6, 182, 212, 0.08)', 
                      border: '1px solid rgba(6, 182, 212, 0.15)',
                      borderRadius: '8px', 
                      transition: 'left 0.4s cubic-bezier(0.65, 0, 0.35, 1), width 0.4s cubic-bezier(0.65, 0, 0.35, 1)', 
                      zIndex: 0,
                      pointerEvents: 'none'
                    }}
                  />
                  <button className={`squad-tab-btn${leaderboardScope === 'global' ? ' active' : ''}`} onClick={() => setLeaderboardScope('global')} style={{ position: 'relative', zIndex: 1, transition: 'color 0.4s cubic-bezier(0.65, 0, 0.35, 1)' }}>🌍 Global Rankings</button>
                  <button className={`squad-tab-btn${leaderboardScope === 'squads' ? ' active' : ''}`} onClick={() => setLeaderboardScope('squads')} style={{ position: 'relative', zIndex: 1, transition: 'color 0.4s cubic-bezier(0.65, 0, 0.35, 1)' }}>👥 Telegram Squads</button>
                </div>

                {leaderboardScope === 'global' && (
                  <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-line)', color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                          <th style={{ padding: '12px 10px' }}>Rank</th>
                          <th style={{ padding: '12px 10px' }}>Fan Handle</th>
                          <th style={{ padding: '12px 10px' }}>🔥 Streak</th>
                          <th style={{ padding: '12px 10px' }}>Status Tier</th>
                          <th style={{ padding: '12px 10px', textAlign: 'right' }}>XP</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: 14 }}>
                        {[
                          { rank: 1, handle: '@SassMaster', points: 2840, streak: 12 },
                          { rank: 2, handle: '@El_Pundit', points: 2480, streak: predictionStreak },
                          { rank: 3, handle: '@GoonerWitty', points: 2110, streak: 6 },
                          { rank: 4, handle: '@SolanaFanatic', points: 1950, streak: 3 },
                          { rank: 5, handle: '@Messi_Goals', points: 1780, streak: 1 }
                        ].map((row) => {
                          const tier = row.points >= 2500 ? 'PLATINUM' : row.points >= 1900 ? 'GOLD' : 'SILVER';
                          return (
                          <tr key={row.rank} style={{ borderBottom: '1px solid var(--border-subtle)', background: row.handle === '@El_Pundit' ? 'rgba(6,182,212,0.03)' : 'transparent' }}>
                            <td style={{ padding: '16px 10px', fontWeight: 700, color: row.rank <= 3 ? 'var(--accent-amber)' : 'inherit' }}>#{row.rank}</td>
                            <td style={{ padding: '16px 10px', fontWeight: 600 }}>
                              {row.handle} {row.handle === '@El_Pundit' && <span style={{ fontSize: 10, color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.1)', padding: '2px 6px', borderRadius: 4, marginLeft: 6 }}>You</span>}
                            </td>
                            <td style={{ padding: '16px 10px', fontFamily: 'var(--font-score)', fontWeight: 700, color: row.streak >= 5 ? 'var(--accent-amber)' : 'var(--ink-secondary)' }}>
                              {row.streak > 0 ? `🔥 ${row.streak}x` : '—'}
                            </td>
                            <td style={{ padding: '16px 10px' }}>
                              <span style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                color: tier === 'PLATINUM' ? '#e2e8f0' : tier === 'GOLD' ? 'var(--accent-amber)' : '#a1a1aa',
                                background: 'var(--bg-surface-raised)',
                                padding: '4px 8px',
                                borderRadius: 4,
                                border: '1px solid var(--border-subtle)'
                              }}>{tier}</span>
                            </td>
                            <td style={{ padding: '16px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-score)' }}>{row.points} XP</td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {leaderboardScope === 'squads' && (
                  <div>
                    {/* Squad Selection */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      {['@SassSquad', '@ARG_Ultras', '@PremBantz'].map((squad) => (
                        <button 
                          key={squad}
                          onClick={() => setActiveSquad(squad)}
                          style={{
                            padding: '8px 16px',
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            background: activeSquad === squad ? 'rgba(6,182,212,0.1)' : 'var(--bg-inset)',
                            border: `1px solid ${activeSquad === squad ? 'rgba(6,182,212,0.3)' : 'var(--border-subtle)'}`,
                            color: activeSquad === squad ? 'var(--accent-cyan)' : 'var(--ink-dim)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >{squad}</button>
                      ))}
                    </div>

                    <div style={{ fontSize: 13, color: 'var(--ink-secondary)', marginBottom: 12 }}>
                      Squad standings for <strong style={{ color: 'var(--accent-cyan)' }}>{activeSquad}</strong> — friends vs friends leaderboard scoped to your Telegram group.
                    </div>

                    <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                      <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-line)', color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                            <th style={{ padding: '12px 10px' }}>Rank</th>
                            <th style={{ padding: '12px 10px' }}>Member</th>
                            <th style={{ padding: '12px 10px' }}>🔥 Streak</th>
                            <th style={{ padding: '12px 10px', textAlign: 'right' }}>Win Rate</th>
                            <th style={{ padding: '12px 10px', textAlign: 'right' }}>SSU Score</th>
                          </tr>
                        </thead>
                        <tbody style={{ fontSize: 14 }}>
                          {(activeSquad === '@SassSquad' ? [
                            { rank: 1, handle: '@El_Pundit', streak: predictionStreak, winRate: '68%', points: ssuBalance },
                            { rank: 2, handle: '@SassyKid', streak: 3, winRate: '61%', points: 1820 },
                            { rank: 3, handle: '@CryptoGooner', streak: 0, winRate: '54%', points: 1340 },
                            { rank: 4, handle: '@Web3Messi', streak: 1, winRate: '48%', points: 990 },
                          ] : activeSquad === '@ARG_Ultras' ? [
                            { rank: 1, handle: '@Messi_Goals', streak: 7, winRate: '74%', points: 2180 },
                            { rank: 2, handle: '@BuenosAires10', streak: 5, winRate: '65%', points: 1920 },
                            { rank: 3, handle: '@El_Pundit', streak: predictionStreak, winRate: '68%', points: ssuBalance },
                          ] : [
                            { rank: 1, handle: '@GoonerWitty', streak: 6, winRate: '71%', points: 2110 },
                            { rank: 2, handle: '@VARisAJoke', streak: 2, winRate: '55%', points: 1650 },
                            { rank: 3, handle: '@OwnGoalKing', streak: 0, winRate: '42%', points: 870 },
                          ]).map((row) => (
                            <tr key={row.rank} style={{ borderBottom: '1px solid var(--border-subtle)', background: row.handle === '@El_Pundit' ? 'rgba(6,182,212,0.03)' : 'transparent' }}>
                              <td style={{ padding: '16px 10px', fontWeight: 700, color: row.rank <= 3 ? 'var(--accent-amber)' : 'inherit' }}>#{row.rank}</td>
                              <td style={{ padding: '16px 10px', fontWeight: 600 }}>
                                {row.handle} {row.handle === '@El_Pundit' && <span style={{ fontSize: 10, color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.1)', padding: '2px 6px', borderRadius: 4, marginLeft: 6 }}>You</span>}
                              </td>
                              <td style={{ padding: '16px 10px', fontFamily: 'var(--font-score)', fontWeight: 700, color: row.streak >= 5 ? 'var(--accent-amber)' : 'var(--ink-secondary)' }}>
                                {row.streak > 0 ? `🔥 ${row.streak}x` : '—'}
                              </td>
                              <td style={{ padding: '16px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{row.winRate}</td>
                              <td style={{ padding: '16px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-score)' }}>{row.points} Pts</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ==========================================
          SHARE MODAL: Win / Roast Card with Aspect Ratio Switcher
          ========================================== */}
      {shareModalOpen && (
        <div className="share-modal-overlay" onClick={() => setShareModalOpen(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, textTransform: 'uppercase' }}>
                {shareCardType === 'win' ? '🎉 Share Your Win' : '🤡 Share Your Roast'}
              </h3>
              <button onClick={() => setShareModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ink-dim)', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {/* Aspect Ratio Switcher */}
            <div className="ratio-tabs" ref={ratioTabsRef} style={{ position: 'relative' }}>
              <div 
                className="ratio-pill-slider" 
                style={{ 
                  position: 'absolute', 
                  top: '4px', 
                  bottom: '4px', 
                  left: `${ratioPillStyle.left}px`, 
                  width: `${ratioPillStyle.width}px`, 
                  background: 'var(--bg-surface)', 
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '100px', 
                  transition: 'left 0.4s cubic-bezier(0.65, 0, 0.35, 1), width 0.4s cubic-bezier(0.65, 0, 0.35, 1)', 
                  zIndex: 0,
                  pointerEvents: 'none'
                }}
              />
              <button className={`ratio-btn${shareRatio === '16-9' ? ' active' : ''}`} onClick={() => setShareRatio('16-9')} style={{ position: 'relative', zIndex: 1, transition: 'color 0.4s cubic-bezier(0.65, 0, 0.35, 1)' }}>X / Twitter (16:9)</button>
              <button className={`ratio-btn${shareRatio === '9-16' ? ' active' : ''}`} onClick={() => setShareRatio('9-16')} style={{ position: 'relative', zIndex: 1, transition: 'color 0.4s cubic-bezier(0.65, 0, 0.35, 1)' }}>IG Story (9:16)</button>
              <button className={`ratio-btn${shareRatio === '1-1' ? ' active' : ''}`} onClick={() => setShareRatio('1-1')} style={{ position: 'relative', zIndex: 1, transition: 'color 0.4s cubic-bezier(0.65, 0, 0.35, 1)' }}>Telegram (1:1)</button>
            </div>

            {/* Preview Viewport */}
            <div className="share-preview-viewport">
              <div className={`preview-card-frame aspect-${shareRatio}`} style={{ borderColor: shareCardType === 'win' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)' }}>
                {/* Card Header */}
                <div>
                  <div className="preview-card-watermark">kickstar.app • {shareCardCategory}</div>
                  <div style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontSize: shareRatio === '9-16' ? 18 : 22, 
                    fontWeight: 900, 
                    textTransform: 'uppercase', 
                    marginTop: 12,
                    color: shareCardType === 'win' ? 'var(--signal-success)' : 'var(--signal-error)',
                    lineHeight: 1.15
                  }}>
                    {shareCardType === 'win' ? 'PREDICTION CORRECT' : 'ROAST CARD'}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ 
                  fontSize: shareRatio === '9-16' ? 13 : 15, 
                  lineHeight: 1.5, 
                  color: 'var(--ink-primary)',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {shareCardText}
                </div>

                {/* Card Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
                  <div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)' }}>@El_Pundit</div>
                    <div style={{ fontSize: 10, color: 'var(--accent-amber)', fontFamily: 'var(--font-score)', fontWeight: 700 }}>🔥 {predictionStreak}x Streak • {streakMultiplier}x Multiplier</div>
                  </div>
                  <div style={{ 
                    fontSize: 9, 
                    fontFamily: 'var(--font-mono)', 
                    color: shareCardType === 'win' ? 'var(--signal-success)' : 'var(--signal-error)', 
                    textAlign: 'right',
                    opacity: 0.7
                  }}>
                    Powered by TxLINE<br/>Solana cNFT Verified
                  </div>
                </div>
              </div>
            </div>

            {/* Export Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                className="btn btn-cyan" 
                onClick={handleCopyText}
                style={{ 
                  flex: 1, 
                  padding: '12px 0', 
                  fontSize: 13,
                  position: 'relative',
                  overflow: 'hidden',
                  background: isCopied ? 'rgba(16, 185, 129, 0.1)' : 'var(--accent-cyan)',
                  border: isCopied ? '1px solid var(--signal-success)' : '1px solid transparent',
                  color: isCopied ? 'var(--signal-success)' : '#031418',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 8,
                  transform: 'scale(1)',
                  transition: 'transform 0.2s ease'
                }}>
                  {isCopied ? (
                    <>
                      <svg 
                        className="copy-success-icon"
                        viewBox="0 0 24 24" 
                        style={{ 
                          width: 16, 
                          height: 16, 
                          fill: 'none', 
                          stroke: 'currentColor', 
                          strokeWidth: 3,
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round'
                        }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ transition: 'opacity 0.2s', opacity: 1, fontWeight: 700 }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <svg 
                        viewBox="0 0 24 24" 
                        style={{ 
                          width: 16, 
                          height: 16, 
                          fill: 'none', 
                          stroke: 'currentColor', 
                          strokeWidth: 2,
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          transition: 'opacity 0.2s'
                        }}
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span style={{ transition: 'opacity 0.2s', opacity: 1 }}>Copy to Clipboard</span>
                    </>
                  )}
                </div>
              </button>
              <button className="btn" style={{ flex: 1, padding: '12px 0', fontSize: 13, background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', color: 'var(--ink-primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                💾 Download Image
              </button>
            </div>

            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)', textAlign: 'center' }}>
              Card auto-formatted for {shareRatio === '16-9' ? 'X/Twitter (16:9)' : shareRatio === '9-16' ? 'Instagram/WhatsApp Story (9:16)' : 'Telegram Square (1:1)'}. Export all three sizes at once.
            </div>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', paddingBlock: 24, textAlign: 'center', fontSize: 13, color: 'var(--ink-dim)' }}>
        Kickstar Dashboard © 2026. 🏆 Non-gambling loyalty platform — bragging rights only.
      </footer>

      {xpRevealAmount !== null && (
        <XPReveal amount={xpRevealAmount} onDone={() => setXpRevealAmount(null)} />
      )}
    </div>
  );
}
