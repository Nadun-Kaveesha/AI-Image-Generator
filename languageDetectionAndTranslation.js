import { franc } from "franc-min";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();


async function textDetectionAndTranslation(userText){
    const langCode = franc(userText);
    if(langCode === "sin"){
        const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.CLOUD_TRANSLATION_API}`;
        const requestBody = {
            q: userText,
            source: "si", // Source language: Sinhala
            target: "en", // Target language: English
        };
        try {
            const response = await axios.post(url, requestBody);
            const redifinedResponse =  (response.data.data.translations[0].translatedText + ", realistic");
            return redifinedResponse;
        }catch (error) {
           console.error("Error Translating prompt to Sinhala:", error);
           throw new Error("Failed to translate prompt to Sinhala.");
         }
    }else  {
      return userText + ", realistic";
    }
}

export default textDetectionAndTranslation;