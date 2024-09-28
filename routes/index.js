const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const fileRoutes = require('./file')

// Use the auth routes
router.use('/auth', authRoutes);


// Use the file routes (protected by authMiddleware)
router.use('/file', fileRoutes);


module.exports = router;
