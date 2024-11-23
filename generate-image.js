import dotenv from "dotenv"; // Import dotenv to load .env variables
import Replicate from "replicate"; // Import Replicate API client
import { writeFile } from "node:fs/promises"; // To save output images
import readline from "readline-sync";

// Load environment variables from the .env file
dotenv.config();

// Initialize the Replicate API client with the token from .env
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const userInput = String(
  readline.question("Enter your Prompt : ")
);

// Define the input for the model
const input = {
  prompt:userInput, 
  resolution: "1024x1024", 
  output_format: "png", 
  num_outputs: 1, 
  aspect_ratio: "1:1", 
  output_quality: 100, 
  num_inference_steps: 4, 
  disable_safety_checker: true, 
};

async function generateImage() {
  try {
    console.log("\nStarting image generation...");

    // Call the Flux Schnell model with the updated input
    const output = await replicate.run(
      "black-forest-labs/flux-schnell", // Model name
      { input } // Pass the input parameters
    );

    console.log("Image generation completed. Saving to disk...");

    // Loop through the output and save the images
    for (const [index, item] of Object.entries(output)) {
      // Save the PNG image
      await writeFile(`output_${index}.png`, item, "base64"); // Assumes output is base64 encoded
      console.log(`Saved output_${index}.png`);
    }

    console.log("All images saved successfully!");
  } catch (error) {
    console.error("Error during image generation:", error);
  }
}

// Run the image generation
generateImage();
