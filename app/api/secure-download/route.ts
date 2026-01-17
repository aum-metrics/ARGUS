import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    console.log("[SECURE_DL] Request received");
    try {
        const formData = await req.formData();
        console.log("[SECURE_DL] FormData parsed");
        const filename = formData.get('filename') as string || 'download.pdf';
        const fileData = formData.get('fileData') as string;
        console.log(`[PROXY] Processing ${filename}, Data Length: ${fileData?.length}`);

        if (!fileData) {
            return new NextResponse('Missing file data', { status: 400 });
        }

        // Decode Base64
        // data:application/pdf;base64,... -> strip prefix
        const base64Content = fileData.split(',')[1] || fileData;
        const buffer = Buffer.from(base64Content, 'base64');

        // Sanitize and simplify filename
        // 1. Remove Extension from logic first
        const parts = filename.split('.');
        const ext = parts.length > 1 ? parts.pop() : 'pdf'; // Default to pdf if missing
        const base = parts.join('.');

        // 2. Sanitize Base
        const safeBase = base.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50); // Limit base to 50 chars

        // 3. Reconstruct
        const safeFilename = `${safeBase}.${ext}`;

        console.log(`[PROXY] Sending safe filename: ${safeFilename}`);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf', // Revert to PDF to help browser identify
                'Content-Disposition': `attachment; filename="${safeFilename}"`,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Download Proxy Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
