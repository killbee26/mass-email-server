const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware'); 


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file'); // 'file' is the field name

// Route to upload file
router.post('/uploadFile', authMiddleware, upload, fileController.uploadFile);

// Route to download file
router.get('/download/:fileID', authMiddleware, fileController.downloadFile);

router.get('/userFilesWithDate', authMiddleware, fileController.getUserFilesWithDate);

router.get('/getUserFiles', authMiddleware,fileController.getUserFiles);

router.post('/sendEmailsToAws',authMiddleware,fileController.sendEmails)

module.exports = router;
