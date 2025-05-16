const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/uporabnikiController');
const { preveriToken } = require('../middleware/authMiddleware');

router.post('/', ctrl.create); // Registracija
router.post('/prijava', ctrl.login); // Prijava (vrne token)
router.get('/', preveriToken, ctrl.getAll); // Zaščiteno
router.put('/:id', preveriToken, ctrl.update); // Zaščiteno
router.delete('/:id', preveriToken, ctrl.remove); // Zaščiteno

module.exports = router;
