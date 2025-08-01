const express = require('express');
const router = express.Router();
const sessionStorageController = require('../controllers/sessionStorageController');

router.post('/upload', sessionStorageController.upload);
router.get('/download', sessionStorageController.download);

module.exports = router;