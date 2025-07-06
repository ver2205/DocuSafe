const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pushController');
const { preveriToken } = require('../middleware/authMiddleware');

router.post('/subscribe', preveriToken, ctrl.subscribe);

module.exports = router;
