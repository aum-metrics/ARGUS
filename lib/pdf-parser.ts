/**
 * Client-side PDF text extraction - ROBUST CDN VERSION
 * Bypasses Next.js build system issues by loading PDF.js from CDN
 */

'use client';

// Define types for window with PDF.js
declare global {
    interface Window {
        pdfjsLib: any;
    }
}

let isScriptLoaded = false;

function loadPdfJsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (isScriptLoaded || window.pdfjsLib) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            isScriptLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load PDF.js library'));
        document.head.appendChild(script);
    });
}

export async function extractTextFromPDF(file: File): Promise<string> {
    try {
        await loadPdfJsScript();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        const totalPages = pdf.numPages;

        // Extract text from each page
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');

            // Add page number marker/separator if needed, or just newlines
            fullText += pageText + '\n\n';
        }

        const result = fullText.trim();

        if (result.length < 50) {
            throw new Error('Extracted text too short. PDF might be scanned image or encrypted.');
        }

        return result;
    } catch (error: any) {
        console.error("PDF Parsing Error:", error);
        throw new Error(`PDF Parsing Failed: ${error.message}`);
    }
}
