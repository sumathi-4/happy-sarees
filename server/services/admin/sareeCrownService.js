const db = require('../../db');
const { parseInTimezone } = require('../../utils/timezone');

class SareeCrownService {

  async _getOrCreateCampaign() {
    let res = await db.query(`SELECT * FROM saree_crown_campaign ORDER BY id DESC LIMIT 1`);
    if (res.rows.length === 0) {
      const insertRes = await db.query(`
        INSERT INTO saree_crown_campaign (name, enabled, voting_stopped, winner_revealed, created_at, updated_at)
        VALUES ('Initial Saree Crown Campaign', false, false, false, NOW(), NOW())
        RETURNING *
      `);
      return insertRes.rows[0];
    }
    return res.rows[0];
  }

  async _checkOverlap(campaignId, enabled, votingStart, votingEnd) {
    if (!enabled) return;

    const startUtc = parseInTimezone(votingStart);
    const endUtc   = parseInTimezone(votingEnd);

    // If campaignId is null (creation), use a dummy value like -1 to match all
    const targetId = campaignId || -1;

    const overlapRes = await db.query(`
      SELECT id, name FROM saree_crown_campaign
      WHERE id != $1
        AND enabled = true
        AND voting_stopped = false
        AND winner_revealed = false
        AND (
          (voting_start IS NULL OR $3::timestamptz IS NULL OR voting_start <= $3::timestamptz)
          AND
          (voting_end IS NULL OR $2::timestamptz IS NULL OR voting_end >= $2::timestamptz)
        )
      LIMIT 1
    `, [targetId, startUtc, endUtc]);

    if (overlapRes.rows.length > 0) {
      throw {
        status: 400,
        message: 'Another Saree Crown campaign is already active during this period. Please stop or change the existing campaign before enabling this one.'
      };
    }
  }

  async getAll() {
    const res = await db.query(`
      SELECT c.*, 
             (SELECT COUNT(*)::int FROM saree_crown_votes WHERE campaign_id = c.id) as total_votes,
             p.name as winner_name
      FROM saree_crown_campaign c
      LEFT JOIN products p ON p.id = c.winner_product_id
      ORDER BY c.id DESC
    `);
    return res.rows;
  }

  async get(id = null) {
    let campaign;
    if (id) {
      const res = await db.query(`SELECT * FROM saree_crown_campaign WHERE id = $1`, [id]);
      campaign = res.rows[0];
      if (!campaign) {
        throw { status: 404, message: 'Campaign not found.' };
      }
    } else {
      campaign = await this._getOrCreateCampaign();
    }
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

  async create(data) {
    const { name, enabled, productIds, votingStart, votingEnd, rewardType, rewardValue } = data;

    // Verify there is no ongoing campaign
    const ongoingCheck = await db.query(`
      SELECT id, name FROM saree_crown_campaign
      WHERE enabled = true
        AND voting_stopped = false
        AND winner_revealed = false
        AND (voting_end IS NULL OR voting_end >= NOW())
      LIMIT 1
    `);
    if (ongoingCheck.rows.length > 0) {
      throw {
        status: 400,
        message: 'Complete or deactivate the current campaign before creating a new one.'
      };
    }

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

    // Check overlap
    await this._checkOverlap(null, enabled, votingStart, votingEnd);

    const insertRes = await db.query(`
      INSERT INTO saree_crown_campaign (
        name, enabled, voting_start, voting_end, reward_type, reward_value,
        voting_stopped, winner_product_id, winner_revealed, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, FALSE, NULL, FALSE, NOW(), NOW())
      RETURNING *
    `, [
      name || 'New Saree Crown Campaign',
      Boolean(enabled),
      startUtc,
      endUtc,
      rewardType || null,
      rewardType === 'percentage' ? (rewardValue || null) : null
    ]);

    const campaignId = insertRes.rows[0].id;

    for (let i = 0; i < productIds.length; i++) {
      await db.query(
        `INSERT INTO saree_crown_products (campaign_id, product_id, sort_order) VALUES ($1, $2, $3)`,
        [campaignId, productIds[i], i]
      );
    }

    return this.get(campaignId);
  }

  async update(id, data) {
    const { name, enabled, productIds, votingStart, votingEnd, rewardType, rewardValue } = data;

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

    const res = await db.query(`SELECT 1 FROM saree_crown_campaign WHERE id = $1`, [id]);
    if (res.rowCount === 0) {
      throw { status: 404, message: 'Campaign not found.' };
    }

    // Check overlap
    await this._checkOverlap(id, enabled, votingStart, votingEnd);

    await db.query(`
      UPDATE saree_crown_campaign SET
        name              = $1,
        enabled           = $2,
        voting_start      = $3,
        voting_end        = $4,
        reward_type       = $5,
        reward_value      = $6,
        updated_at        = NOW()
      WHERE id = $7
    `, [
      name || 'Updated Saree Crown Campaign',
      Boolean(enabled),
      startUtc,
      endUtc,
      rewardType || null,
      rewardType === 'percentage' ? (rewardValue || null) : null,
      id
    ]);

    // Replace product associations atomically
    await db.query(`DELETE FROM saree_crown_products WHERE campaign_id = $1`, [id]);
    for (let i = 0; i < productIds.length; i++) {
      await db.query(
        `INSERT INTO saree_crown_products (campaign_id, product_id, sort_order) VALUES ($1, $2, $3)`,
        [id, productIds[i], i]
      );
    }

    return this.get(id);
  }

  async stopVoting(id) {
    const res = await db.query(`SELECT 1 FROM saree_crown_campaign WHERE id = $1`, [id]);
    if (res.rowCount === 0) {
      throw { status: 404, message: 'Campaign not found.' };
    }

    await db.query(`
      UPDATE saree_crown_campaign
      SET voting_stopped = TRUE, updated_at = NOW()
      WHERE id = $1
    `, [id]);
    return this.get(id);
  }

  async revealWinner(id) {
    const res = await db.query(`SELECT 1 FROM saree_crown_campaign WHERE id = $1`, [id]);
    if (res.rowCount === 0) {
      throw { status: 404, message: 'Campaign not found.' };
    }

    // Calculate winner dynamically from votes cast in this specific campaign
    const votesRes = await db.query(`
      SELECT v.product_id, COUNT(*)::int as vote_count, MIN(v.voted_at) as earliest_vote
      FROM saree_crown_votes v
      JOIN saree_crown_products scp ON scp.product_id = v.product_id AND scp.campaign_id = v.campaign_id
      WHERE v.campaign_id = $1
      GROUP BY v.product_id
      ORDER BY vote_count DESC, earliest_vote ASC, v.product_id ASC
    `, [id]);

    let winnerProductId = null;
    if (votesRes.rows.length > 0) {
      winnerProductId = votesRes.rows[0].product_id;
    } else {
      // Fallback deterministically to candidate product with lowest ID
      const productsRes = await db.query(`
        SELECT product_id FROM saree_crown_products
        WHERE campaign_id = $1
        ORDER BY product_id ASC
        LIMIT 1
      `, [id]);
      if (productsRes.rows.length > 0) {
        winnerProductId = productsRes.rows[0].product_id;
      }
    }

    if (!winnerProductId) {
      throw { status: 400, message: 'No products configured for this campaign to select a winner.' };
    }

    await db.query(`
      UPDATE saree_crown_campaign
      SET winner_product_id = $1, winner_revealed = TRUE, updated_at = NOW()
      WHERE id = $2
    `, [winnerProductId, id]);

    return this.get(id);
  }
}

module.exports = new SareeCrownService();
