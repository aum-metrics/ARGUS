/**
 * PDF Parsing - DISABLED for Privacy
 * 
 * We've disabled PDF upload to maintain our "Privacy by Physics" promise.
 * Sending PDFs to external APIs (like Gemini) would violate this core principle.
 * 
 * Users should paste text manually to ensure their thesis content never leaves
 * the Vercel serverless environment.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    console.log("[API] /api/parse-pdf - Feature disabled for privacy");

    return NextResponse.json({
        error: "PDF upload is disabled to protect your privacy. Please copy and paste your text manually.",
        reason: "privacy_by_physics",
        message: "We don't send your documents to external services. Your thesis content stays in your control.",
        fallback: true
    }, { status: 503 });
}
