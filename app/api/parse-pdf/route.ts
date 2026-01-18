/**
 * Author: Sambath Kumar Natarajan
 * 
 * PDF Parsing API - Production-Ready Version
 * Uses pdfjs-dist which works in serverless environments
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for large PDFs

export async function POST(req: NextRequest) {
    console.log("[API] /api/parse-pdf - Request received");

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error("[API] No file found in FormData");
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        console.log(`[API] Processing File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

        if (file.type !== 'application/pdf') {
            console.error("[API] Invalid file type:", file.type);
            return NextResponse.json({ error: "Invalid file type. Only PDF is supported." }, { status: 400 });
        }

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        console.log(`[API] Buffer created. Length: ${uint8Array.length}`);

        // Use pdfjs-dist (works in serverless)
        let text = '';

        try {
            // Dynamic import to avoid build issues
            const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

            // Load the PDF
            const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
            const pdf = await loadingTask.promise;

            console.log(`[API] PDF loaded. Pages: ${pdf.numPages}`);

            // Extract text from all pages
            const textPromises = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                textPromises.push(
                    pdf.getPage(i).then(async (page) => {
                        const textContent = await page.getTextContent();
                        return textContent.items
                            .map((item: any) => item.str)
                            .join(' ');
                    })
                );
            }

            const pageTexts = await Promise.all(textPromises);
            text = pageTexts.join('\n\n');

            console.log(`[API] Extracted ${text.length} characters from ${pdf.numPages} pages`);

        } catch (pdfError: any) {
            console.error("[API] PDF parsing error:", pdfError.message);

            // Fallback: Try to extract text using simple regex (for text-based PDFs)
            try {
                const decoder = new TextDecoder('utf-8');
                const pdfText = decoder.decode(uint8Array);

                // Extract text between stream markers (very basic)
                const textMatches = pdfText.match(/\(([^)]+)\)/g);
                if (textMatches && textMatches.length > 0) {
                    text = textMatches
                        .map(match => match.slice(1, -1))
                        .join(' ')
                        .replace(/\\n/g, '\n')
                        .replace(/\\/g, '');

                    console.log(`[API] Fallback extraction: ${text.length} characters`);
                }
            } catch (fallbackError: any) {
                console.error("[API] Fallback extraction failed:", fallbackError.message);
            }
        }

        // Validate we got some text
        if (!text || text.trim().length < 50) {
            console.warn("[API] Insufficient text extracted");
            return NextResponse.json({
                error: "Could not extract text from PDF. The PDF might be scanned images or encrypted. Please copy-paste your text manually.",
                fallback: true
            }, { status: 400 });
        }

        // Clean up the text
        const cleanText = text
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
            .trim();

        console.log(`[API] Final text length: ${cleanText.length} characters`);

        return NextResponse.json({
            text: cleanText,
            pageCount: text.split('\n\n').length,
            characterCount: cleanText.length
        });

    } catch (error: any) {
        console.error("[API] Critical PDF Parse Error:", error);
        return NextResponse.json({
            error: `Failed to parse PDF: ${error.message}. Please copy-paste your text manually.`,
            fallback: true
        }, { status: 500 });
    }
}
