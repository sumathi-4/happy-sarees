// routes/admin/adminSareeCrownRoutes.js
const router  = require('express').Router();
const ctrl    = require('../../controllers/admin/sareeCrownController');
const { adminAuth } = require('../../middleware/adminAuth');

router.get('/', adminAuth, ctrl.list);
router.post('/', adminAuth, ctrl.create);
router.get('/:id', adminAuth, ctrl.get);
router.put('/:id', adminAuth, ctrl.update);
router.post('/:id/stop-voting', adminAuth, ctrl.stopVoting);
router.post('/:id/reveal-winner', adminAuth, ctrl.revealWinner);

module.exports = router;
