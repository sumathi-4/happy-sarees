// controllers/admin/sareeCrownController.js
const sareeCrownService = require('../../services/admin/sareeCrownService');
const { success, error } = require('../../utils/response');

exports.get = async (req, res, next) => {
  try {
    const campaign = await sareeCrownService.get();
    return success(res, { campaign });
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.save = async (req, res, next) => {
  try {
    const campaign = await sareeCrownService.save(req.body);
    return success(res, { campaign }, 'Campaign saved.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.stopVoting = async (req, res, next) => {
  try {
    const campaign = await sareeCrownService.stopVoting();
    return success(res, { campaign }, 'Voting stopped.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.revealWinner = async (req, res, next) => {
  try {
    const campaign = await sareeCrownService.revealWinner();
    return success(res, { campaign }, 'Winner revealed.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};
