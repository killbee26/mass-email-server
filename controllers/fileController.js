const AWS = require('aws-sdk');
const File = require('../models/Files');
const User = require('../models/User')
// AWS S3 configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Upload file to S3
exports.uploadFile = async (req, res) => {
    const { userID } = req.body;  // Assuming userID (UUID) is passed in the request
    const file = req.file;        // Assuming you're using multer for file parsing
    
    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    try {
        // Fetch the user using the UUID
        const user = await User.findOne({ userID }); // Find the user by UUID
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `uploads/${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        // Upload to S3
        const data = await s3.upload(params).promise();

        // Store file metadata in your database with the ObjectId of the user
        const newFile = new File({
            fileName: file.originalname,
            s3Key: data.Key,            // S3 key of the uploaded file
            uploadedBy: user.userID,        // User's ObjectId
            fileURL: data.Location       // S3 public URL of the file (Location from S3 response)
        });

        console.log(data);
        console.log(newFile);
        
        await newFile.save();

        res.status(200).json({ message: 'File uploaded successfully', data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error uploading file' });
    }
};

// Download file from S3 using the URL stored in the database
exports.downloadFile = async (req, res) => {
    const { fileID } = req.params;

    try {
        // Find file metadata from the database
        const fileRecord = await File.findOne({ fileID });
        if (!fileRecord) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Redirect the user to the S3 file URL (stored in the database)
        res.redirect(fileRecord.fileURL);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error downloading file' });
    }
};
