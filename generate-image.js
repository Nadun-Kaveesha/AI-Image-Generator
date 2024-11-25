import dotenv from "dotenv"; // Import dotenv to load .env variables
import Replicate from "replicate"; // Import Replicate API client
import { writeFile, unlink } from "node:fs/promises"; // To save and delete files
import path from "path"; // For serving the HTML file
import textDetectionAndTranslation from "./languageDetectionAndTranslation.js";
import uploadImageToS3 from "./upload-image.js";

// Load environment variables from the .env file
dotenv.config();

// Initialize the Replicate API client with the token from .env
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generateImage(prompt, res, __dirname) {
  let translatedText;
  try {
    translatedText = await textDetectionAndTranslation(prompt); // Await the promise for translated text
    console.log("\nTranslated text:", translatedText);
  } catch (error) {
    console.error("Translation failed:", error);
    return res.status(500).json({ error: "Failed to translate prompt." });
  }

  const input = {
    prompt: translatedText,
    resolution: "1024x1024",
    output_format: "png",
    num_outputs: 1,
    aspect_ratio: "1:1",
    output_quality: 100,
    num_inference_steps: 4,
    disable_safety_checker: true,
    go_fast: false,
  };

  try {
    console.log("Starting image generation...");
    // Call the Flux Schnell model with the updated input
    const output = await replicate.run(
      "black-forest-labs/flux-schnell", // Model name
      { input }
    );

    // Save the image locally and send the URL back to the frontend
    for (const item of output) {
      // Generate a unique filename using the current timestamp
      const timestamp = Date.now();
      const fileName = `output_${timestamp}.png`;
      const imagePath = path.join(__dirname, fileName);

      // Save the PNG image locally
      await writeFile(imagePath, item, "base64"); // Assumes output is base64 encoded

      // Upload the image to S3
      try {
        const s3Link = await uploadImageToS3(imagePath, fileName);
        console.log(`Image uploaded successfully to S3: ${s3Link}`);

        // Delete the local file after successful upload
        await unlink(imagePath);
        console.log(`Local file deleted: ${imagePath}`);

        // Respond with the S3 link
        return res.status(200).json({ link: s3Link });
      } catch (error) {
        console.error("Error uploading image to S3:", error);
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Failed to generate image." });
  }
}

export default generateImage;
