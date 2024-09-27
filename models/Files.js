const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const fileSchema = new mongoose.Schema({
    fileID: {
        type: String,
        required: true,
        default: uuidv4  // Automatically generates a UUID as the fileID
    },
    fileName: {
        type: String,
        required: true
    },
    s3Key: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    uploadedBy: {
        type: mongoose.Schema.Types.String,
        ref: 'User',  // Reference to the User model
        required: true
    }
});

module.exports = mongoose.model('File', fileSchema);
