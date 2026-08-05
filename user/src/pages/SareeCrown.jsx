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
// ============================================================
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

// ── Component ────────────────────────────────────────────────
function SareeCrown() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Campaign state
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [campaign, setCampaign]               = useState(null); // full campaign data
  const [currentTime, setCurrentTime]         = useState(new Date());

  // Vote state
  const [myVote, setMyVote]         = useState(null); // { voted, productId } | null
  const [selectedId, setSelectedId] = useState(null); // currently highlighted card
  const [voting, setVoting]         = useState(false);
  const [voteError, setVoteError]   = useState('');

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
        if (start && now < start) initStatus = 'not_started';
        else if (end && now > end) initStatus = 'ended';
        else initStatus = 'active';
      }

      // Only fetch my-vote if campaign is enabled, user is logged in, and not fully disabled
      if (isAuthenticated && data.enabled && initStatus !== 'disabled') {
        try {
          const voteData = await api.getMySareeCrownVote();
          setMyVote(voteData);
          if (voteData.voted) {
            setSelectedId(voteData.productId);
          }
        } catch (_) {
          // Unauthenticated or no vote yet — ignore
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

  // ── Handle card selection ─────────────────────────────────
  function handleSelectProduct(id) {
    if (myVote?.voted) return;          // Already voted — lock selection
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
      // Actual API call — wait for backend validation + DB insert
      await api.castSareeCrownVote(selectedId);

      // Only update UI after confirmed success
      setMyVote({ voted: true, productId: selectedId });
    } catch (err) {
      // Keep user in voting state, show clear error
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
        <div className={styles.container}>
          <div className={styles.loadingWrapper}>
            <div className={styles.spinner} aria-label="Loading campaign" />
            <p>Loading Saree Crown…</p>
          </div>
        </div>
      </div>
    );
  }

  // Campaign disabled or no campaign
  if (!campaign?.enabled) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.breadcrumbBar}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link to={PATHS.HOME} className={styles.crumbLink}>Home</Link>
              <span className={styles.separator}>&gt;</span>
              <span className={styles.activeCrumb}>👑 Saree Crown</span>
            </nav>
          </div>
          <div className={styles.notActiveWrapper}>
            <div className={styles.crownIcon}>👑</div>
            <h2>Saree Crown</h2>
            <p>The Crown campaign is not active right now. Check back soon!</p>
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
        <div className={styles.container}>
          <div className={styles.breadcrumbBar}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link to={PATHS.HOME} className={styles.crumbLink}>Home</Link>
              <span className={styles.separator}>&gt;</span>
              <span className={styles.activeCrumb}>👑 Saree Crown</span>
            </nav>
          </div>
          <IntroSection />
          
          {campaign.winnerProduct ? (
            /* CASE 1: Customer voted and gets the details */
            <WinnerRevealSection campaign={campaign} navigate={navigate} />
          ) : !isAuthenticated ? (
            /* CASE 3: Customer not logged in */
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
            /* CASE 2: Customer logged in but did NOT vote */
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
          <div className={styles.breadcrumbBar}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link to={PATHS.HOME} className={styles.crumbLink}>Home</Link>
              <span className={styles.separator}>&gt;</span>
              <span className={styles.activeCrumb}>👑 Saree Crown</span>
            </nav>
          </div>
          <IntroSection />
          <div className={`${styles.statusBanner} ${styles.statusBannerSoon}`}>
            ⏳ Voting opens soon
            {campaign.votingStart && (
              <span>— in {timeLabel(campaign.votingStart, currentTime)}</span>
            )}
          </div>
          <div className={styles.notActiveWrapper}>
            <p>Come back when voting opens to choose your favourite saree.</p>
            <Link to={PATHS.SHOP} className={styles.shopBtn}>Browse Collection</Link>
          </div>
        </div>
      </div>
    );
  }

  // Campaign ended (no reveal yet — Step 4)
  if (currentStatus === 'ended') {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.breadcrumbBar}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link to={PATHS.HOME} className={styles.crumbLink}>Home</Link>
              <span className={styles.separator}>&gt;</span>
              <span className={styles.activeCrumb}>👑 Saree Crown</span>
            </nav>
          </div>
          <IntroSection />
          <div className={`${styles.statusBanner} ${styles.statusBannerEnded}`}>
            🏁 Voting has ended — the Crown reward is being prepared for reveal
          </div>

          {/* If this user voted, show their locked state */}
          {hasVoted ? (
            <LockedRewardSection votedProduct={votedProduct} />
          ) : (
            <div className={styles.notActiveWrapper}>
              <p>Voting for this campaign has closed.</p>
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
      <div className={styles.container}>

        {/* Breadcrumb */}
        <div className={styles.breadcrumbBar}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link to={PATHS.HOME} className={styles.crumbLink}>Home</Link>
            <span className={styles.separator}>&gt;</span>
            <span className={styles.activeCrumb}>👑 Saree Crown</span>
          </nav>
        </div>

        {/* Intro animation */}
        <IntroSection />

        {/* Active status banner */}
        <div className={`${styles.statusBanner} ${styles.statusBannerActive}`}>
          ✨ Voting is open
          {campaign.votingEnd && (
            <span>— closes in {timeLabel(campaign.votingEnd, currentTime)}</span>
          )}
        </div>

        {/* If user has voted, show locked state */}
        {hasVoted ? (
          <LockedRewardSection votedProduct={votedProduct} />
        ) : (
          <>
            {/* Product grid */}
            <section className={styles.productsSection} aria-label="Crown candidates">
              <p className={styles.sectionLabel}>Choose Your Favourite</p>
              <div className={styles.productsGrid}>
                {(campaign.products || []).map((product) => {
                  const isSelected = selectedId === product.id;
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isSelected={isSelected}
                      hasVoted={false}
                      votedProductId={null}
                      canVote={canVote}
                      onSelect={() => handleSelectProduct(product.id)}
                      onGoToProduct={(e) => goToProduct(e, product.id)}
                    />
                  );
                })}
              </div>
            </section>

            {/* Vote action */}
            <div className={styles.voteSection}>
              {!isAuthenticated ? (
                <div className={styles.loginPrompt}>
                  <p>Please log in to cast your vote for the Crown.</p>
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
                    className={`${styles.voteBtn} ${voting ? styles.voteBtnLoading : ''}`}
                    onClick={handleVote}
                    disabled={!selectedId || voting}
                    aria-label={
                      selectedId
                        ? `Vote for ${(campaign.products || []).find(p => p.id === selectedId)?.name || 'this saree'}`
                        : 'Select a saree first'
                    }
                  >
                    {voting
                      ? '⏳ Submitting Vote…'
                      : selectedId
                        ? '👑 Vote for This Saree'
                        : 'Select a Saree to Vote'}
                  </button>
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

function IntroSection() {
  return (
    <section className={styles.introSection} aria-label="Saree Crown introduction">
      <div className={styles.crownIcon} aria-hidden="true">👑</div>
      <span className={styles.eyebrow}>Saree Crown</span>
      <h1 className={styles.heroTitle}>
        Choose the Saree<br />That Deserves the Crown
      </h1>
      <p className={styles.heroSubtitle}>
        Vote for your favourite saree from our curated selection.
        Your pick shapes what becomes the Crown favourite.
      </p>
      <div className={styles.shimmerDivider} aria-hidden="true" />
    </section>
  );
}

function ProductCard({
  product,
  isSelected,
  hasVoted,
  votedProductId,
  canVote,
  onSelect,
  onGoToProduct,
}) {
  const isVotedCard = hasVoted && product.id === votedProductId;

  const cardClass = [
    styles.productCard,
    isSelected   ? styles.productCardSelected : '',
    isVotedCard  ? styles.productCardVoted    : '',
  ].filter(Boolean).join(' ');

  const radioClass = [
    styles.radioCircle,
    isVotedCard  ? styles.radioCircleVoted    : '',
    isSelected && !isVotedCard ? styles.radioCircleSelected : '',
  ].filter(Boolean).join(' ');

  const labelClass = [
    styles.selectLabel,
    isVotedCard  ? styles.selectLabelVoted    : '',
    isSelected && !isVotedCard ? styles.selectLabelSelected : '',
  ].filter(Boolean).join(' ');

  const labelText = isVotedCard
    ? 'Your Vote ✓'
    : isSelected
      ? 'Selected'
      : 'Select';

  return (
    <article
      className={cardClass}
      onClick={canVote ? onSelect : undefined}
      role={canVote ? 'radio' : 'article'}
      aria-checked={canVote ? isSelected : undefined}
      tabIndex={canVote ? 0 : undefined}
      onKeyDown={canVote ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } } : undefined}
      aria-label={`${product.name}${isSelected ? ' — selected' : ''}`}
    >
      {/* Image */}
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

        {/* Selection badge */}
        {(isSelected || isVotedCard) && (
          <span
            className={`${styles.selectedBadge} ${isVotedCard ? styles.votedBadge : ''}`}
            aria-hidden="true"
          >
            ✓
          </span>
        )}
      </div>

      {/* Product info */}
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

        {/* Radio-style selection indicator */}
        <div className={styles.selectRow}>
          <div className={radioClass} aria-hidden="true" />
          <span className={labelClass}>{labelText}</span>
        </div>
      </div>
    </article>
  );
}

function LockedRewardSection({ votedProduct }) {
  return (
    <div className={styles.lockedSection}>
      <div className={styles.lockedCard} role="status" aria-live="polite">
        <div className={styles.lockIcon} aria-label="Reward locked">🔒</div>
        <h2 className={styles.lockedTitle}>Your Crown Reward is Locked</h2>
        <div className={styles.goldDivider} aria-hidden="true" />
        <p className={styles.lockedSubtitle}>
          Your vote has been recorded. The reward will be revealed after voting ends.
        </p>

        {votedProduct && (
          <div className={styles.lockedSareeInfo} aria-label={`You voted for ${votedProduct.name}`}>
            {votedProduct.image && (
              <img
                src={votedProduct.image}
                alt={votedProduct.name}
                className={styles.lockedSareeThumb}
              />
            )}
            <div>
              <p className={styles.lockedSareeLabel}>You voted for</p>
              <p className={styles.lockedSareeName}>{votedProduct.name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WinnerRevealSection({ campaign, navigate }) {
  const winner = campaign.winnerProduct;
  const { cart, addToCart } = useCart();
  const [claiming, setClaiming] = useState(false);

  if (!winner) return null;

  const isClaimed = campaign.alreadyRedeemed === true;

  async function handleClaimReward() {
    if (isClaimed) {
      alert("You have already claimed your Crown Reward.");
      return;
    }
    setClaiming(true);
    try {
      const currentCart = cart || [];
      const isAlreadyInCart = currentCart.some(
        item => Number(item.id || item.productId) === Number(winner.id)
      );
      if (!isAlreadyInCart) {
        await addToCart(winner, 1);
      }
      navigate('/cart', { state: { autoApplyCoupon: 'SAREECROWN' } });
    } catch (err) {
      console.error('Failed to claim Saree Crown reward:', err);
    } finally {
      setClaiming(false);
    }
  }

  const rewardLabel = campaign.rewardType === 'free'
    ? 'FREE'
    : `${Number(campaign.rewardValue)}% OFF`;

  return (
    <div className={styles.winnerSection}>
      <div className={styles.winnerCard}>
        <div className={styles.winnerRibbon}>👑 Today's Crown Saree</div>
        
        <div className={styles.winnerContent}>
          <div className={styles.winnerImageContainer}>
            {winner.image ? (
              <img
                src={winner.image}
                alt={winner.name}
                className={styles.winnerImage}
                onClick={() => navigate(`/product/${winner.id}`)}
              />
            ) : (
              <div className={styles.winnerImageFallback}>🥻</div>
            )}
            <div className={styles.shineSweep} />
          </div>

          <div className={styles.winnerDetails}>
            <h2 className={styles.winnerName} onClick={() => navigate(`/product/${winner.id}`)}>
              {winner.name}
            </h2>
            <div className={styles.winnerPrice}>
              ₹{formatPrice(winner.price)}
              {winner.original_price && Number(winner.original_price) > Number(winner.price) && (
                <span className={styles.winnerOriginalPrice}>
                  ₹{formatPrice(winner.original_price)}
                </span>
              )}
            </div>

            <div className={styles.rewardBox}>
              <span className={styles.rewardIcon}>🎁</span>
              <div>
                <div className={styles.rewardTitle}>Your Crown Reward</div>
                <div className={styles.rewardValue}>{rewardLabel}</div>
                <div style={{ fontSize: '0.85rem', color: '#ffeb3b', marginTop: '0.35rem', fontWeight: 'bold' }}>
                  Use coupon code SAREECROWN at checkout to claim!
                </div>
              </div>
            </div>

            <button
              className={styles.shopNowBtn}
              onClick={handleClaimReward}
              disabled={claiming || isClaimed}
            >
              {isClaimed ? 'Already Claimed' : (claiming ? 'Claiming...' : 'Claim Reward')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SareeCrown;
