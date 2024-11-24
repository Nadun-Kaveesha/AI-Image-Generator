import dotenv from "dotenv"; // Import dotenv to load .env variables
import Replicate from "replicate"; // Import Replicate API client
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url"; // Import fileURLToPath to get the current file path
import { writeFile } from "node:fs/promises"; // To save output images
import path from "path"; // For serving the HTML file
import textDetectionAndTranslation from "./languageDetectionAndTranslation.js";

// Load environment variables from the .env file
dotenv.config();

// Initialize the Replicate API client with the token from .env
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Create the Express app
const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.static("images")); // Serve static files from the 'images' directory

// Get the current directory path (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the frontend `index.html` file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "main.html")); // Make sure `index.html` is in the same directory
});

// Handle the image generation
app.post("/generate-image", async (req, res) => {
  const { prompt } = req.body; // Get the user input from the frontend
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
    for (const [index, item] of Object.entries(output)) {
      // Save the PNG image
      await writeFile(`output_${index}.png`, item, "base64"); // Assumes output is base64 encoded
      const imagePath = path.join(__dirname, `output_${index}.png`);
      console.log(`Image saved locally at ${imagePath}`);
      res.sendFile(imagePath);
    }
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Failed to generate image." });
  }
});

// Start the server
app.listen(3001, () => console.log("Server running on http://localhost:3001"));
