// ============================================================
//  server/services/sareeCrownPublicService.js
//  Customer-facing Saree Crown service
//  - No hardcoded campaign_id: always resolves the active campaign
// ============================================================
const db = require('../db');
const { parseInTimezone } = require('../utils/timezone');

class SareeCrownPublicService {

  // ── Find the active campaign (enabled = true) ─────────────
  async _getActiveCampaign() {
    const res = await db.query(
      `SELECT * FROM saree_crown_campaign WHERE enabled = true ORDER BY id DESC LIMIT 1`
    );
    return res.rows[0] || null;
  }

  // ── GET /api/saree-crown ──────────────────────────────────
  // Returns campaign status + products (safe for public, no reward exposed unless user voted)
  async getCampaign(userId = null) {
    const campaign = await this._getActiveCampaign();

    if (!campaign) {
      return { enabled: false, status: 'disabled', products: [] };
    }

    const now = new Date();
    const start = parseInTimezone(campaign.voting_start);
    const end   = parseInTimezone(campaign.voting_end);

    let status;
    if (campaign.voting_stopped) {
      status = 'ended';
    } else if (start && now < start) {
      status = 'not_started';
    } else if (end && now > end) {
      status = 'ended';
    } else {
      status = 'active';
    }

    // Load campaign products (no price/reward exposure beyond product info)
    const productsRes = await db.query(`
      SELECT
        scp.product_id  AS id,
        scp.sort_order,
        p.name,
        p.price,
        p.original_price,
        p.slug,
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.display_order ASC
          LIMIT 1
        ) AS image
      FROM saree_crown_products scp
      JOIN products p ON p.id = scp.product_id AND p.deleted_at IS NULL
      WHERE scp.campaign_id = $1
      ORDER BY scp.sort_order ASC
    `, [campaign.id]);

    let hasVoted = false;
    if (userId) {
      const voteCheck = await db.query(
        `SELECT 1 FROM saree_crown_votes WHERE campaign_id = $1 AND user_id = $2 LIMIT 1`,
        [campaign.id, userId]
      );
      hasVoted = voteCheck.rowCount > 0;
    }

    // Expose winner and reward details only if revealed by admin AND the user has voted
    let winnerRevealed = false;
    let winnerProduct = null;
    let rewardType = null;
    let rewardValue = null;
    let alreadyRedeemed = false;

    if (campaign.winner_revealed && campaign.winner_product_id) {
      winnerRevealed = true;
      if (hasVoted) {
        rewardType = campaign.reward_type;
        rewardValue = campaign.reward_value;

        if (userId) {
          const usageCheck = await db.query(
            `SELECT 1 FROM coupon_usage cu 
             JOIN coupons c ON c.id = cu.coupon_id 
             WHERE UPPER(c.code) = 'SAREECROWN' AND cu.user_id = $1 LIMIT 1`,
            [userId]
          );
          alreadyRedeemed = usageCheck.rowCount > 0;
        }

        const winnerRes = await db.query(`
          SELECT p.id, p.name, p.price, p.original_price, p.slug,
                 (
                   SELECT pi.image_url
                   FROM product_images pi
                   WHERE pi.product_id = p.id
                   ORDER BY pi.is_primary DESC, pi.display_order ASC
                   LIMIT 1
                 ) AS image
          FROM products p
          WHERE p.id = $1 AND p.deleted_at IS NULL
        `, [campaign.winner_product_id]);
        
        winnerProduct = winnerRes.rows[0] || null;
      }
    }

    return {
      enabled:      true,
      status,
      campaignId:   campaign.id,
      votingStart:  campaign.voting_start,
      votingEnd:    campaign.voting_end,
      products:     productsRes.rows,
      winnerRevealed,
      winnerProduct,
      rewardType,
      rewardValue,
      hasVoted,
      alreadyRedeemed
    };
  }

  // ── POST /api/saree-crown/vote ────────────────────────────
  // Validates and persists a customer vote
  async castVote(userId, productId) {
    const campaign = await this._getActiveCampaign();

    if (!campaign) {
      throw { status: 403, message: 'No active Saree Crown campaign right now.' };
    }

    const now   = new Date();
    const start = parseInTimezone(campaign.voting_start);
    const end   = parseInTimezone(campaign.voting_end);

    // 1. Time window validation
    if (campaign.voting_stopped) {
      throw { status: 403, message: 'Voting has ended for this campaign.' };
    }
    if (start && now < start) {
      throw { status: 403, message: 'Voting has not started yet. Come back soon!' };
    }
    if (end && now > end) {
      throw { status: 403, message: 'Voting has ended for this campaign.' };
    }

    // 2. Product must belong to this campaign
    const productCheck = await db.query(
      `SELECT 1 FROM saree_crown_products
       WHERE campaign_id = $1 AND product_id = $2`,
      [campaign.id, productId]
    );
    if (productCheck.rowCount === 0) {
      throw { status: 400, message: 'Invalid product selection for this campaign.' };
    }

    // 3. Duplicate vote check (also enforced by DB UNIQUE constraint)
    const existingVote = await db.query(
      `SELECT id, product_id FROM saree_crown_votes
       WHERE campaign_id = $1 AND user_id = $2`,
      [campaign.id, userId]
    );
    if (existingVote.rowCount > 0) {
      throw { status: 409, message: 'You have already voted in this campaign.' };
    }

    // 4. Insert vote
    await db.query(
      `INSERT INTO saree_crown_votes (campaign_id, user_id, product_id, voted_at)
       VALUES ($1, $2, $3, NOW())`,
      [campaign.id, userId, productId]
    );

    return { success: true, campaignId: campaign.id, productId };
  }

  // ── GET /api/saree-crown/my-vote ─────────────────────────
  // Returns the authenticated user's existing vote (if any)
  async getMyVote(userId) {
    const campaign = await this._getActiveCampaign();

    if (!campaign) {
      return { voted: false };
    }

    const res = await db.query(
      `SELECT v.product_id, v.voted_at
       FROM saree_crown_votes v
       WHERE v.campaign_id = $1 AND v.user_id = $2
       LIMIT 1`,
      [campaign.id, userId]
    );

    if (res.rowCount === 0) {
      return { voted: false, campaignId: campaign.id };
    }

    return {
      voted:      true,
      campaignId: campaign.id,
      productId:  res.rows[0].product_id,
      votedAt:    res.rows[0].voted_at,
    };
  }
}

module.exports = new SareeCrownPublicService();
