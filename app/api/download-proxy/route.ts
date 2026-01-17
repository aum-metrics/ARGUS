import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const filename = formData.get('filename') as string || 'download.pdf';
        const fileData = formData.get('fileData') as string;

        if (!fileData) {
            return new NextResponse('Missing file data', { status: 400 });
        }

        // Decode Base64
        // data:application/pdf;base64,... -> strip prefix
        const base64Content = fileData.split(',')[1] || fileData;
        const buffer = Buffer.from(base64Content, 'base64');

        // Return as Download Attachment
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': buffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Download Proxy Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
