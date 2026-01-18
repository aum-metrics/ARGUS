/**
 * PDF Parsing using Google Gemini AI SDK
 * Re-enabled with transparent disclosure about AI processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    console.log("[API] /api/parse-pdf - Request received");

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: "Invalid file type. Only PDF is supported." }, { status: 400 });
        }

        console.log(`[API] Processing: ${file.name} (${file.size} bytes)`);

        // Check for API key
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!geminiApiKey) {
            console.error("[API] Missing GEMINI_API_KEY");
            return NextResponse.json({
                error: "PDF parsing service not configured. Please paste text manually.",
                fallback: true
            }, { status: 503 });
        }

        try {
            // Convert to base64
            const arrayBuffer = await file.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');

            // Initialize Gemini AI
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash' // Vision-capable model for charts/images
            });

            // Create request with PDF
            const result = await model.generateContent([
                {
                    text: "Extract all text from this PDF document, including any text visible in charts, diagrams, or images. Return only the extracted text content, no commentary. Preserve paragraph breaks and structure."
                },
                {
                    inlineData: {
                        mimeType: "application/pdf",
                        data: base64
                    }
                }
            ]);

            const response = await result.response;
            const text = response.text();

            if (!text || text.trim().length < 50) {
                console.warn("[API] Insufficient text extracted");
                return NextResponse.json({
                    error: "Could not extract enough text from PDF. The PDF might be encrypted or corrupted. Please paste text manually.",
                    fallback: true
                }, { status: 400 });
            }

            console.log(`[API] Successfully extracted ${text.length} characters`);

            return NextResponse.json({
                text: text.trim(),
                characterCount: text.length,
                method: 'gemini-vision',
                disclosure: 'Processed using Google Gemini 2.5 AI'
            });

        } catch (apiError: any) {
            console.error("[API] PDF extraction failed:", apiError.message);

            // Check for specific error types
            if (apiError.message?.includes('quota')) {
                return NextResponse.json({
                    error: "API quota exceeded. Please try again later or paste text manually.",
                    fallback: true
                }, { status: 429 });
            }

            return NextResponse.json({
                error: "Failed to extract text from PDF. Please paste text manually.",
                fallback: true
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("[API] Critical error:", error);
        return NextResponse.json({
            error: `Failed to process PDF: ${error.message}`,
            fallback: true
        }, { status: 500 });
    }
}
