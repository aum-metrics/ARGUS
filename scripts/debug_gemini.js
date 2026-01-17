#!/usr/bin/env node
/**
 * Author: Sambath Kumar Natarajan
 * 
 * Gemini Debug Script
 * Tests connectivity to Google Gemini API and lists available models
 */

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    try {
        // 1. Load Env
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error("❌ .env.local file NOT FOUND");
            return;
        }

        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);

        if (!match || !match[1]) {
            console.error("❌ GEMINI_API_KEY not found in .env.local");
            return;
        }

        const apiKey = match[1].trim();
        console.log("✅ API Key found:", apiKey.substring(0, 5) + "...");

        // 2. List Models (Direct REST)
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        console.log("Fetching model list from:", url.replace(apiKey, "HIDDEN_KEY"));

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Error:", JSON.stringify(data.error, null, 2));
        } else if (data.models) {
            console.log("✅ Models Available:");
            data.models.forEach(m => console.log(` - ${m.name} (${m.supportedGenerationMethods})`));

            // Explicitly test the model we just switched to
            const targetModel = "gemini-2.0-flash";
            console.log(`\nAttempting generation with target model: '${targetModel}'...`);

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: targetModel });
            const result = await model.generateContent("Test connection with 2.0 Flash.");
            const response = await result.response;
            console.log("✅ SUCCESS! Content generated:", response.text());
        } else {
            console.log("⚠️ No models returned (empty list).", data);
        }

    } catch (error) {
        console.error("Script Error:", error);
    }
}

testGemini();
