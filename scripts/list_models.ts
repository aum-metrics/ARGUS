
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API KEY found in .env.local");
    process.exit(1);
}

async function main() {
    const genAI = new GoogleGenerativeAI(apiKey || "");
    // There isn't a direct listModels on genAI instance in some versions, 
    // it's usually on the ModelManager or similar. 
    // But let's check the error message advice: "Call ListModels".
    // Actually, usually it's fetch based or via specific client.
    // The node SDK might not expose listModels directly on the main class easily.
    // Wait, check documentation?
    // Actually, I'll try to get ANY model and see if it works, or if there is a method.
    // But wait, the error message literally says "Call ListModels".

    // Let's try raw REST call using the key, it's reliable.
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

main();
