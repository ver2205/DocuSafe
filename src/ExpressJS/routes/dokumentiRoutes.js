const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dokumentiController');
const { preveriToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', preveriToken, ctrl.getAll);
router.get('/:id', preveriToken, ctrl.getById);
router.post('/', preveriToken, ctrl.create);
router.put('/:id', preveriToken, ctrl.update);
router.delete('/:id', preveriToken, ctrl.remove);
router.post('/upload', upload.single('file'), preveriToken, ctrl.uploadPdf);
router.get('/:id/pdf', preveriToken, ctrl.getPdf);

module.exports = router;
