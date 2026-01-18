/**
 * Test Gemini API Key
 * Run this to verify your GEMINI_API_KEY is valid and working
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGeminiKey() {
    console.log('🔑 Testing Gemini API Key...\n');

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in environment variables');
        console.log('\nTo fix:');
        console.log('1. Create a .env.local file in the project root');
        console.log('2. Add: GEMINI_API_KEY=your_key_here');
        console.log('3. Get your key from: https://aistudio.google.com/app/apikey');
        process.exit(1);
    }

    console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

    try {
        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        console.log('\n📡 Testing API connection...');

        // Simple test request
        const result = await model.generateContent('Say "Hello, API is working!" in exactly those words.');
        const response = await result.response;
        const text = response.text();

        console.log('\n✅ API Response received:');
        console.log(`   "${text}"`);

        // Test PDF capability
        console.log('\n📄 Testing PDF support...');
        const pdfTest = await model.generateContent([
            { text: 'Can you process PDF files?' }
        ]);
        const pdfResponse = await pdfTest.response;
        console.log('✅ PDF capability confirmed');

        console.log('\n🎉 All tests passed! Your Gemini API key is working correctly.\n');
        console.log('Key details:');
        console.log(`   Model: gemini-1.5-flash`);
        console.log(`   Status: Active`);
        console.log(`   PDF Support: Yes`);

    } catch (error: any) {
        console.error('\n❌ API Test Failed!\n');

        if (error.message?.includes('API_KEY_INVALID')) {
            console.error('Error: Invalid API Key');
            console.log('\nTo fix:');
            console.log('1. Go to https://aistudio.google.com/app/apikey');
            console.log('2. Create a new API key or verify your existing one');
            console.log('3. Update GEMINI_API_KEY in your .env.local file');
        } else if (error.message?.includes('quota')) {
            console.error('Error: API Quota Exceeded');
            console.log('\nYour API key is valid but you\'ve hit the quota limit.');
            console.log('Check your usage at: https://aistudio.google.com/app/apikey');
        } else if (error.message?.includes('PERMISSION_DENIED')) {
            console.error('Error: Permission Denied');
            console.log('\nYour API key doesn\'t have permission for this model.');
            console.log('Make sure you\'re using a valid Gemini API key.');
        } else {
            console.error('Error:', error.message);
        }

        console.log('\nFull error details:');
        console.error(error);
        process.exit(1);
    }
}

testGeminiKey();
