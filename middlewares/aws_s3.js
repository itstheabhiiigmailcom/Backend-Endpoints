import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Upload a file to AWS S3
 * @param {Object} file - File object (from Multer)
 * @returns {Promise<Object>} - S3 Upload response
 */
export const uploadToS3 = async (file) => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const fileKey = `${Date.now()}-${file.originalname}`; // Generate a unique file name

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `garbage_pdfs/${fileKey}`,
    Body: file.buffer, // File buffer (from Multer)
    ContentType: file.mimetype
  };

  return s3.upload(params).promise(); // Return the S3 upload promise
};
