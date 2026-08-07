// ============================================================
//  SareeCrown.jsx — Customer Saree Crown Campaign Page
//  Route: /saree-crown
//  Features:
//   - Crown Drop intro animation
//   - Dynamic campaign/product loading (no hardcoded IDs)
//   - Timezone-safe countdown & dynamic status calculated reactively
//   - Campaign status states: disabled, not_started, active, ended
//   - Single-vote selection with real API submit (no optimistic UI)
//   - Post-vote locked reward state
//   - Auth-aware: login prompt if unauthenticated
//   - Cinematic entrance animation (one-time, guarded by ref)
//   - Winner reveal cinematic sequence (one-time, guarded by ref)
//   - Multi-stage page flow (Hero + Countdown first, Product Reveal on click)
// ============================================================
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '../routes/paths';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import styles from './SareeCrown.module.css';

/* ── Helper — format INR price ───────────────────────────── */
function formatPrice(price) {
  return Number(price).toLocaleString('en-IN');
}

/* ── Helper — campaign time countdown label ──────────────── */
function timeLabel(dateStr, now = new Date()) {
  if (!dateStr) return '';
  const target = new Date(dateStr);
  const diff   = target - now;
  if (diff <= 0) return '';
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}

/* ── Helper — split countdown into parts ─────────────────── */
function getCountdownParts(dateStr, now = new Date()) {
  if (!dateStr) return { days: 0, hours: 0, mins: 0, secs: 0 };
  const target = new Date(dateStr);
  const diff   = target - now;
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs  = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, mins, secs };
}

// ── Component ────────────────────────────────────────────────
function SareeCrown() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Campaign state
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [campaign, setCampaign]               = useState(null);
  const [currentTime, setCurrentTime]         = useState(new Date());

  // Vote state
  const [myVote, setMyVote]         = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [voting, setVoting]         = useState(false);
  const [voteError, setVoteError]   = useState('');

  // Page stage states
  const [voteStarted, setVoteStarted]         = useState(false);
  const [transitionPhase, setTransitionPhase] = useState(0); // 0 = idle, 1 = curtains closed, 2 = curtains opening, 3 = done

  // Animation state — entrance (one-time, ref-guarded)
  const entrancePlayedRef = useRef(false);
  const [entrancePhase, setEntrancePhase] = useState(0);
  // 0 = pre-intro (curtains closed, crown invisible)
  // 1 = crown and glow visible at center, curtains still closed
  // 2 = curtain splits and starts moving left/right
  // 3 = curtain fully moved, main hero title and breadcrumbs start fade up
  // 4 = divider, countdown cards fade up
  // 5 = product cards fade in stagger (unused if voteStarted is false, but keeps indexes clean)
  // 6 = complete

  // Winner reveal state (one-time, ref-guarded)
  const winnerRevealPlayedRef = useRef(false);
  const [winnerRevealPhase, setWinnerRevealPhase] = useState(0);
  // 0 = idle, 1 = dim, 2 = crown glow, 3 = title, 4 = countdown 3, 5 = countdown 2, 6 = countdown 1, 7 = reveal

  // ── Tick timer for reactive countdowns & status transitions ──
  useEffect(() => {
    if (loadingCampaign || !campaign?.enabled) return;
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [loadingCampaign, campaign?.enabled]);

  // ── Derived status computed in real-time (timezone-independent) ──
  const currentStatus = useMemo(() => {
    if (!campaign || !campaign.enabled) return 'disabled';
    if (campaign.votingStopped) return 'ended';
    const start = campaign.votingStart ? new Date(campaign.votingStart) : null;
    const end   = campaign.votingEnd   ? new Date(campaign.votingEnd)   : null;

    if (start && currentTime < start) return 'not_started';
    if (end && currentTime > end) return 'ended';
    return 'active';
  }, [campaign, currentTime]);

  // ── Load campaign + my vote on mount ──────────────────────
  const loadData = useCallback(async () => {
    setLoadingCampaign(true);
    try {
      const data = await api.getSareeCrownCampaign();
      setCampaign(data);

      const start = data.votingStart ? new Date(data.votingStart) : null;
      const end   = data.votingEnd   ? new Date(data.votingEnd)   : null;
      const now   = new Date();
      let initStatus = 'disabled';
      if (data.enabled) {
        if (data.votingStopped) initStatus = 'ended';
        else if (start && now < start) initStatus = 'not_started';
        else if (end && now > end) initStatus = 'ended';
        else initStatus = 'active';
      }

      if (isAuthenticated && data.enabled && initStatus !== 'disabled') {
        try {
          const voteData = await api.getMySareeCrownVote();
          setMyVote(voteData);
          if (voteData.voted) {
            setSelectedId(voteData.productId);
          }
        } catch (_) {
          setMyVote({ voted: false });
        }
      }
    } catch (err) {
      console.warn('[SareeCrown] Failed to load campaign:', err.message);
      setCampaign({ enabled: false, products: [] });
    } finally {
      setLoadingCampaign(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, [loadData]);

  // ── Entrance animation — one-time, fires only after load, not on re-renders ──
  useEffect(() => {
    if (loadingCampaign) return;
    if (!campaign?.enabled) {
      setEntrancePhase(6);
      return;
    }
    if (entrancePlayedRef.current) return;
    entrancePlayedRef.current = true;

    // Step 1: Crown and golden light appear on closed curtain
    setEntrancePhase(1);
    
    // Step 2: Curtains start opening from the center
    const t1 = setTimeout(() => setEntrancePhase(2), 1500);
    
    // Step 3: Curtains finished moving, start hero title reveal
    const t2 = setTimeout(() => setEntrancePhase(3), 3500);
    
    // Step 4: Divider and countdown reveal
    const t3 = setTimeout(() => setEntrancePhase(4), 4100);
    
    // Step 5: Hero animations completed, ready for interaction
    const t4 = setTimeout(() => setEntrancePhase(5), 4700);

    return () => { 
      clearTimeout(t1); 
      clearTimeout(t2); 
      clearTimeout(t3); 
      clearTimeout(t4); 
    };
  }, [loadingCampaign, campaign?.enabled]);

  // ── Winner reveal animation — one-time ─────────────────────
  useEffect(() => {
    if (!campaign?.winnerRevealed) return;
    if (winnerRevealPlayedRef.current) return;
    winnerRevealPlayedRef.current = true;

    setWinnerRevealPhase(1);
    const t1 = setTimeout(() => setWinnerRevealPhase(2), 600);
    const t2 = setTimeout(() => setWinnerRevealPhase(3), 1200);
    const t3 = setTimeout(() => setWinnerRevealPhase(4), 1900);  // "3"
    const t4 = setTimeout(() => setWinnerRevealPhase(5), 2700);  // "2"
    const t5 = setTimeout(() => setWinnerRevealPhase(6), 3500);  // "1"
    const t6 = setTimeout(() => setWinnerRevealPhase(7), 4300);  // reveal

    return () => { [t1,t2,t3,t4,t5,t6].forEach(clearTimeout); };
  }, [campaign?.winnerRevealed]);

  // ── Start voting stage curtain transition ─────────────────
  const handleStartVoting = () => {
    // 1. Close transition curtains
    setTransitionPhase(1);

    // 2. Midpoint: Switch layout underneath to candidates, start opening
    setTimeout(() => {
      setVoteStarted(true);
      setTransitionPhase(2);
    }, 600);

    // 3. Complete transition
    setTimeout(() => {
      setTransitionPhase(3);
    }, 1800);
  };

  // ── Handle card selection ─────────────────────────────────
  function handleSelectProduct(id) {
    if (myVote?.voted) return;
    if (currentStatus !== 'active') return;
    setSelectedId(prev => prev === id ? null : id);
    setVoteError('');
  }

  // ── Handle vote submission (no optimistic UI) ─────────────
  async function handleVote() {
    if (!selectedId) return;
    if (!isAuthenticated) {
      navigate(PATHS.LOGIN);
      return;
    }

    setVoting(true);
    setVoteError('');

    try {
      await api.castSareeCrownVote(selectedId);
      setMyVote({ voted: true, productId: selectedId });
    } catch (err) {
      setVoteError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setVoting(false);
    }
  }

  // Navigate to product detail page
  function goToProduct(e, productId) {
    e.stopPropagation();
    navigate(`/product/${productId}`);
  }

  // ── Derived state ─────────────────────────────────────────
  const hasVoted       = myVote?.voted === true;
  const votedProductId = myVote?.productId;
  const votedProduct   = (campaign?.products || []).find(p => p.id === votedProductId);
  const canVote        = currentStatus === 'active' && !hasVoted;

  // ─────────────────────────────────────────────────────────
  // RENDER STATES
  // ─────────────────────────────────────────────────────────

  // Loading
  if (loadingCampaign) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingCrown} aria-hidden="true">👑</div>
          <p className={styles.loadingText}>Loading Saree Crown…</p>
          <div className={styles.loadingBar} />
        </div>
      </div>
    );
  }

  // Campaign disabled or no campaign
  if (!campaign?.enabled) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <Breadcrumb />
          <HeroSection entrancePhase={5} />
          <div className={styles.notActiveWrapper}>
            <div className={styles.notActiveIcon} aria-hidden="true">👑</div>
            <h2 className={styles.notActiveTitle}>Saree Crown</h2>
            <p className={styles.notActiveText}>The Crown campaign is not active right now. Check back soon!</p>
            <Link to={PATHS.SHOP} className={styles.shopBtn}>Explore Sarees</Link>
          </div>
        </div>
      </div>
    );
  }

  // Winner Revealed state
  if (campaign?.winnerRevealed) {
    return (
      <div className={styles.pageWrapper}>
        {/* Winner Reveal Curtain Ceremony Overlay */}
        {winnerRevealPhase < 7 && (
          <div 
            className={`${styles.curtainOverlay} ${winnerRevealPhase >= 7 ? styles.curtainOverlayHidden : ''}`}
            aria-hidden="true"
          >
            <div className={`${styles.curtainPanel} ${styles.curtainLeft} ${winnerRevealPhase >= 7 ? styles.curtainLeftOpen : ''}`} />
            <div className={`${styles.curtainPanel} ${styles.curtainRight} ${winnerRevealPhase >= 7 ? styles.curtainRightOpen : ''}`} />
            
            <div className={styles.curtainIntroCenter}>
              <div className={styles.curtainCrown} style={{ opacity: 1, transform: 'scale(1)' }}>
                <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.watermarkCrownSvg}>
                  <path d="M10 65 L18 28 L38 48 L50 18 L62 48 L82 28 L90 65 Z" stroke="rgba(212, 175, 55, 0.4)" strokeWidth="2.5" fill="rgba(212, 175, 55, 0.08)" strokeLinejoin="round" />
                  <circle cx="18" cy="24" r="3.5" fill="rgba(212, 175, 55, 0.45)" />
                  <circle cx="50" cy="14" r="4.5" fill="rgba(212, 175, 55, 0.55)" />
                  <circle cx="82" cy="24" r="3.5" fill="rgba(212, 175, 55, 0.45)" />
                  <circle cx="38" cy="44" r="2.5" fill="rgba(212, 175, 55, 0.4)" />
                  <circle cx="62" cy="44" r="2.5" fill="rgba(212, 175, 55, 0.4)" />
                  <path d="M15 70 H85 V74 H15 Z" fill="rgba(212, 175, 55, 0.4)" />
                </svg>
              </div>
              <div className={styles.curtainGlowRing} style={{ opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }} />
              <div className={styles.curtainLightSweep} style={{ opacity: 1, transform: 'translateX(-50%) scaleX(1)' }} />
              
              {winnerRevealPhase >= 3 && (
                <p className={styles.revealTitleText}>THE CROWN WINNER IS…</p>
              )}
              
              {winnerRevealPhase === 4 && <div className={styles.revealCountNum}>3</div>}
              {winnerRevealPhase === 5 && <div className={styles.revealCountNum}>2</div>}
              {winnerRevealPhase === 6 && <div className={styles.revealCountNum}>1</div>}
            </div>
          </div>
        )}

        <div className={styles.container}>
          <Breadcrumb />
          <HeroSection entrancePhase={5} />

          {campaign.winnerProduct ? (
            <WinnerRevealSection
              campaign={campaign}
              navigate={navigate}
              revealPhase={winnerRevealPhase}
            />
          ) : !isAuthenticated ? (
            <div className={styles.revealedNoRewardWrapper}>
              <div className={styles.revealedIcon}>🏆</div>
              <h2 className={styles.revealedTitle}>Crown Revealed</h2>
              <p className={styles.revealedText}>
                The Crown winner has been revealed to participating voters.
              </p>
              <p className={styles.revealedSubtext}>
                Please log in to check your reward eligibility.
              </p>
              <Link to={PATHS.LOGIN} className={styles.shopBtn}>Log In / Register</Link>
            </div>
          ) : (
            <div className={styles.revealedNoRewardWrapper}>
              <div className={styles.revealedIcon}>🏆</div>
              <h2 className={styles.revealedTitle}>Crown Revealed</h2>
              <p className={styles.revealedText}>
                The Crown winner has been revealed to participating voters.
              </p>
              <p className={styles.revealedSubtext}>
                Only customers who cast a vote are eligible for the participation reward.
              </p>
              <Link to={PATHS.SHOP} className={styles.shopBtn}>Explore Sarees</Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Campaign not yet started
  if (currentStatus === 'not_started') {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <Breadcrumb />
          <HeroSection entrancePhase={5} />
          <div className={`${styles.statusBanner} ${styles.statusBannerSoon}`}>
            ⏳ Voting opens soon
            {campaign.votingStart && (
              <span>— in {timeLabel(campaign.votingStart, currentTime)}</span>
            )}
          </div>
          <div className={styles.notActiveWrapper}>
            <p className={styles.notActiveText}>Come back when voting opens to choose your favourite saree.</p>
            <Link to={PATHS.SHOP} className={styles.shopBtn}>Browse Collection</Link>
          </div>
        </div>
      </div>
    );
  }

  // Campaign ended (no reveal yet)
  if (currentStatus === 'ended') {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <Breadcrumb />
          <HeroSection entrancePhase={5} />
          <div className={`${styles.statusBanner} ${styles.statusBannerEnded}`}>
            🏁 Voting has ended — the Crown reward is being prepared for reveal
          </div>

          {hasVoted ? (
            <LockedRewardSection votedProduct={votedProduct} campaign={campaign} currentTime={currentTime} />
          ) : (
            <div className={styles.notActiveWrapper}>
              <p className={styles.notActiveText}>Voting for this campaign has closed.</p>
              <Link to={PATHS.SHOP} className={styles.shopBtn}>Explore Sarees</Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ACTIVE CAMPAIGN — main voting UI ─────────────────────
  return (
    <div className={styles.pageWrapper}>
      
      {/* Stage 1: Initial Event Entrance Silk Curtain */}
      {entrancePhase < 3 && (
        <div 
          className={`${styles.curtainOverlay} ${entrancePhase >= 2 ? styles.curtainOverlayHidden : ''}`}
          aria-hidden="true"
        >
          <div className={`${styles.curtainPanel} ${styles.curtainLeft} ${entrancePhase >= 2 ? styles.curtainLeftOpen : ''}`} />
          <div className={`${styles.curtainPanel} ${styles.curtainRight} ${entrancePhase >= 2 ? styles.curtainRightOpen : ''}`} />
          
          <div className={`${styles.curtainIntroCenter} ${entrancePhase >= 2 ? styles.curtainIntroCenterOut : ''}`}>
            <div className={`${styles.curtainCrown} ${entrancePhase >= 1 ? styles.curtainCrownVisible : ''}`}>
              <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.watermarkCrownSvg}>
                <path d="M10 65 L18 28 L38 48 L50 18 L62 48 L82 28 L90 65 Z" stroke="rgba(212, 175, 55, 0.4)" strokeWidth="2.5" fill="rgba(212, 175, 55, 0.08)" strokeLinejoin="round" />
                <circle cx="18" cy="24" r="3.5" fill="rgba(212, 175, 55, 0.45)" />
                <circle cx="50" cy="14" r="4.5" fill="rgba(212, 175, 55, 0.55)" />
                <circle cx="82" cy="24" r="3.5" fill="rgba(212, 175, 55, 0.45)" />
                <circle cx="38" cy="44" r="2.5" fill="rgba(212, 175, 55, 0.4)" />
                <circle cx="62" cy="44" r="2.5" fill="rgba(212, 175, 55, 0.4)" />
                <path d="M15 70 H85 V74 H15 Z" fill="rgba(212, 175, 55, 0.4)" />
              </svg>
            </div>
            <div className={`${styles.curtainGlowRing} ${entrancePhase >= 1 ? styles.curtainGlowRingVisible : ''}`} />
            <div className={`${styles.curtainLightSweep} ${entrancePhase >= 1 ? styles.curtainLightSweepVisible : ''}`} />
            <div className={styles.curtainIntroParticles}>
              {[...Array(8)].map((_, i) => (
                <span key={i} className={styles.curtainIntroParticle} style={{ '--ci': i }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stage 2: Hero Transition Curtain (When customer clicks VOTE NOW) */}
      {(transitionPhase === 1 || transitionPhase === 2) && (
        <div 
          className={`${styles.curtainOverlay} ${transitionPhase === 2 ? styles.curtainOverlayHidden : ''}`}
          aria-hidden="true"
        >
          <div className={`${styles.curtainPanel} ${styles.curtainLeft} ${transitionPhase === 2 ? styles.curtainLeftOpen : ''}`} />
          <div className={`${styles.curtainPanel} ${styles.curtainRight} ${transitionPhase === 2 ? styles.curtainRightOpen : ''}`} />
          
          <div className={`${styles.curtainIntroCenter} ${transitionPhase === 2 ? styles.curtainIntroCenterOut : ''}`}>
            <div className={styles.curtainCrown} style={{ opacity: 1, transform: 'scale(1)' }}>
              <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.watermarkCrownSvg}>
                <path d="M10 65 L18 28 L38 48 L50 18 L62 48 L82 28 L90 65 Z" stroke="rgba(212, 175, 55, 0.4)" strokeWidth="2.5" fill="rgba(212, 175, 55, 0.08)" strokeLinejoin="round" />
                <circle cx="18" cy="24" r="3.5" fill="rgba(212, 175, 55, 0.45)" />
                <circle cx="50" cy="14" r="4.5" fill="rgba(212, 175, 55, 0.55)" />
                <circle cx="82" cy="24" r="3.5" fill="rgba(212, 175, 55, 0.45)" />
                <circle cx="38" cy="44" r="2.5" fill="rgba(212, 175, 55, 0.4)" />
                <circle cx="62" cy="44" r="2.5" fill="rgba(212, 175, 55, 0.4)" />
                <path d="M15 70 H85 V74 H15 Z" fill="rgba(212, 175, 55, 0.4)" />
              </svg>
            </div>
            <div className={styles.curtainGlowRing} style={{ opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }} />
            <div className={styles.curtainLightSweep} style={{ opacity: 1, transform: 'translateX(-50%) scaleX(1)' }} />
          </div>
        </div>
      )}

      <div className={styles.container}>

        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Cinematic Hero & Countdown (Only shown before starting vote ceremony and when user has not voted) */}
        {!voteStarted && !hasVoted && (
          <>
            <HeroSection entrancePhase={entrancePhase} />

            <div className={`${styles.countdownWrapper} ${entrancePhase >= 4 ? styles.countdownVisible : ''}`}>
              <div className={styles.countdownHeaderRow}>
                <div className={styles.countdownHeaderLine} />
                <p className={styles.countdownLabel}>VOTING ENDS IN</p>
                <div className={styles.countdownHeaderLine} />
              </div>

              <LuxuryCountdown dateStr={campaign.votingEnd} currentTime={currentTime} />

              <p className={styles.countdownSubtitle}>
                Choose the Saree That Deserves the Crown <span className={styles.subCrownEmoji}>👑</span>
              </p>
            </div>
          </>
        )}

        {/* If user has voted, show locked state */}
        {hasVoted ? (
          <LockedRewardSection votedProduct={votedProduct} campaign={campaign} currentTime={currentTime} />
        ) : !voteStarted ? (
          /* Render Step 4: Hero + Countdown + VOTE NOW Button */
          <div className={`${styles.heroVoteSection} ${entrancePhase >= 5 ? styles.heroVoteVisible : ''}`}>
            <button
              className={styles.heroVoteNowBtn}
              onClick={handleStartVoting}
              aria-label="Start Voting Ceremony"
            >
              <span className={styles.heroVoteNowIcon}>👑</span>
              <span className={styles.heroVoteNowText}>VOTE NOW</span>
              <span className={styles.heroVoteNowCircleArrow}>
                <span className={styles.heroVoteNowArrowChar}>›</span>
              </span>
            </button>
          </div>
        ) : (
          /* Render Step 6: Saree Product candidates section revealed */
          <>
            <div className={`${styles.sectionHeading} ${styles.sectionHeadingVisible}`}>
              <div className={styles.headingDecoLine} />
              <span className={styles.headingFlourish}>⚜</span>
              <h2 className={styles.sectionTitle}>Vote For Your Saree</h2>
              <span className={styles.headingFlourish}>⚜</span>
              <div className={styles.headingDecoLine} />
            </div>

            <section className={styles.productsSection} aria-label="Crown candidates">
              <div className={styles.productsGrid}>
                {(campaign.products || []).map((product, idx) => {
                  const isSelected = selectedId === product.id;
                  return (
                    <ProductCard
                      key={product.id}
                      product={{ ...product, _idx: idx }}
                      isSelected={isSelected}
                      hasVoted={false}
                      votedProductId={null}
                      canVote={canVote}
                      onSelect={() => handleSelectProduct(product.id)}
                      onGoToProduct={(e) => goToProduct(e, product.id)}
                      visible={true}
                      animDelay={idx * 0.12}
                    />
                  );
                })}
              </div>
            </section>

            {/* Vote action */}
            <div className={`${styles.voteSection} ${styles.voteSectionVisible}`}>
              {!isAuthenticated ? (
                <div className={styles.loginPrompt}>
                  <p className={styles.loginPromptText}>Please log in to cast your vote for the Crown.</p>
                  <Link to={PATHS.LOGIN} className={styles.loginBtn} aria-label="Login to vote">
                    Login to Vote
                  </Link>
                </div>
              ) : (
                <>
                  {!selectedId && (
                    <p className={styles.voteHint}>Select a saree above to cast your vote</p>
                  )}
                  <button
                    className={`${styles.voteBtn} ${voting ? styles.voteBtnLoading : ''} ${selectedId ? styles.voteBtnActive : ''}`}
                    onClick={handleVote}
                    disabled={!selectedId || voting}
                    aria-label={
                      selectedId
                        ? `Vote for ${(campaign.products || []).find(p => p.id === selectedId)?.name || 'this saree'}`
                        : 'Select a saree first'
                    }
                  >
                    <span className={styles.voteBtnIcon}>👑</span>
                    <span className={styles.voteBtnText}>
                      {voting
                        ? 'Submitting Vote…'
                        : selectedId
                          ? 'VOTE NOW'
                          : 'Select a Saree to Vote'}
                    </span>
                    {selectedId && !voting && <span className={styles.voteBtnArrow}>›</span>}
                  </button>
                  <p className={styles.voteDisclaimer}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.shieldIconSvg}>
                      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      <path d="M9 12L11 14L15 10" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>You can change your vote until voting ends.</span>
                  </p>
                  {voteError && (
                    <div className={styles.voteError} role="alert">
                      ⚠️ {voteError}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function Breadcrumb() {
  return (
    <div className={styles.breadcrumbBar}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link to={PATHS.HOME} className={styles.crumbLink}>Home</Link>
        <span className={styles.separator}>›</span>
        <span className={styles.activeCrumb}>👑 Saree Crown</span>
      </nav>
    </div>
  );
}

/* ── Cinematic Hero matching Image 1 ─────────────────── */
function HeroSection({ entrancePhase }) {
  return (
    <section
      className={`${styles.heroSection} ${entrancePhase >= 3 ? styles.heroVisible : ''}`}
      aria-label="Saree Crown introduction"
    >
      {/* Ambient background particles (CSS only) */}
      <div className={styles.heroParticles} aria-hidden="true">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={styles.particle} style={{ '--i': i }} aria-hidden="true" />
        ))}
      </div>

      {/* Gold ambient glow */}
      <div className={styles.heroGlow} aria-hidden="true" />

      {/* 3D Gold Crown Emblem at the top */}
      <div className={`${styles.heroCrownWrap} ${entrancePhase >= 3 ? styles.crownEntered : ''}`} aria-hidden="true">
        <svg width="90" height="65" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.heroGoldCrownSvg}>
          <defs>
            <linearGradient id="crownGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff5c0" />
              <stop offset="35%" stopColor="#f5d76e" />
              <stop offset="70%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#aa7c11" />
            </linearGradient>
          </defs>

          {/* Base band with jewels */}
          <path d="M12 60 H88 V66 C88 68 86 70 84 70 H16 C14 70 12 68 12 66 Z" fill="url(#crownGoldGrad)" />
          <circle cx="25" cy="65" r="2.5" fill="#e83e8c" />
          <circle cx="50" cy="65" r="3" fill="#1554b8" />
          <circle cx="75" cy="65" r="2.5" fill="#e83e8c" />

          {/* Main Crown Body */}
          <path d="M12 60 L20 25 L38 45 L50 15 L62 45 L80 25 L88 60 Z" fill="url(#crownGoldGrad)" stroke="#ffd700" strokeWidth="1" />

          {/* Crown Peak Jewels */}
          <circle cx="20" cy="22" r="4" fill="url(#crownGoldGrad)" />
          <circle cx="20" cy="22" r="2" fill="#1554b8" />

          <circle cx="50" cy="12" r="5.5" fill="url(#crownGoldGrad)" />
          <circle cx="50" cy="12" r="3" fill="#e83e8c" />

          <circle cx="80" cy="22" r="4" fill="url(#crownGoldGrad)" />
          <circle cx="80" cy="22" r="2" fill="#1554b8" />

          <circle cx="38" cy="42" r="2.5" fill="#1554b8" />
          <circle cx="62" cy="42" r="2.5" fill="#1554b8" />
        </svg>
      </div>

      {/* Title block */}
      <div className={`${styles.heroTitleBlock} ${entrancePhase >= 3 ? styles.titleEntered : ''}`}>
        <div className={styles.eyebrowWrap}>
          <span className={styles.flourishWingLeft}>༺</span>
          <span className={styles.eyebrow}>THE</span>
          <span className={styles.flourishWingRight}>༻</span>
        </div>
        
        <h1 className={styles.heroTitle}>SAREE CROWN</h1>
        <p className={styles.heroSubtitleTag}>You Choose. We Crown.</p>
      </div>

      {/* Ornate Gold Filigree Scroll Flourish */}
      <div className={`${styles.goldDivider} ${entrancePhase >= 4 ? styles.dividerEntered : ''}`} aria-hidden="true">
        <svg width="220" height="24" viewBox="0 0 220 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.filigreeSvg}>
          <path d="M10 12 H85 C95 12 98 4 105 12 C101 20 95 12 85 12" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M210 12 H135 C125 12 122 4 115 12 C119 20 125 12 135 12" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="110" cy="12" r="4" fill="#ffd700" />
          <circle cx="110" cy="12" r="2" fill="#08122d" />
        </svg>
      </div>
    </section>
  );
}

/* ── Luxury Countdown matching Image 1 ─────────────────── */
function LuxuryCountdown({ dateStr, currentTime }) {
  const { days, hours, mins, secs } = getCountdownParts(dateStr, currentTime);

  return (
    <div className={styles.countdownRow}>
      <CountdownBlock value={days}  label="DAYS" />
      <span className={styles.countdownSep}>:</span>
      <CountdownBlock value={hours} label="HRS" />
      <span className={styles.countdownSep}>:</span>
      <CountdownBlock value={mins}  label="MINS" />
      <span className={styles.countdownSep}>:</span>
      <CountdownBlock value={secs}  label="SECS" />
    </div>
  );
}

function CountdownBlock({ value, label }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className={styles.countdownBlock}>
      <span className={styles.countdownNum} key={display}>{display}</span>
      <span className={styles.countdownUnit}>{label}</span>
    </div>
  );
}

/* ── Product Card matching Image 1 ───────────────────────── */
function ProductCard({
  product,
  isSelected,
  hasVoted,
  votedProductId,
  canVote,
  onSelect,
  onGoToProduct,
  visible,
  animDelay = 0,
}) {
  const isVotedCard = hasVoted && product.id === votedProductId;
  const cardIdxStr  = String(((product._idx ?? 0) + 1)).padStart(2, '0');

  const cardClass = [
    styles.productCard,
    isSelected   ? styles.productCardSelected : '',
    isVotedCard  ? styles.productCardVoted    : '',
    visible      ? styles.productCardVisible  : '',
  ].filter(Boolean).join(' ');

  return (
    <article
      className={cardClass}
      style={{ '--delay': `${animDelay}s` }}
      onClick={canVote ? onSelect : undefined}
      role={canVote ? 'radio' : 'article'}
      aria-checked={canVote ? isSelected : undefined}
      tabIndex={canVote ? 0 : undefined}
      onKeyDown={canVote ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } } : undefined}
      aria-label={`${product.name}${isSelected ? ' — selected' : ''}`}
    >
      {/* Selected 3D Gold Crown Top Badge */}
      {isSelected && (
        <div className={styles.selectedTopCrownWrap} aria-hidden="true">
          <svg width="42" height="32" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.cardGoldCrownSvg}>
            <defs>
              <linearGradient id="cardCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff5c0" />
                <stop offset="35%" stopColor="#f5d76e" />
                <stop offset="70%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#aa7c11" />
              </linearGradient>
            </defs>
            <path d="M12 60 H88 V66 C88 68 86 70 84 70 H16 C14 70 12 68 12 66 Z" fill="url(#cardCrownGrad)" />
            <circle cx="25" cy="65" r="2.5" fill="#e83e8c" />
            <circle cx="50" cy="65" r="3" fill="#1554b8" />
            <circle cx="75" cy="65" r="2.5" fill="#e83e8c" />
            <path d="M12 60 L20 25 L38 45 L50 15 L62 45 L80 25 L88 60 Z" fill="url(#cardCrownGrad)" stroke="#ffd700" strokeWidth="1" />
            <circle cx="20" cy="22" r="4" fill="url(#cardCrownGrad)" />
            <circle cx="50" cy="12" r="5.5" fill="url(#cardCrownGrad)" />
            <circle cx="80" cy="22" r="4" fill="url(#cardCrownGrad)" />
          </svg>
        </div>
      )}

      {/* Card number badge top-left */}
      <div className={`${styles.cardNumBadge} ${isSelected ? styles.cardNumBadgeSelected : ''}`} aria-hidden="true">
        {cardIdxStr}
      </div>

      {/* Heart Wishlist Icon top-right */}
      <div className={`${styles.cardHeartBadge} ${isSelected ? styles.cardHeartSelected : ''}`} aria-hidden="true">
        {isSelected ? '♥' : '♡'}
      </div>

      {/* Image Container */}
      <div className={styles.productImageBox}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={styles.productImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>🥻</span>
            <span>No image</span>
          </div>
        )}

        {/* Selected Banner across bottom of image */}
        {isSelected && (
          <div className={styles.selectedGoldBanner} aria-hidden="true">
            <span className={styles.bannerCrownIcon}>👑</span>
            <span className={styles.bannerText}>YOUR SELECTION</span>
          </div>
        )}
      </div>

      {/* Product info section */}
      <div className={styles.productInfo}>
        <h3
          className={styles.productName}
          onClick={onGoToProduct}
          title="View product details"
          role="link"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onGoToProduct(e); }}
        >
          {product.name}
        </h3>

        {product.price && (
          <p className={styles.productPrice}>
            ₹{formatPrice(product.price)}
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <span className={styles.productOriginalPrice}>
                ₹{formatPrice(product.original_price)}
              </span>
            )}
          </p>
        )}

        {/* Selection indicator */}
        <div className={styles.selectRow}>
          <div className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''} ${isVotedCard ? styles.radioCircleVoted : ''}`} aria-hidden="true">
            {(isSelected || isVotedCard) && <div className={styles.radioDot} />}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── Locked Countdown matching Image 1 ─────────────────── */
function LockedCountdown({ dateStr, currentTime }) {
  const { days, hours, mins, secs } = getCountdownParts(dateStr, currentTime);

  return (
    <div className={styles.lockedCountdownRow}>
      <LockedCountdownBlock value={days}  label="DAYS" />
      <span className={styles.lockedCountdownSep}>:</span>
      <LockedCountdownBlock value={hours} label="HRS" />
      <span className={styles.lockedCountdownSep}>:</span>
      <LockedCountdownBlock value={mins}  label="MINS" />
      <span className={styles.lockedCountdownSep}>:</span>
      <LockedCountdownBlock value={secs}  label="SECS" />
    </div>
  );
}

function LockedCountdownBlock({ value, label }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className={styles.lockedCountdownBlock}>
      <span className={styles.lockedCountdownNum} key={display}>{display}</span>
      <span className={styles.lockedCountdownUnit}>{label}</span>
    </div>
  );
}

/* ── Locked Reward (post-vote) matching Image 1 & Image 2 ─── */
function LockedRewardSection({ votedProduct, campaign, currentTime }) {
  const confettiData = React.useMemo(() => {
    const types = ['dot', 'ribbon', 'star', 'diamond'];
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      type: types[i % types.length],
      left: (i * 11 + (i % 3) * 7) % 92 + 4,
      top: (i * 8 + (i % 5) * 7) % 90 + 5,
      delay: (i * 0.12) % 3,
      duration: 2.2 + (i % 4) * 0.5,
      scale: 0.7 + (i % 3) * 0.4,
      rot: (i * 40) % 360,
    }));
  }, []);

  return (
    <div className={styles.lockedSection}>
      <div className={styles.lockedCard} role="status" aria-live="polite">

        {/* Four Corner Filigree Ornaments */}
        <span className={`${styles.cornerFiligree} ${styles.cornerTopLeft}`}>⚜</span>
        <span className={`${styles.cornerFiligree} ${styles.cornerTopRight}`}>⚜</span>
        <span className={`${styles.cornerFiligree} ${styles.cornerBottomLeft}`}>⚜</span>
        <span className={`${styles.cornerFiligree} ${styles.cornerBottomRight}`}>⚜</span>

        {/* Floating Golden Celebration Confetti & Sparkles across full card */}
        <div className={styles.lockedSparkles} aria-hidden="true">
          {confettiData.map((p) => (
            <span
              key={p.id}
              className={`${styles.confettiParticle} ${styles[`confetti_${p.type}`]}`}
              style={{
                '--cx': `${p.left}%`,
                '--cy': `${p.top}%`,
                '--cd': `${p.delay}s`,
                '--dur': `${p.duration}s`,
                '--cs': p.scale,
                '--cr': `${p.rot}deg`,
              }}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Card Top Title Header */}
        <div className={styles.lockedHeaderRow}>
          <span className={styles.lockedCrownIcon}>👑</span>
          <h2 className={styles.lockedTitle}>YOUR VOTE HAS BEEN LOCKED!</h2>
        </div>

        {/* Center Circular Voted Saree Avatar with Golden Glow Ring */}
        {votedProduct && votedProduct.image && (
          <div className={styles.lockedAvatarContainer}>
            <div className={styles.lockedAvatarCircle}>
              <img
                src={votedProduct.image}
                alt={votedProduct.name}
                className={styles.lockedAvatarImg}
              />
            </div>
            {/* Golden 3D Shield Badge with Checkmark */}
            <div className={styles.lockedShieldBadge} title="Vote Verified">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="url(#shieldGrad)" stroke="#ffd700" strokeWidth="1.5" />
                <path d="M9 12L11 14L15 10" stroke="#3d0521" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff5c0" />
                    <stop offset="50%" stopColor="#f5d76e" />
                    <stop offset="100%" stopColor="#b8860b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        )}

        {/* Thank You Text */}
        <h3 className={styles.lockedThankYouTitle}>Thank you for participating!</h3>
        <p className={styles.lockedThankYouSub}>Your choice is in the running to be crowned.</p>

        {/* Inner Countdown Container Box */}
        <div className={styles.lockedInnerCountdownBox}>
          <p className={styles.lockedWinnerNotice}>
            The Crown Winner will be revealed after voting ends.
          </p>

          <div className={styles.lockedRevealHeaderRow}>
            <div className={styles.lockedHeaderLine} />
            <span className={styles.lockedRevealLabel}>REVEAL IN</span>
            <div className={styles.lockedHeaderLine} />
          </div>

          {campaign?.votingEnd && (
            <LockedCountdown dateStr={campaign.votingEnd} currentTime={currentTime} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Winner Reveal Section matching Image 2 ───────────────── */
function WinnerRevealSection({ campaign, navigate, revealPhase }) {
  const winner = campaign.winnerProduct;
  const { refetchCart } = useCart();
  const [claiming, setClaiming] = useState(false);

  const confettiData = React.useMemo(() => {
    const types = ['dot', 'ribbon', 'star', 'diamond'];
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      type: types[i % types.length],
      left: (i * 11 + (i % 3) * 7) % 92 + 4,
      top: (i * 8 + (i % 5) * 7) % 90 + 5,
      delay: (i * 0.12) % 3,
      duration: 2.2 + (i % 4) * 0.5,
      scale: 0.7 + (i % 3) * 0.4,
      rot: (i * 40) % 360,
    }));
  }, []);

  const fullPageConfetti = React.useMemo(() => {
    const types = ['dot', 'ribbon', 'star', 'diamond'];
    const colors = ['#e6c875', '#ff2a8d', '#00d4ff', '#00e676', '#9c27b0', '#ff3d00', '#ffd700', '#e81a64'];
    return Array.from({ length: 75 }, (_, i) => ({
      id: i,
      type: types[i % types.length],
      color: colors[i % colors.length],
      left: (i * 7 + (i % 3) * 13) % 98 + 1,
      delay: (i * 0.07) % 4,
      duration: 3.2 + (i % 5) * 0.7,
      scale: 0.6 + (i % 4) * 0.35,
      rot: (i * 35) % 360,
    }));
  }, []);

  if (!winner) return null;

  const isClaimed = campaign.alreadyRedeemed === true;

  async function handleClaimReward() {
    if (isClaimed) {
      alert("You have already claimed your Crown Reward.");
      return;
    }
    setClaiming(true);
    try {
      await api.claimSareeCrownReward();
      await refetchCart();
      navigate('/cart', { state: { autoApplyCoupon: 'SAREECROWN' } });
    } catch (err) {
      console.error('Failed to claim Saree Crown reward:', err);
      alert(err.message || 'Failed to claim reward.');
    } finally {
      setClaiming(false);
    }
  }

  const rewardLabel = campaign.rewardType === 'free'
    ? 'FREE'
    : `${Number(campaign.rewardValue)}% OFF`;

  const showWinner = revealPhase >= 7;

  return (
    <div className={styles.winnerSection}>

      {/* Whole-page colorful winner celebration confetti rain */}
      <div className={styles.fullPageCelebrationLayer} aria-hidden="true">
        {fullPageConfetti.map((p) => (
          <span
            key={p.id}
            className={`${styles.fullPageParticle} ${styles[`fp_${p.type}`]}`}
            style={{
              '--fpx': `${p.left}%`,
              '--fpd': `${p.delay}s`,
              '--fpdur': `${p.duration}s`,
              '--fps': p.scale,
              '--fpr': `${p.rot}deg`,
              '--fpcolor': p.color,
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className={`${styles.winnerCard} ${showWinner ? styles.winnerCardVisible : ''}`}>

        {/* Four Corner Filigree Ornaments */}
        <span className={`${styles.cornerFiligree} ${styles.cornerTopLeft}`}>⚜</span>
        <span className={`${styles.cornerFiligree} ${styles.cornerTopRight}`}>⚜</span>
        <span className={`${styles.cornerFiligree} ${styles.cornerBottomLeft}`}>⚜</span>
        <span className={`${styles.cornerFiligree} ${styles.cornerBottomRight}`}>⚜</span>

        {/* Full Card Golden Celebration Confetti */}
        <div className={styles.confettiLayer} aria-hidden="true">
          {confettiData.map((p) => (
            <span
              key={p.id}
              className={`${styles.confettiParticle} ${styles[`confetti_${p.type}`]}`}
              style={{
                '--cx': `${p.left}%`,
                '--cy': `${p.top}%`,
                '--cd': `${p.delay}s`,
                '--dur': `${p.duration}s`,
                '--cs': p.scale,
                '--cr': `${p.rot}deg`,
              }}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* 3D Golden Ribbon Banner Header matching Image 2 */}
        <div className={styles.winnerRibbonWrap} aria-label="Crown has been revealed">
          <div className={styles.winnerRibbonTailLeft} />
          <div className={styles.winnerRibbonBanner}>
            <span className={styles.winnerRibbonText}>THE CROWN HAS BEEN REVEALED</span>
          </div>
          <div className={styles.winnerRibbonTailRight} />
        </div>

        {/* Two-column layout: Left saree image, Right details */}
        <div className={styles.winnerBody}>

          {/* LEFT — Saree image with radiant 3D gold glow frame & crown badge */}
          <div className={styles.winnerImageWrap}>
            <div className={styles.winnerImageCrownBadge} aria-hidden="true">
              👑
            </div>

            <div className={styles.winnerImageFrame}>
              {winner.image ? (
                <img
                  src={winner.image}
                  alt={winner.name}
                  className={styles.winnerImage}
                />
              ) : (
                <div className={styles.winnerImageFallback}>🥻</div>
              )}
            </div>
          </div>

          {/* RIGHT — Details, reward box & claim button */}
          <div className={styles.winnerDetails}>

            {/* TODAY'S CROWN SAREE heading centered with lines left and right matching Image 2 */}
            <div className={styles.winnerTodayHeaderRow}>
              <div className={styles.winnerTodayLineLeft} />
              <span className={styles.winnerTodayCrown}>👑</span>
              <span className={styles.winnerTodayText}>TODAY'S</span>
              <div className={styles.winnerTodayLineRight} />
            </div>

            <h2 className={styles.winnerHeadingBig}>CROWN SAREE</h2>

            {/* Winner product name & price */}
            <p
              className={styles.winnerName}
              onClick={() => navigate(`/product/${winner.id}`)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/product/${winner.id}`); }}
            >
              {winner.name}
            </p>

            <div className={styles.winnerPriceRow}>
              <span className={styles.winnerPrice}>₹{formatPrice(winner.price)}</span>
              {winner.original_price && Number(winner.original_price) > Number(winner.price) && (
                <span className={styles.winnerOriginalPrice}>₹{formatPrice(winner.original_price)}</span>
              )}
            </div>

            {/* Filigree Scroll Divider */}
            <div className={styles.winnerFiligreeScroll} aria-hidden="true">
              <svg width="180" height="18" viewBox="0 0 180 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 9 H70 C80 9 83 3 90 9 C86 15 80 9 70 9" stroke="#e6c875" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M170 9 H110 C100 9 97 3 90 9 C94 15 100 9 110 9" stroke="#e6c875" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="90" cy="9" r="3" fill="#fbe6ad" />
              </svg>
            </div>

            {/* Reward filigree bracket box matching Image 2 */}
            <div className={styles.rewardBracketBox}>
              <span className={`${styles.bracketFiligree} ${styles.bracketTopLeft}`}>⚜</span>
              <span className={`${styles.bracketFiligree} ${styles.bracketTopRight}`}>⚜</span>
              <span className={`${styles.bracketFiligree} ${styles.bracketBottomLeft}`}>⚜</span>
              <span className={`${styles.bracketFiligree} ${styles.bracketBottomRight}`}>⚜</span>
              
              <div className={styles.rewardHeaderRow}>
                <span className={styles.rewardGiftIcon}>🎁</span>
                <span className={styles.rewardBlockLabel}>YOUR CROWN REWARD</span>
              </div>
              <div className={styles.rewardValueBig}>{rewardLabel}</div>
            </div>

            {/* Claim Reward Button matching Image 2 */}
            <button
              className={`${styles.claimBtn} ${isClaimed ? styles.claimBtnClaimed : ''}`}
              onClick={handleClaimReward}
              disabled={claiming || isClaimed}
              aria-label={isClaimed ? 'Reward already claimed' : 'Claim your Crown reward'}
            >
              <span className={styles.claimBtnCrownIconSvg} aria-hidden="true">
                <svg width="22" height="18" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 17L0 4L7 11L12 0L17 11L24 4L22 17H2Z" fill="#2b0417" />
                  <path d="M1 18.5H23" stroke="#2b0417" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.claimBtnText}>
                {isClaimed ? 'ALREADY CLAIMED' : (claiming ? 'Claiming…' : 'CLAIM REWARD')}
              </span>
              {!isClaimed && !claiming && (
                <span className={styles.claimBtnCircleArrow}>
                  <span className={styles.claimBtnArrowChar}>›</span>
                </span>
              )}
            </button>

            {/* Shield note matching Image 2 */}
            <p className={styles.claimNote}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.claimShieldIcon}>
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M9 12L11 14L15 10" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                {isClaimed
                  ? 'You have already redeemed this Crown Reward.'
                  : 'Add the winning saree to your cart and enjoy your exclusive reward.'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SareeCrown;
