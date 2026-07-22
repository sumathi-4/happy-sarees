// controllers/admin/cmsController.js
const cmsService = require('../../services/admin/cmsService');
const { success, error } = require('../../utils/response');

exports.getAllSections = async (req, res, next) => {
  try { return success(res, { sections: await cmsService.getAllSections() }); } catch (e) { next(e); }
};

exports.getSection = async (req, res, next) => {
  try {
    return success(res, { section: await cmsService.getSection(req.params.section) });
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.updateSection = async (req, res, next) => {
  try {
    return success(res, { section: await cmsService.updateSection(req.params.section, req.body) }, 'Section updated.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.uploadMedia = async (req, res, next) => {
  try {
    const { contentKey, imageData, contentType } = req.body;
    if (!imageData) return error(res, 'imageData is required.', 400);
    return success(res, await cmsService.uploadMedia(req.params.section, contentKey, imageData, contentType), 'Media uploaded.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.togglePublish = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    return success(res, { section: await cmsService.togglePublish(req.params.section, isActive) }, `Section ${isActive ? 'published' : 'unpublished'}.`);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.deleteBlock = async (req, res, next) => {
  try {
    await cmsService.deleteBlock(req.params.section, req.params.blockId);
    return success(res, {}, 'Block deleted.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};
