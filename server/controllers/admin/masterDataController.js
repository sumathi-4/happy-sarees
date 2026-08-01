// controllers/admin/masterDataController.js
const masterDataService = require('../../services/admin/masterDataService');
const { success, error, paginated } = require('../../utils/response');

exports.getAllTypes = async (req, res, next) => {
  try { return success(res, { types: await masterDataService.getAllTypes() }); } catch (e) { next(e); }
};

exports.getAllItems = async (req, res, next) => {
  try { return success(res, { items: await masterDataService.getAllItems() }); } catch (e) { next(e); }
};

exports.getItems = async (req, res, next) => {
  try {
    const result = await masterDataService.getItems(parseInt(req.params.typeId), req.query);
    return paginated(res, result.items, result.total, result.page, result.limit);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.createItem = async (req, res, next) => {
  try {
    const item = await masterDataService.createItem(parseInt(req.params.typeId), req.body);
    return success(res, { item }, 'Item created.', 201);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const item = await masterDataService.updateItem(parseInt(req.params.typeId), parseInt(req.params.id), req.body);
    return success(res, { item }, 'Item updated.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.deleteItem = async (req, res, next) => {
  try {
    await masterDataService.deleteItem(parseInt(req.params.typeId), parseInt(req.params.id));
    return success(res, {}, 'Item deleted.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.toggleItem = async (req, res, next) => {
  try {
    const item = await masterDataService.toggleItem(parseInt(req.params.typeId), parseInt(req.params.id));
    return success(res, { item }, `Item ${item.isActive ? 'activated' : 'deactivated'}.`);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.reorderItems = async (req, res, next) => {
  try {
    await masterDataService.reorderItems(req.body.items);
    return success(res, {}, 'Items reordered.');
  } catch (e) { next(e); }
};

exports.createType = async (req, res, next) => {
  try {
    const type = await masterDataService.createType(req.body);
    return success(res, { type }, 'Master type created.', 201);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.updateType = async (req, res, next) => {
  try {
    const type = await masterDataService.updateType(req.params.id, req.body);
    return success(res, { type }, 'Master type updated.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.deleteType = async (req, res, next) => {
  try {
    await masterDataService.deleteType(req.params.id);
    return success(res, {}, 'Master type deleted.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.toggleType = async (req, res, next) => {
  try {
    const type = await masterDataService.toggleType(req.params.id);
    return success(res, { type }, `Master type ${type.isActive ? 'activated' : 'deactivated'}.`);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};
