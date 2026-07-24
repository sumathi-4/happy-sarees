// ============================================================
//  cmsService.js — Homepage CMS Management
// ============================================================

const db = require('../../db');

class CmsService {

  normalizeKey(key) {
    if (!key) return '';
    return key.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, '');
  }

  // ── All Sections with Content ──────────────────────────────
  async getAllSections() {
    const [sections, content] = await Promise.all([
      db.query(`SELECT * FROM cms_sections ORDER BY sort_order ASC`),
      db.query(`SELECT * FROM cms_content ORDER BY sort_order ASC`),
    ]);

    const contentMap = {};
    content.rows.forEach(c => {
      if (!contentMap[c.section_id]) contentMap[c.section_id] = [];
      contentMap[c.section_id].push(c);
    });

    return sections.rows.map(s => {
      const sectionContent = contentMap[s.id] || [];
      const configBlock = sectionContent.find(c => c.content_key === 'main_config');
      let parsedConfig = {};
      if (configBlock && configBlock.json_value) {
        parsedConfig = typeof configBlock.json_value === 'string'
          ? JSON.parse(configBlock.json_value)
          : configBlock.json_value;
      }

      return {
        ...s,
        enabled: s.is_active,
        config: parsedConfig,
        content: sectionContent,
      };
    });
  }

  // ── Single Section ─────────────────────────────────────────
  async getSection(sectionKey) {
    const normKey = this.normalizeKey(sectionKey);
    const secRes = await db.query(
      `SELECT * FROM cms_sections WHERE section_key = $1 OR section_key = $2`,
      [sectionKey, normKey]
    );
    if (secRes.rows.length === 0) throw { status: 404, message: `Section '${sectionKey}' not found.` };

    const section = secRes.rows[0];
    const content = await db.query(
      `SELECT * FROM cms_content WHERE section_id = $1 ORDER BY sort_order ASC`,
      [section.id]
    );

    const configBlock = content.rows.find(c => c.content_key === 'main_config');
    let parsedConfig = {};
    if (configBlock && configBlock.json_value) {
      parsedConfig = typeof configBlock.json_value === 'string'
        ? JSON.parse(configBlock.json_value)
        : configBlock.json_value;
    }

    return {
      ...section,
      enabled: section.is_active,
      config: parsedConfig,
      content: content.rows
    };
  }

  // ── Public Announcement Bar ────────────────────────────────
  async getPublicAnnouncementBar() {
    try {
      const secRes = await db.query(
        `SELECT * FROM cms_sections WHERE section_key = $1 OR section_key = $2`,
        ['announcement_bar', 'announcementBar']
      );

      if (secRes.rows.length === 0) {
        return {
          enabled: true,
          text: 'FREE SHIPPING ON PREMIUM SILK COLLECTION',
          link: '/shop',
          backgroundColor: '#2b2b2b',
          textColor: '#ffffff'
        };
      }

      const section = secRes.rows[0];
      const content = await db.query(
        `SELECT * FROM cms_content WHERE section_id = $1 AND content_key = 'main_config'`,
        [section.id]
      );

      let config = {
        enabled: section.is_active,
        text: 'FREE SHIPPING ON PREMIUM SILK COLLECTION',
        link: '/shop',
        backgroundColor: '#2b2b2b',
        textColor: '#ffffff'
      };

      if (content.rows.length > 0 && content.rows[0].json_value) {
        const json = typeof content.rows[0].json_value === 'string'
          ? JSON.parse(content.rows[0].json_value)
          : content.rows[0].json_value;
        config = { ...config, ...json, enabled: section.is_active };
      }

      return config;
    } catch (err) {
      console.warn('[cmsService] Error getting public announcement bar:', err.message);
      return {
        enabled: true,
        text: 'FREE SHIPPING ON PREMIUM SILK COLLECTION',
        link: '/shop',
        backgroundColor: '#2b2b2b',
        textColor: '#ffffff'
      };
    }
  }

  // ── Update Section Content ─────────────────────────────────
  async updateSection(sectionKey, data) {
    const normKey = this.normalizeKey(sectionKey);
    let secRes = await db.query(
      `SELECT id FROM cms_sections WHERE section_key = $1 OR section_key = $2`,
      [sectionKey, normKey]
    );

    let sectionId;
    if (secRes.rows.length === 0) {
      const insRes = await db.query(
        `INSERT INTO cms_sections (section_key, title, is_active) VALUES ($1, $2, $3) RETURNING id`,
        [normKey || sectionKey, sectionKey, data.enabled ?? data.isActive ?? true]
      );
      sectionId = insRes.rows[0].id;
    } else {
      sectionId = secRes.rows[0].id;
    }

    const isActive = data.enabled !== undefined ? data.enabled : (data.isActive !== undefined ? data.isActive : true);

    await db.query(
      `UPDATE cms_sections SET is_active = $1 WHERE id = $2`,
      [isActive, sectionId]
    );

    // Save main config object into cms_content
    const existingConfig = await db.query(
      `SELECT id FROM cms_content WHERE section_id = $1 AND content_key = 'main_config'`,
      [sectionId]
    );

    const jsonValue = JSON.stringify(data);
    const textVal = data.text || data.heading || data.title || null;

    if (existingConfig.rows.length > 0) {
      await db.query(
        `UPDATE cms_content SET json_value = $1, text_value = $2, updated_at = NOW() WHERE id = $3`,
        [jsonValue, textVal, existingConfig.rows[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO cms_content (section_id, content_key, content_type, text_value, json_value) VALUES ($1, 'main_config', 'json', $2, $3)`,
        [sectionId, textVal, jsonValue]
      );
    }

    // Handle array content blocks if passed
    if (Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.id) {
          await db.query(
            `UPDATE cms_content SET
              content_key=$1, content_type=$2, text_value=$3,
              image_data=$4, video_url=$5, json_value=$6,
              sort_order=$7, is_published=$8, updated_at=NOW()
             WHERE id=$9 AND section_id=$10`,
            [
              block.contentKey, block.contentType || 'text',
              block.textValue || null, block.imageData || null,
              block.videoUrl || null,
              block.jsonValue ? JSON.stringify(block.jsonValue) : null,
              block.sortOrder || 0, block.isPublished ?? true,
              block.id, sectionId,
            ]
          );
        } else {
          await db.query(
            `INSERT INTO cms_content
              (section_id, content_key, content_type, text_value, image_data, video_url, json_value, sort_order, is_published)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [
              sectionId, block.contentKey, block.contentType || 'text',
              block.textValue || null, block.imageData || null,
              block.videoUrl || null,
              block.jsonValue ? JSON.stringify(block.jsonValue) : null,
              block.sortOrder || 0, block.isPublished ?? true,
            ]
          );
        }
      }
    }

    return this.getSection(sectionKey);
  }

  // ── Upload Media for Section ───────────────────────────────
  async uploadMedia(sectionKey, contentKey, imageData, contentType = 'image') {
    const normKey = this.normalizeKey(sectionKey);
    const secRes = await db.query(
      `SELECT id FROM cms_sections WHERE section_key = $1 OR section_key = $2`,
      [sectionKey, normKey]
    );
    if (secRes.rows.length === 0) throw { status: 404, message: `Section not found.` };

    const sectionId = secRes.rows[0].id;

    const existing = await db.query(
      `SELECT id FROM cms_content WHERE section_id = $1 AND content_key = $2`,
      [sectionId, contentKey]
    );

    if (existing.rows.length > 0) {
      await db.query(
        `UPDATE cms_content SET image_data = $1, updated_at = NOW() WHERE id = $2`,
        [imageData, existing.rows[0].id]
      );
      return { updated: true, contentKey };
    } else {
      await db.query(
        `INSERT INTO cms_content (section_id, content_key, content_type, image_data) VALUES ($1,$2,$3,$4)`,
        [sectionId, contentKey, contentType, imageData]
      );
      return { inserted: true, contentKey };
    }
  }

  // ── Publish / Unpublish Section ────────────────────────────
  async togglePublish(sectionKey, isActive) {
    const normKey = this.normalizeKey(sectionKey);
    const res = await db.query(
      `UPDATE cms_sections SET is_active = $1 WHERE section_key = $2 OR section_key = $3 RETURNING *`,
      [isActive, sectionKey, normKey]
    );
    if (res.rows.length === 0) throw { status: 404, message: `Section not found.` };
    return res.rows[0];
  }

  // ── Delete Content Block ───────────────────────────────────
  async deleteBlock(sectionKey, blockId) {
    const normKey = this.normalizeKey(sectionKey);
    const secRes = await db.query(
      `SELECT id FROM cms_sections WHERE section_key = $1 OR section_key = $2`,
      [sectionKey, normKey]
    );
    if (secRes.rows.length === 0) throw { status: 404, message: `Section not found.` };

    await db.query(
      `DELETE FROM cms_content WHERE id = $1 AND section_id = $2`,
      [blockId, secRes.rows[0].id]
    );
    return true;
  }
}

module.exports = new CmsService();
