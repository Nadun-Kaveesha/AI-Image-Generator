import dotenv from "dotenv"; // Import dotenv to load .env variables
import AWS from 'aws-sdk';
import fs from 'fs';

// Load environment variables from the .env file
dotenv.config();


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, 
});


async function uploadImageToS3 (filePath, uniqueIdentifier) {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    ACL: "public-read",
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: uniqueIdentifier,
    Body: fileContent,
    ContentType: "image/png", // Adjust as needed
  };
  try {
    await s3.upload(params).promise();
    console.log(`Image uploaded to S3 at: https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${uniqueIdentifier}`);
  } catch (error) {
    console.error("Error uploading image to S3:", error);
  }
  const s3Link =  `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${uniqueIdentifier}`;
  return s3Link;
};


export default uploadImageToS3;
