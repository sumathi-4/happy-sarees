// controllers/admin/sareeCrownController.js
const sareeCrownService = require('../../services/admin/sareeCrownService');
const { success, error } = require('../../utils/response');

exports.list = async (req, res, next) => {
  try {
    const campaigns = await sareeCrownService.getAll();
    return success(res, { campaigns });
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const id = req.params.id ? Number(req.params.id) : null;
    const campaign = await sareeCrownService.get(id);
    return success(res, { campaign });
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const campaign = await sareeCrownService.create(req.body);
    return success(res, { campaign }, 'Campaign created.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const campaign = await sareeCrownService.update(id, req.body);
    return success(res, { campaign }, 'Campaign updated.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.stopVoting = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const campaign = await sareeCrownService.stopVoting(id);
    return success(res, { campaign }, 'Voting stopped.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.revealWinner = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const campaign = await sareeCrownService.revealWinner(id);
    return success(res, { campaign }, 'Winner revealed.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};
