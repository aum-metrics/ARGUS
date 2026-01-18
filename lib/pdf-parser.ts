/**
 * Client-side PDF text extraction using PDF.js
 * Fast, privacy-preserving (no server upload needed)
 */

'use client';

export async function extractTextFromPDF(file: File): Promise<string> {
    try {
        // Dynamic import to avoid SSR issues
        const pdfjsLib = await import('pdfjs-dist');

        // Configure worker using CDN
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n\n';
        }

        const result = fullText.trim();

        if (result.length < 100) {
            throw new Error('Extracted text too short. PDF might be scanned or encrypted.');
        }

        return result;
    } catch (error: any) {
        throw new Error(`Failed to extract PDF text: ${error.message}`);
    }
}
