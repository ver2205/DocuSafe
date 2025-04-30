const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dokumentiController');
const { preveriToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const uploadCtrl = require('../controllers/dokumentiUploadController');

router.get('/', preveriToken, ctrl.getAll); // GET dokumentix
router.get('/:id', preveriToken, ctrl.getById); // GET en dokument
router.post('/', preveriToken, ctrl.create); // POST dokument
router.put('/:id', preveriToken, ctrl.update); // PUT dokument
router.delete('/:id', preveriToken, ctrl.remove); // DELETE dokument

module.exports = router;
