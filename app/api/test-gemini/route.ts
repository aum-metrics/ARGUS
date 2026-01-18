/**
 * Test Gemini API Key in Production
 * Hit this endpoint to verify GEMINI_API_KEY is working in Vercel
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        // Check if key exists
        if (!apiKey) {
            return NextResponse.json({
                status: 'error',
                message: 'GEMINI_API_KEY not found in environment variables',
                fix: 'Add GEMINI_API_KEY to Vercel environment variables'
            }, { status: 500 });
        }

        // Mask the key for security
        const maskedKey = `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`;

        // Test the API
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

        const result = await model.generateContent('Say "OK" if you can read this.');
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            status: 'success',
            message: 'Gemini API key is working correctly!',
            details: {
                keyMasked: maskedKey,
                model: 'gemini-1.5-flash',
                testResponse: text.substring(0, 50),
                pdfSupport: 'Available'
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: 'Gemini API test failed',
            error: error.message,
            details: {
                type: error.message?.includes('API_KEY_INVALID') ? 'Invalid API Key' :
                    error.message?.includes('quota') ? 'Quota Exceeded' :
                        error.message?.includes('PERMISSION_DENIED') ? 'Permission Denied' :
                            'Unknown Error'
            }
        }, { status: 500 });
    }
}
