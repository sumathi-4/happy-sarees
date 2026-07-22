// controllers/admin/productController.js
const productService = require('../../services/admin/productService');
const { success, error, paginated } = require('../../utils/response');
const db = require('../../db');

exports.getAll = async (req, res, next) => {
  try {
    const result = await productService.getAll(req.query);
    return paginated(res, result.products, result.total, result.page, result.limit);
  } catch (e) { next(e); }
};

exports.getById = async (req, res, next) => {
  try {
    const product = await productService.getById(parseInt(req.params.id));
    return success(res, { product });
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const product = await productService.create(req.body);
    // Log activity
    await db.query(
      `INSERT INTO admin_activity_log (admin_user_id, action, entity_type, entity_id, description)
       VALUES ($1,'product.create','product',$2,$3)`,
      [req.adminUser.adminId, product.id, `Created product: ${product.name}`]
    );
    return success(res, { product }, 'Product created successfully.', 201);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const product = await productService.update(parseInt(req.params.id), req.body);
    await db.query(
      `INSERT INTO admin_activity_log (admin_user_id, action, entity_type, entity_id, description) VALUES ($1,'product.update','product',$2,$3)`,
      [req.adminUser.adminId, product.id, `Updated product: ${product.name}`]
    );
    return success(res, { product }, 'Product updated successfully.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.delete = async (req, res, next) => {
  try {
    await productService.delete(parseInt(req.params.id));
    await db.query(
      `INSERT INTO admin_activity_log (admin_user_id, action, entity_type, entity_id, description) VALUES ($1,'product.delete','product',$2,'Product deleted')`,
      [req.adminUser.adminId, req.params.id]
    );
    return success(res, {}, 'Product deleted successfully.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.bulkAction = async (req, res, next) => {
  try {
    const { ids, action } = req.body;
    const result = await productService.bulkAction(ids, action);
    return success(res, result, `Bulk action '${action}' applied to ${result.affected} products.`);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.addImage = async (req, res, next) => {
  try {
    const { imageData, altText, isPrimary } = req.body;
    if (!imageData) return error(res, 'imageData is required.', 400);
    const result = await productService.addImage(parseInt(req.params.id), imageData, altText, isPrimary);
    return success(res, { image: result }, 'Image added.', 201);
  } catch (e) { next(e); }
};

exports.removeImage = async (req, res, next) => {
  try {
    await productService.removeImage(parseInt(req.params.id), parseInt(req.params.imageId));
    return success(res, {}, 'Image removed.');
  } catch (e) { next(e); }
};
