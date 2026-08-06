import React, { useState, useEffect, useCallback } from 'react';
import {
  FiAward, FiToggleLeft, FiToggleRight, FiCalendar, FiGift,
  FiPercent, FiSearch, FiX, FiCheck, FiAlertCircle, FiLoader,
  FiSave, FiPackage, FiInfo, FiRefreshCw, FiArrowLeft, FiPlus
} from 'react-icons/fi';
import { sareeCrownApi, productsApi } from '../api/adminApi';
import styles from '../styles/SareeCrownManagement.module.css';

// ─── Toast component ────────────────────────────────────────
function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div className={`${styles.toast} ${styles[`toast_${type}`]}`}>
      {type === 'error' ? <FiAlertCircle /> : <FiCheck />}
      <span>{message}</span>
    </div>
  );
}

// ─── Product Picker Modal ────────────────────────────────────
function ProductPickerModal({ selected, onConfirm, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [picked, setPicked]     = useState(selected.map(p => p.product_id ?? p.id));

  useEffect(() => {
    productsApi.getAll({ limit: 200 })
      .then(data => setProducts(data.data || data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  function toggleProduct(id) {
    setPicked(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 5) return prev; // max 5
      return [...prev, id];
    });
  }

  function handleConfirm() {
    const pickedProducts = products.filter(p => picked.includes(p.id));
    onConfirm(pickedProducts);
  }

  const isValid = picked.length >= 3 && picked.length <= 5;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>👑 Select Crown Sarees</h2>
          <p className={styles.modalSubtitle}>Choose 3–5 sarees for customers to vote on.</p>
          <button className={styles.modalClose} onClick={onClose}><FiX /></button>
        </div>

        <div className={styles.modalSearch}>
          <FiSearch className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.pickerStatus}>
          <span className={`${styles.pickerCount} ${isValid ? styles.pickerCountOk : picked.length > 5 ? styles.pickerCountErr : ''}`}>
            {picked.length} / 5 selected {picked.length < 3 && `(need ${3 - picked.length} more)`}
          </span>
        </div>

        <div className={styles.productGrid}>
          {loading && (
            <div className={styles.loadingRow}>
              <FiLoader className={styles.spinner} />
              <span>Loading products…</span>
            </div>
          )}
          {!loading && filtered.map(p => {
            const isPicked = picked.includes(p.id);
            const isDisabled = !isPicked && picked.length >= 5;
            const img = p.primary_image || p.image_url || p.image;
            return (
              <div
                key={p.id}
                className={`${styles.productCard} ${isPicked ? styles.productCardPicked : ''} ${isDisabled ? styles.productCardDisabled : ''}`}
                onClick={() => !isDisabled && toggleProduct(p.id)}
              >
                <div className={styles.productImageWrap}>
                  {img
                    ? <img src={img} alt={p.name} className={styles.productImage} />
                    : <div className={styles.productImageFallback}><FiPackage /></div>
                  }
                  {isPicked && <div className={styles.pickedOverlay}><FiCheck /></div>}
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{p.name}</span>
                  <span className={styles.productPrice}>₹{Number(p.price || 0).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
          {!loading && filtered.length === 0 && (
            <div className={styles.emptySearch}>No products match "{search}"</div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button
            className={styles.btnPrimary}
            disabled={!isValid}
            onClick={handleConfirm}
          >
            <FiCheck /> Confirm {picked.length} Sarees
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function SareeCrownManagement() {
  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [currentCampaignId, setCurrentCampaignId] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState({ message: '', type: 'success' });

  const hasOngoingCampaign = useCallback((list) => {
    const now = new Date();
    return list.some(c => {
      if (!c.enabled) return false;
      if (c.winner_revealed) return false;
      if (c.voting_stopped) return false;
      const end = c.voting_end ? new Date(c.voting_end) : null;
      if (end && now > end) return false;
      return true;
    });
  }, []);

  // Form state
  const [name, setName]               = useState('');
  const [enabled, setEnabled]         = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [votingStart, setVotingStart] = useState('');
  const [votingEnd, setVotingEnd]     = useState('');
  const [rewardType, setRewardType]   = useState('free');
  const [rewardValue, setRewardValue] = useState('');

  // UI state
  const [showPicker, setShowPicker] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3500);
  }, []);

  const loadCampaigns = useCallback(async (showSuccessToast = false) => {
    setLoading(true);
    try {
      const data = await sareeCrownApi.list();
      setCampaigns(data.campaigns || []);
      if (showSuccessToast) {
        showToast('Campaigns list refreshed successfully.', 'success');
      }
    } catch (err) {
      showToast('Failed to load campaigns list.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadSingleCampaign = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await sareeCrownApi.get(id);
      const c = data.campaign;
      setCampaign(c);
      setName(c.name || '');
      setEnabled(c.enabled || false);
      setSelectedProducts(c.products || []);
      setVotingStart(c.voting_start ? toDatetimeLocal(c.voting_start) : '');
      setVotingEnd(c.voting_end   ? toDatetimeLocal(c.voting_end)   : '');
      setRewardType(c.reward_type || 'free');
      setRewardValue(c.reward_value ? String(c.reward_value) : '');
    } catch (err) {
      showToast('Failed to load campaign details.', 'error');
      setView('list');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Load appropriate view details
  useEffect(() => {
    if (view === 'list') {
      loadCampaigns();
    } else if (view === 'edit' && currentCampaignId) {
      loadSingleCampaign(currentCampaignId);
    } else if (view === 'create') {
      setName('');
      setEnabled(false);
      setSelectedProducts([]);
      setVotingStart('');
      setVotingEnd('');
      setRewardType('free');
      setRewardValue('');
      setCampaign(null);
      setLoading(false);
    }
  }, [view, currentCampaignId, loadCampaigns, loadSingleCampaign]);

  function toDatetimeLocal(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';

    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      });

      const parts = formatter.formatToParts(date);
      const getPart = type => parts.find(p => p.type === type).value;

      const pad = s => String(s).padStart(2, '0');

      const year = getPart('year');
      const month = pad(getPart('month'));
      const day = pad(getPart('day'));
      let hour = getPart('hour');
      if (Number(hour) === 24 || hour === '24') hour = '00';
      else hour = pad(hour);
      const minute = pad(getPart('minute'));

      return `${year}-${month}-${day}T${hour}:${minute}`;
    } catch (err) {
      console.error('[toDatetimeLocal timezone error]', err.message);
      const d = new Date(iso);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }

  // ── Save/Create Campaign ──
  async function handleSave() {
    if (!name.trim()) {
      showToast('Please enter a campaign name.', 'error');
      return;
    }
    if (selectedProducts.length < 3 || selectedProducts.length > 5) {
      showToast('Please select 3–5 products.', 'error');
      return;
    }
    if (rewardType === 'percentage' && (!rewardValue || Number(rewardValue) <= 0)) {
      showToast('Enter a valid percentage value.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        enabled,
        productIds: selectedProducts.map(p => p.product_id ?? p.id),
        votingStart: votingStart || null,
        votingEnd:   votingEnd   || null,
        rewardType,
        rewardValue: rewardType === 'percentage' ? Number(rewardValue) : null,
      };

      if (view === 'create') {
        await sareeCrownApi.create(payload);
        showToast('Campaign created successfully.', 'success');
      } else {
        await sareeCrownApi.save(currentCampaignId, payload);
        showToast('Campaign saved successfully.', 'success');
      }
      
      setView('list');
      setCurrentCampaignId(null);
    } catch (e) {
      showToast(e.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleProductsConfirmed(products) {
    setSelectedProducts(products);
    setShowPicker(false);
  }

  function removeProduct(id) {
    setSelectedProducts(prev => prev.filter(p => (p.product_id ?? p.id) !== id));
  }

  function isVotingTimeActive() {
    if (!campaign || !campaign.voting_start || !campaign.voting_end) return false;
    const now = new Date();
    const start = new Date(campaign.voting_start);
    const end   = new Date(campaign.voting_end);
    return now >= start && now <= end && !campaign.voting_stopped;
  }

  function isVotingTimeEnded() {
    if (!campaign || !campaign.voting_end) return false;
    const now = new Date();
    const end = new Date(campaign.voting_end);
    return now > end || campaign.voting_stopped;
  }

  function isCampaignActive() {
    if (!campaign || !campaign.enabled || campaign.voting_stopped || campaign.winner_revealed) return false;
    const now = new Date();
    const start = campaign.voting_start ? new Date(campaign.voting_start) : null;
    const end   = campaign.voting_end   ? new Date(campaign.voting_end)   : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  }

  async function handleStopVoting() {
    if (!window.confirm('Are you sure you want to stop voting? This will immediately prevent customers from voting.')) {
      return;
    }
    setSaving(true);
    try {
      const data = await sareeCrownApi.stopVoting(currentCampaignId);
      setCampaign(data.campaign);
      setSelectedProducts(data.campaign.products || []);
      showToast('Voting stopped successfully.', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to stop voting.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleRevealWinner() {
    if (!window.confirm('Are you sure you want to reveal the winner? This will calculate the product with the most votes and reveal it to all customers.')) {
      return;
    }
    setSaving(true);
    try {
      const data = await sareeCrownApi.revealWinner(currentCampaignId);
      setCampaign(data.campaign);
      setSelectedProducts(data.campaign.products || []);
      showToast('Winner revealed successfully!', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to reveal winner.', 'error');
    } finally {
      setSaving(false);
    }
  }

  // ── Campaign Status Calculation for Dashboard ──
  function getCampaignStatusText(c) {
    if (!c.enabled) return '⚫ Inactive';
    if (c.winner_revealed) return '🏆 Winner Revealed';
    if (c.voting_stopped) return '⏹ Voting Stopped';

    const now = new Date();
    const start = c.voting_start ? new Date(c.voting_start) : null;
    const end = c.voting_end ? new Date(c.voting_end) : null;

    if (start && now < start) return '⏳ Scheduled';
    if (end && now > end) return '⏹ Ended';
    return '🟢 Active';
  }

  function getCampaignStatusClass(c) {
    if (!c.enabled) return styles.statusBadgeInactive;
    if (c.winner_revealed) return styles.statusBadgeRevealed;
    if (c.voting_stopped) return styles.statusBadgeStopped;

    const now = new Date();
    const start = c.voting_start ? new Date(c.voting_start) : null;
    const end = c.voting_end ? new Date(c.voting_end) : null;

    if (start && now < start) return styles.statusBadgeInactive;
    if (end && now > end) return styles.statusBadgeStopped;
    return styles.statusBadgeActive;
  }

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <FiLoader className={styles.spinner} />
        <span>Loading…</span>
      </div>
    );
  }

  const selCount = selectedProducts.length;

  // ── RENDER LIST VIEW ──────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className={styles.wrapper}>
        <Toast message={toast.message} type={toast.type} />

        <div className={styles.pageHeader}>
          <div className={styles.titleGroup}>
            <h1 className={styles.pageTitle}>👑 Saree Crown Campaigns</h1>
            <p className={styles.pageSubtitle}>Create and manage your Saree Crown campaigns.</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.btnSecondary}
              onClick={() => loadCampaigns(true)}
              disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FiRefreshCw /> Refresh
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => setView('create')}
              disabled={hasOngoingCampaign(campaigns)}
            >
              <FiPlus /> Create Campaign
            </button>
          </div>
        </div>

        {hasOngoingCampaign(campaigns) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeeba',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            <FiAlertCircle style={{ color: '#856404', flexShrink: 0 }} />
            <span>Complete or deactivate the current campaign before creating a new one.</span>
          </div>
        )}

        {campaigns.length === 0 ? (
          <div className={styles.tableCard}>
            <div className={styles.emptyState}>
              <FiAward className={styles.emptyStateIcon} />
              <h3>No Campaigns Found</h3>
              <p style={{ marginBottom: '20px' }}>Start by creating your first Saree Crown campaign.</p>
              <button
                className={styles.btnPrimary}
                onClick={() => setView('create')}
                disabled={hasOngoingCampaign(campaigns)}
              >
                <FiPlus /> Create Campaign
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <table className={styles.campaignTable}>
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Voting Period</th>
                  <th>Status</th>
                  <th>Votes</th>
                  <th>Reward</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => {
                  const startStr = c.voting_start ? new Date(c.voting_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
                  const endStr = c.voting_end ? new Date(c.voting_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className={styles.campaignNameCell}>
                          <span>👑 {c.name || `Campaign #${c.id}`}</span>
                        </div>
                      </td>
                      <td className={styles.campaignDateRange}>
                        {startStr} – {endStr}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getCampaignStatusClass(c)}`}>
                          {getCampaignStatusText(c)}
                        </span>
                      </td>
                      <td style={{ fontWeight: '700' }}>
                        {c.total_votes || 0} votes
                      </td>
                      <td>
                        <span className={styles.rewardBadge}>
                          {c.reward_type === 'free' ? 'FREE' : `${Number(c.reward_value || 0)}% OFF`}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.btnSecondary}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => {
                            setCurrentCampaignId(c.id);
                            setView('edit');
                          }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ── RENDER FORM / DETAILS VIEW (CREATE & MANAGE) ─────────────────
  return (
    <div className={styles.wrapper}>
      <Toast message={toast.message} type={toast.type} />

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <button
            className={styles.btnSecondary}
            onClick={() => {
              setView('list');
              setCurrentCampaignId(null);
            }}
            style={{ marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px' }}
          >
            <FiArrowLeft /> Back to Campaigns
          </button>
          <h1 className={styles.pageTitle}>
            {view === 'create' ? '👑 Create Campaign' : `👑 ${name}`}
          </h1>
          <p className={styles.pageSubtitle}>
            {view === 'create' ? 'Configure a new Saree Crown voting campaign.' : 'Manage details, view voting results, and control states.'}
          </p>
        </div>
        <div className={styles.headerActions} style={{ alignSelf: 'flex-end' }}>
          <button
            className={styles.btnPrimary}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <><FiLoader className={styles.spinnerInline} /> Saving…</> : <><FiSave /> Save Campaign</>}
          </button>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* ── LEFT COLUMN ── */}
        <div className={styles.leftCol}>

          {/* Campaign Info */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>📝</span>
              <div>
                <h3 className={styles.cardTitle}>Campaign Details</h3>
                <p className={styles.cardSubtitle}>Provide campaign title and status.</p>
              </div>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Campaign Name</label>
                <input
                  type="text"
                  className={styles.dateInput}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  placeholder="e.g. Wedding Week Crown"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className={styles.toggleRow} style={{ marginTop: '8px', padding: 0, border: 'none' }}>
                <div className={styles.toggleInfo}>
                  <span className={`${styles.statusBadge} ${enabled ? styles.statusBadgeActive : styles.statusBadgeInactive}`}>
                    {enabled ? '🟢 Enabled' : '⚫ Disabled'}
                  </span>
                  <span className={styles.toggleLabel} style={{ marginLeft: '10px' }}>
                    {enabled ? 'Campaign is visible to customers' : 'Campaign is hidden from customers'}
                  </span>
                </div>
                <button
                  className={`${styles.toggleBtn} ${enabled ? styles.toggleBtnOn : styles.toggleBtnOff}`}
                  onClick={() => setEnabled(v => !v)}
                >
                  {enabled ? <FiToggleRight /> : <FiToggleLeft />}
                </button>
              </div>
            </div>
          </div>

          {/* Saree Crown Operations (Only for Edit Mode) */}
          {view === 'edit' && campaign && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>👑</span>
                <div>
                  <h3 className={styles.cardTitle}>Campaign Operations</h3>
                  <p className={styles.cardSubtitle}>Control live voting and winner announcements.</p>
                </div>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* STATE 1: ACTIVE */}
                {isCampaignActive() && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-color)' }}>Current State:</span>
                      <span className={`${styles.statusBadge} ${styles.statusBadgeActive}`}>🟢 Voting Active</span>
                    </div>
                    <button
                      className={styles.btnDanger}
                      onClick={handleStopVoting}
                      disabled={saving}
                      style={{ width: '100%' }}
                    >
                      ⏹ Stop Voting
                    </button>
                  </>
                )}

                {/* STATE 2: STOPPED / ENDED */}
                {campaign.enabled && !campaign.winner_revealed && (campaign.voting_stopped || isVotingTimeEnded()) && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-color)' }}>Current State:</span>
                      <span className={`${styles.statusBadge} ${styles.statusBadgeStopped}`}>⏹ Voting Stopped</span>
                    </div>
                    <button
                      className={styles.btnSuccess}
                      onClick={handleRevealWinner}
                      disabled={saving}
                      style={{ width: '100%' }}
                    >
                      👑 Reveal Winner
                    </button>
                  </>
                )}

                {/* STATE 3: REVEALED */}
                {campaign.winner_revealed && campaign.winnerProduct && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-color)' }}>Current State:</span>
                      <span className={`${styles.statusBadge} ${styles.statusBadgeRevealed}`}>👑 Winner Revealed</span>
                    </div>
                    <div style={{ padding: '16px', border: '1px dashed var(--gold-color)', borderRadius: '6px', background: 'rgba(197, 160, 89, 0.04)' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', color: 'var(--gold-color)', marginBottom: '8px' }}>🎉 Winner Saree</div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {campaign.winnerProduct.image ? (
                          <img src={campaign.winnerProduct.image} alt={campaign.winnerProduct.name} style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaeaf0', borderRadius: '4px', fontSize: '16px' }}>🥻</div>
                        )}
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-color)', marginBottom: '2px' }}>{campaign.winnerProduct.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '2px' }}>
                            Votes: <strong>{campaign.products.find(p => (p.product_id ?? p.id) === campaign.winner_product_id)?.vote_count || 0}</strong>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                            Reward: {campaign.reward_type === 'free' ? '🎁 Free Product' : `🎁 ${campaign.reward_value}% OFF`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Voting Window */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}><FiCalendar /></span>
              <div>
                <h3 className={styles.cardTitle}>Voting Window</h3>
                <p className={styles.cardSubtitle}>Set when customers can cast their votes.</p>
              </div>
            </div>
            <div className={styles.dateRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Voting Starts</label>
                <input
                  type="datetime-local"
                  className={styles.dateInput}
                  value={votingStart}
                  onChange={e => setVotingStart(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Voting Ends</label>
                <input
                  type="datetime-local"
                  className={styles.dateInput}
                  value={votingEnd}
                  onChange={e => setVotingEnd(e.target.value)}
                  min={votingStart}
                />
              </div>
            </div>
          </div>

          {/* Reward */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}><FiGift /></span>
              <div>
                <h3 className={styles.cardTitle}>Winner Reward</h3>
                <p className={styles.cardSubtitle}>What the winner of the Crown vote receives.</p>
              </div>
            </div>

            <div className={styles.rewardOptions}>
              <label
                className={`${styles.rewardOption} ${rewardType === 'free' ? styles.rewardOptionActive : ''}`}
                onClick={() => setRewardType('free')}
              >
                <div className={styles.rewardRadio}>
                  {rewardType === 'free' && <div className={styles.rewardRadioDot} />}
                </div>
                <div>
                  <span className={styles.rewardOptionTitle}>🎁 Free Product</span>
                  <span className={styles.rewardOptionDesc}>Winner gets the Crown saree for free.</span>
                </div>
              </label>

              <label
                className={`${styles.rewardOption} ${rewardType === 'percentage' ? styles.rewardOptionActive : ''}`}
                onClick={() => setRewardType('percentage')}
              >
                <div className={styles.rewardRadio}>
                  {rewardType === 'percentage' && <div className={styles.rewardRadioDot} />}
                </div>
                <div>
                  <span className={styles.rewardOptionTitle}><FiPercent /> Percentage Discount</span>
                  <span className={styles.rewardOptionDesc}>Winner gets a discount on the Crown saree.</span>
                </div>
              </label>
            </div>

            {rewardType === 'percentage' && (
              <div className={styles.percentageInput}>
                <label className={styles.label}>Discount Percentage</label>
                <div className={styles.percentageWrap}>
                  <input
                    type="number"
                    className={styles.numberInput}
                    value={rewardValue}
                    min="1"
                    max="100"
                    placeholder="e.g. 20"
                    onChange={e => setRewardValue(e.target.value)}
                  />
                  <span className={styles.percentageSuffix}>%</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT COLUMN — Product Selection ── */}
        <div className={styles.rightCol}>
          <div className={`${styles.card} ${styles.cardFull}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>👗</span>
              <div>
                <h3 className={styles.cardTitle}>Crown Sarees</h3>
                <p className={styles.cardSubtitle}>Select 3–5 sarees for the vote. ({selCount}/5 selected)</p>
              </div>
              <button className={styles.btnOutline} onClick={() => setShowPicker(true)}>
                {selCount === 0 ? '+ Pick Sarees' : '✏️ Change'}
              </button>
            </div>

            {selCount === 0 ? (
              <div className={styles.emptyProducts}>
                <FiAward className={styles.emptyIcon} />
                <p>No sarees selected yet.</p>
                <button className={styles.btnPrimary} onClick={() => setShowPicker(true)}>
                  + Pick Crown Sarees
                </button>
              </div>
            ) : (
              <>
                {selCount < 3 && (
                  <div className={styles.warningBanner}>
                    <FiInfo /> Select at least {3 - selCount} more saree{3 - selCount > 1 ? 's' : ''} to enable the campaign.
                  </div>
                )}
                <div className={styles.selectedGrid}>
                  {selectedProducts.map(p => {
                    const id  = p.product_id ?? p.id;
                    const img = p.primary_image || p.image_url || p.image;
                    return (
                      <div key={id} className={styles.selectedCard}>
                        <div className={styles.selectedImageWrap}>
                          {img
                            ? <img src={img} alt={p.name} className={styles.selectedImage} />
                            : <div className={styles.selectedImageFallback}><FiPackage /></div>
                          }
                        </div>
                        <div className={styles.selectedInfo}>
                          <span className={styles.selectedName}>{p.name}</span>
                          <span className={styles.selectedPrice}>₹{Number(p.price || 0).toLocaleString()}</span>
                          {view === 'edit' && campaign && (
                            <span style={{ display: 'block', fontSize: '12px', color: 'var(--primary-color)', fontWeight: '700', marginTop: '6px' }}>
                              Public Votes: <strong>{p.vote_count || 0}</strong>
                            </span>
                          )}
                        </div>
                        <button
                          className={styles.removeBtn}
                          onClick={() => removeProduct(id)}
                          title="Remove"
                        >
                          <FiX />
                        </button>
                      </div>
                    );
                  })}
                  {selCount < 5 && (
                    <button className={styles.addMoreCard} onClick={() => setShowPicker(true)}>
                      <span className={styles.addMoreIcon}>+</span>
                      <span>Add More</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Product Picker Modal ── */}
      {showPicker && (
        <ProductPickerModal
          selected={selectedProducts}
          onConfirm={handleProductsConfirmed}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
