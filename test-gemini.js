
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

async function listModels() {
    if (!API_KEY) {
        console.error("No API key found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    try {
        console.log("Attempting to list models...");
        // The SDK doesn't have a direct 'listModels' on the class, 
        // we usually use the fetch API or a specific method if available in this version.
        // In newer SDKs, we might need to use the REST API directly for listing.

        // Let's try to just check one known model with a simple prompt
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("test");
        console.log("Communication successful with gemini-1.5-flash");
        console.log("Response:", result.response.text());
    } catch (error) {
        console.error("Diagnostic Error:", error.message);
        if (error.stack) console.error("Stack:", error.stack);
    }
}

listModels();
