/**
 * Author: Sambath Kumar Natarajan
 * 
 * PDF Parsing API - Disabled for Production
 * PDF parsing libraries don't work reliably in Vercel serverless
 * Users should paste text manually instead
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    console.log("[API] /api/parse-pdf - PDF upload disabled in production");

    // Return user-friendly message directing to manual input
    return NextResponse.json({
        error: "PDF upload is temporarily disabled. Please copy your text and paste it in the text area below.",
        fallback: true,
        disabled: true
    }, { status: 503 });
}
