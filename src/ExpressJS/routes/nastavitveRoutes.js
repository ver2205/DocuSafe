const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/nastavitveController');
const { preveriToken } = require('../middleware/authmiddleware');

router.get('/', preveriToken, ctrl.getForUser);
router.post('/', preveriToken, ctrl.saveForUser);

module.exports = router;
