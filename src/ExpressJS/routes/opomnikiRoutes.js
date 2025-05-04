const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/opomnikiController');
const { preveriToken } = require('../middleware/authMiddleware');

router.get('/', preveriToken, ctrl.getAll); // Pridobi vse opomnike za prijavljenega uporabnika
router.post('/', preveriToken, ctrl.create); // Ustvari nov opomnik
router.patch('/:id/poslano', preveriToken, ctrl.markAsSent); // Označi opomnik kot poslan

module.exports = router;
