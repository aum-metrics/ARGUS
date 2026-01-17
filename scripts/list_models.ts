#!/usr/bin/env tsx
/**
 * Author: Sambath Kumar Natarajan
 * 
 * List Gemini Models Script
 * Lists available models from Google Generative AI API to verify key permissions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('No GEMINI_API_KEY found in .env.local');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Hack to access the model listing which isn't always exposed cleanly in the high level SDK
    // We can just try to hit a known model or use the admin API if possible, 
    // but standard SDK doesn't always have listModels easily accessible in all versions.
    // Actually, standard fetch is easier here to debug the raw endpoint.

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('AVAILABLE MODELS:');
        if (data.models) {
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (Supported: ${m.supportedGenerationMethods})`);
            });
        } else {
            console.log('No models found or error:', data);
        }
    } catch (error) {
        console.error('Error fetching models:', error);
    }
}

listModels();
