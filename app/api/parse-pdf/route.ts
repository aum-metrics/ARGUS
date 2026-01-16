
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // CRITICAL FIX: Prevent static generation attempt which fails with pdf-parse


export async function POST(req: NextRequest) {
    console.log("[API] /api/parse-pdf - Request received");

    // Lazy import to verify it loads
    let parsePdfFunc: any = null;
    let PDFParseClass: any = null;

    try {
        // Stick to root package which worked previously
        const pdfModule = require('pdf-parse');
        console.log("[API] Loaded pdf-parse root");

        // Handle various ways the function might be exported (CommonJS vs ESM Interop)
        // 1. Check for legacy function style
        if (typeof pdfModule === 'function') {
            parsePdfFunc = pdfModule;
            console.log("[API] Detected legacy pdf-parse function");
        } else if (pdfModule && typeof pdfModule.default === 'function') {
            parsePdfFunc = pdfModule.default;
            console.log("[API] Detected legacy pdf-parse function via .default");
        }
        // 2. Check for modern class style (v2.x)
        else {
            PDFParseClass = pdfModule.PDFParse || (pdfModule.default && pdfModule.default.PDFParse);
            if (PDFParseClass) {
                console.log("[API] Detected modern PDFParse class");
            } else {
                console.error("[API] pdf-parse loaded but no recognized export found. Keys:", Object.keys(pdfModule || {}));
                return NextResponse.json({
                    error: "Server Error: pdf-parse library failed to load correctly.",
                    details: `Module type: ${typeof pdfModule}, Keys: ${Object.keys(pdfModule || {})} - Restart server if this persists.`
                }, { status: 500 });
            }
        }
    } catch (e: any) {
        console.error("[API] Failed to require pdf-parse:", e);
        return NextResponse.json({ error: `Server Configuration Error: ${e.message}` }, { status: 500 });
    }

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

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log(`[API] Buffer created. Length: ${buffer.length}`);

        // Parse PDF
        let data: any;
        let images: string[] = [];

        if (PDFParseClass) {
            const parser = new PDFParseClass({ data: buffer });
            data = await parser.getText();

            // Extract visual essence
            try {
                console.log("[API] Attempting deep visual extraction (High-Res + Structural Path)...");

                // 1. High-Resolution Full Page Screenshots (Context)
                const screenshotResult = await parser.getScreenshot({
                    imageDataUrl: true,
                    last: 10, // Scan deeper (first 10 pages)
                    scale: 2.5 // High fidelity for readable charts
                });
                if (screenshotResult?.pages) {
                    const pageImages = screenshotResult.pages.map((p: any) => p.dataUrl).filter(Boolean);
                    images.push(...pageImages);
                }

                // 2. Individual Images/Figures Pass
                const imageResult = await parser.getImage({
                    imageDataUrl: true,
                    last: 10
                });
                if (imageResult?.pages) {
                    imageResult.pages.forEach((p: any) => {
                        if (p.images) {
                            const detectedImages = p.images.map((img: any) => img.dataUrl).filter(Boolean);
                            images.push(...detectedImages);
                        }
                    });
                }

                // 3. Structural Table Extraction Pass
                try {
                    const tableResult = await parser.getTable({
                        imageDataUrl: true,
                        last: 10
                    });
                    if (tableResult?.pages) {
                        tableResult.pages.forEach((p: any) => {
                            if (p.tables) {
                                const tableImages = p.tables.map((t: any) => t.dataUrl).filter(Boolean);
                                images.push(...tableImages);
                            }
                        });
                    }
                } catch (tErr) {
                    console.log("[API] Table pass skipped or not supported for this doc");
                }

                // Dedup and limit strictly to top 10 elements to prevent payload crash
                images = Array.from(new Set(images)).slice(0, 10);
                console.log(`[API] Deep scan complete. Total visual elements selected: ${images.length}`);

            } catch (vErr: any) {
                console.warn("[API] Visual extraction failed:", vErr.message);
            }
        } else {
            data = await parsePdfFunc(buffer);
        }

        const text = data.text;

        console.log(`[API] PDF Parsed. Text Length: ${text?.length || 0}, Images: ${images.length}`);

        if (!text || text.length < 50) {
            console.warn("[API] Warning: Extracted text is very short.");
        }

        // Basic Cleanup
        const cleanText = text.replace(/\n\s*\n/g, '\n\n').trim();

        return NextResponse.json({
            text: cleanText,
            images: images
        });

    } catch (error: any) {
        console.error("[API] Critical PDF Parse Error:", error);
        return NextResponse.json({ error: `Failed to parse PDF: ${error.message}` }, { status: 500 });
    }
}
