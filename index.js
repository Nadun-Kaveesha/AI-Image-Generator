import dotenv from "dotenv"; // Import dotenv to load .env variables
import Replicate from "replicate"; // Import Replicate API client
import express from "express";
import { fileURLToPath } from "url"; // Import fileURLToPath to get the current file path
import path from "path"; // For serving the HTML file
import generateImage from "./generate-image.js";
import cors from "cors";



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
  await generateImage(prompt, res, __dirname);
});

// Start the server
app.listen(3001, "0.0.0.0", () => console.log("Server running on http://localhost:3001"));
