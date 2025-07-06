const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/opomnikiController');
const { preveriToken } = require('../middleware/authMiddleware');

router.get('/', preveriToken, ctrl.getAll);
router.post('/', preveriToken, ctrl.create);
router.patch('/:id/poslano', preveriToken, ctrl.markAsSent);

module.exports = router;
