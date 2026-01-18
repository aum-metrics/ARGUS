/**
 * PDF Parsing using Google Document AI
 * Cloud-based solution that works in serverless environments
 */

import { NextRequest, NextResponse } from 'next/server';

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

        // Convert to base64 for API
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        // Option 1: Use Google Gemini API (you already have GEMINI_API_KEY)
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!geminiApiKey) {
            console.error("[API] Missing GEMINI_API_KEY");
            return NextResponse.json({
                error: "PDF parsing service not configured. Please paste text manually.",
                fallback: true
            }, { status: 503 });
        }

        try {
            // Use Gemini to extract text from PDF
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    text: "Extract all text from this PDF document. Return only the extracted text, no commentary."
                                },
                                {
                                    inline_data: {
                                        mime_type: "application/pdf",
                                        data: base64
                                    }
                                }
                            ]
                        }]
                    })
                }
            );

            if (!response.ok) {
                const error = await response.text();
                console.error("[API] Gemini API error:", error);
                throw new Error(`Gemini API failed: ${response.status}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text || text.trim().length < 50) {
                console.warn("[API] Insufficient text extracted");
                return NextResponse.json({
                    error: "Could not extract enough text from PDF. Please paste text manually.",
                    fallback: true
                }, { status: 400 });
            }

            console.log(`[API] Extracted ${text.length} characters`);

            return NextResponse.json({
                text: text.trim(),
                characterCount: text.length,
                method: 'gemini-api'
            });

        } catch (apiError: any) {
            console.error("[API] PDF extraction failed:", apiError.message);
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
