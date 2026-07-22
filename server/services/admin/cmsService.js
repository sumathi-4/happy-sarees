// ============================================================
//  cmsService.js — Homepage CMS Management
// ============================================================

const db = require('../../db');

class CmsService {

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

    return sections.rows.map(s => ({
      ...s,
      content: contentMap[s.id] || [],
    }));
  }

  // ── Single Section ─────────────────────────────────────────
  async getSection(sectionKey) {
    const secRes = await db.query(`SELECT * FROM cms_sections WHERE section_key = $1`, [sectionKey]);
    if (secRes.rows.length === 0) throw { status: 404, message: `Section '${sectionKey}' not found.` };

    const section = secRes.rows[0];
    const content = await db.query(
      `SELECT * FROM cms_content WHERE section_id = $1 ORDER BY sort_order ASC`,
      [section.id]
    );

    return { ...section, content: content.rows };
  }

  // ── Update Section Content ─────────────────────────────────
  async updateSection(sectionKey, data) {
    const secRes = await db.query(`SELECT id FROM cms_sections WHERE section_key = $1`, [sectionKey]);
    if (secRes.rows.length === 0) throw { status: 404, message: `Section '${sectionKey}' not found.` };

    const sectionId = secRes.rows[0].id;

    // Update section-level settings
    if (data.isActive !== undefined || data.title !== undefined) {
      await db.query(
        `UPDATE cms_sections SET
          title = COALESCE($1, title),
          is_active = COALESCE($2, is_active)
         WHERE id = $3`,
        [data.title || null, data.isActive ?? null, sectionId]
      );
    }

    // Handle content blocks
    if (Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.id) {
          // Update existing
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
          // Insert new
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
    const secRes = await db.query(`SELECT id FROM cms_sections WHERE section_key = $1`, [sectionKey]);
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
    const res = await db.query(
      `UPDATE cms_sections SET is_active = $1 WHERE section_key = $2 RETURNING *`,
      [isActive, sectionKey]
    );
    if (res.rows.length === 0) throw { status: 404, message: `Section not found.` };
    return res.rows[0];
  }

  // ── Delete Content Block ───────────────────────────────────
  async deleteBlock(sectionKey, blockId) {
    const secRes = await db.query(`SELECT id FROM cms_sections WHERE section_key = $1`, [sectionKey]);
    if (secRes.rows.length === 0) throw { status: 404, message: `Section not found.` };

    await db.query(
      `DELETE FROM cms_content WHERE id = $1 AND section_id = $2`,
      [blockId, secRes.rows[0].id]
    );
    return true;
  }
}

module.exports = new CmsService();
