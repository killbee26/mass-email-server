const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4 // Automatically generates a UUID as the userID
      },
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    email: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);
