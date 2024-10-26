const AWS = require('aws-sdk');
const File = require('../models/Files');
const User = require('../models/User')
// AWS S3 configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const lambda = new AWS.Lambda({
    region: process.env.AWS_REGION, // Ensure the correct region
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

exports.getUserFilesWithDate = async (req, res) => {
    const userID = req.user.userID;  // Extracted from the JWT middleware
    const { startDate, endDate } = req.query;

    try {
         // Parse start and end date
         const start = new Date(startDate);
         const end = new Date(endDate);
 
         // Validate dates
         if (isNaN(start.valueOf()) || isNaN(end.valueOf())) {
             return res.status(400).json({ error: 'Invalid date(s) provided.' });
         }
        const userFiles = await File.find({
            uploadedBy: userID,
            createdAt: {
                $gte: start, // Start of the day for startDate
                $lte: end, // End of the day for endDate
            },
        });
        
        if (!userFiles || userFiles.length === 0) {
            return res.status(404).json({ message: "No files found for the user." });
        }

        res.status(200).json(userFiles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching user files." });
    }
};


exports.getUserFiles = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming you are using some kind of authentication middleware

        // Fetch all file objects for the user
        const files = await File.find({ userId });

        // Respond with the fetched files
        return res.status(200).json(files);
    } catch (error) {
        console.error('Error fetching user files:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};



exports.sendEmails = async (req, res) => {
    // Extract file IDs and email content from the request body
    const { fileIds, sender, subject, body } = req.body;  // Frontend sends the array of fileIDs and email content
  
    try {
      // Fetch the corresponding files from the database based on file IDs
      const files = await File.find({ fileID: { $in: fileIds } });
  
      if (!files.length) {
        return res.status(404).json({ message: "No files found" });
      }
  
      // Extract the S3 keys from the fetched files
      const s3Keys = files.map((file) => file.s3Key);
  
      // Log the s3Keys to verify
      console.info("S3 Keys: ", s3Keys);
  
      // Prepare payload for Lambda function including S3 keys and email content
      const params = {
        FunctionName: 'sendBulkEmails',  // Replace with your Lambda function's name
        Payload: JSON.stringify({
          s3Keys,        // List of S3 keys (files)
          sender,        // Email sender
          subject,       // Email subject
          body           // Email body content
        }),  // Pass the S3 keys and email content to Lambda
      };
      console.info("Sender:",sender);
      console.info("Body:",body);
      console.info("subject:",subject);


      console.info(params.Payload);
  
      // Invoke the Lambda function
      const lambdaResponse = await lambda.invoke(params).promise();
  
      // Respond back to the client with success
      res.status(200).json({ message: "Emails sent successfully", data: lambdaResponse });
  
    } catch (error) {
      console.error("Error in sending emails: ", error);
      res.status(500).json({ message: "Error sending emails", error });
    }
  };
  