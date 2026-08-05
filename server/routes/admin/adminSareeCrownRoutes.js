// routes/admin/adminSareeCrownRoutes.js
const router  = require('express').Router();
const ctrl    = require('../../controllers/admin/sareeCrownController');
const { adminAuth } = require('../../middleware/adminAuth');

router.get('/', adminAuth, ctrl.get);
router.put('/', adminAuth, ctrl.save);
router.post('/stop-voting', adminAuth, ctrl.stopVoting);
router.post('/reveal-winner', adminAuth, ctrl.revealWinner);

module.exports = router;
