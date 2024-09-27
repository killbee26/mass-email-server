const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const fileSchema = new mongoose.Schema({
    fileID: {
        type: String,
        default: uuidv4, // Automatically generate a UUID for each file
    },
    fileName: {
        type: String,
        required: true,
    },
    s3Key: {
        type: String,
        required: true,
    },
    fileURL: {
        type: String, // Store S3 file URL here
        required: true,
    },
    uploadedBy: {
        type: String,  // Reference to the User model
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('File', fileSchema);
