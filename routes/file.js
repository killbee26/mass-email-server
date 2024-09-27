const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file'); // 'file' is the field name

// Route to upload file
router.post('/uploadFile', upload, fileController.uploadFile);

// Route to download file
router.get('/download/:fileID', fileController.downloadFile);

module.exports = router;
