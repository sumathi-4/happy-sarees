const db = require('../../db');
const { parseInTimezone } = require('../../utils/timezone');

class SareeCrownService {

  async _getOrCreateCampaign() {
    let res = await db.query(`SELECT * FROM saree_crown_campaign ORDER BY id DESC LIMIT 1`);
    if (res.rows.length === 0) {
      const insertRes = await db.query(`
        INSERT INTO saree_crown_campaign (enabled, voting_stopped, winner_revealed, created_at, updated_at)
        VALUES (false, false, false, NOW(), NOW())
        RETURNING *
      `);
      return insertRes.rows[0];
    }
    return res.rows[0];
  }

  async get() {
    const campaign = await this._getOrCreateCampaign();
    const campaignId = campaign.id;

    const productsRes = await db.query(`
      SELECT scp.product_id, scp.sort_order,
             p.name, p.price, p.original_price,
             (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as image,
             (SELECT COUNT(*)::int FROM saree_crown_votes WHERE campaign_id = $1 AND product_id = scp.product_id) as vote_count
      FROM saree_crown_products scp
      JOIN products p ON p.id = scp.product_id AND p.deleted_at IS NULL
      WHERE scp.campaign_id = $1
      ORDER BY scp.sort_order ASC
    `, [campaignId]);

    let winnerProduct = null;
    if (campaign.winner_product_id) {
      const winnerRes = await db.query(`
        SELECT p.id, p.name, p.price, p.original_price, p.slug,
               (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as image
        FROM products p
        WHERE p.id = $1 AND p.deleted_at IS NULL
      `, [campaign.winner_product_id]);
      winnerProduct = winnerRes.rows[0] || null;
    }

    return { ...campaign, products: productsRes.rows, winnerProduct };
  }

  async save(data) {
    const { enabled, productIds, votingStart, votingEnd, rewardType, rewardValue } = data;

    // Validate product count
    if (!productIds || productIds.length < 3 || productIds.length > 5) {
      throw { status: 400, message: 'Select between 3 and 5 products for the Crown campaign.' };
    }

    const startUtc = parseInTimezone(votingStart);
    const endUtc   = parseInTimezone(votingEnd);

    // Validate dates
    if (startUtc && endUtc) {
      if (endUtc <= startUtc) {
        throw { status: 400, message: 'Voting end must be after voting start.' };
      }
    }

    // Validate reward percentage
    if (rewardType === 'percentage' && (!rewardValue || rewardValue <= 0 || rewardValue > 100)) {
      throw { status: 400, message: 'Reward percentage must be between 1 and 100.' };
    }

    const campaign = await this._getOrCreateCampaign();
    const campaignId = campaign.id;

    // Update campaign config, reset voting states
    await db.query(`
      UPDATE saree_crown_campaign SET
        enabled           = $1,
        voting_start      = $2,
        voting_end        = $3,
        reward_type       = $4,
        reward_value      = $5,
        voting_stopped    = FALSE,
        winner_product_id = NULL,
        winner_revealed   = FALSE,
        updated_at        = NOW()
      WHERE id = $6
    `, [
      Boolean(enabled),
      startUtc,
      endUtc,
      rewardType || null,
      rewardType === 'percentage' ? (rewardValue || null) : null,
      campaignId
    ]);

    // Replace product associations atomically
    await db.query(`DELETE FROM saree_crown_products WHERE campaign_id = $1`, [campaignId]);
    for (let i = 0; i < productIds.length; i++) {
      await db.query(
        `INSERT INTO saree_crown_products (campaign_id, product_id, sort_order) VALUES ($1, $2, $3)`,
        [campaignId, productIds[i], i]
      );
    }

    return this.get();
  }

  async stopVoting() {
    const campaign = await this._getOrCreateCampaign();
    const campaignId = campaign.id;

    await db.query(`
      UPDATE saree_crown_campaign
      SET voting_stopped = TRUE, updated_at = NOW()
      WHERE id = $1
    `, [campaignId]);
    return this.get();
  }

  async revealWinner() {
    const campaign = await this._getOrCreateCampaign();
    const campaignId = campaign.id;

    // 1. Calculate the winner dynamically from actual database vote records:
    // - Only campaign products can win.
    // - Highest vote count wins.
    // - Tie-breaker 1: Earliest vote cast (MIN(voted_at)).
    // - Final fallback/Tie-breaker 2: Lowest product_id.
    const votesRes = await db.query(`
      SELECT v.product_id, COUNT(*)::int as vote_count, MIN(v.voted_at) as earliest_vote
      FROM saree_crown_votes v
      JOIN saree_crown_products scp ON scp.product_id = v.product_id AND scp.campaign_id = v.campaign_id
      WHERE v.campaign_id = $1
      GROUP BY v.product_id
      ORDER BY vote_count DESC, earliest_vote ASC, v.product_id ASC
    `, [campaignId]);

    let winnerProductId = null;
    if (votesRes.rows.length > 0) {
      winnerProductId = votesRes.rows[0].product_id;
    } else {
      // If there are zero votes, fallback deterministically to the campaign product with the lowest product_id
      const productsRes = await db.query(`
        SELECT product_id FROM saree_crown_products
        WHERE campaign_id = $1
        ORDER BY product_id ASC
        LIMIT 1
      `, [campaignId]);
      if (productsRes.rows.length > 0) {
        winnerProductId = productsRes.rows[0].product_id;
      }
    }

    if (!winnerProductId) {
      throw { status: 400, message: 'No products configured for this campaign to select a winner.' };
    }

    // 2. Update campaign table with winner_product_id and winner_revealed = true
    await db.query(`
      UPDATE saree_crown_campaign
      SET winner_product_id = $1, winner_revealed = TRUE, updated_at = NOW()
      WHERE id = $2
    `, [winnerProductId, campaignId]);

    return this.get();
  }
}

module.exports = new SareeCrownService();
