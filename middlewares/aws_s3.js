import AWS from "aws-sdk";
import fs from "fs";
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
export const uploadToS3 = async ({ filePath, fileName, mimetype }) => {
  try {
    // Create a readable stream from the file
    const fileStream = fs.createReadStream(filePath);

    // S3 upload parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME, // bucket name
      Key: `garbage_pdfs/${fileName}`, // S3 key (path inside the bucket)
      Body: fileStream,
      ContentType: mimetype, // MIME type
    };

    // Upload to S3
    const uploadResult = await s3.upload(params).promise();
    fs.unlinkSync(filePath);      // delete it from disk
    return uploadResult;
  } catch (err) {
    fs.unlinkSync(localFilePath)
    console.error("Error uploading to S3:", err.message);
    throw err;
  }
};
