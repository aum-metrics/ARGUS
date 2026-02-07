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

export async function parsePDF(file: File): Promise<{ text: string, images: string[] }> {
    try {
        await loadPdfJsScript();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        const images: string[] = [];
        const totalPages = pdf.numPages;

        // Limit image extraction to first 10 pages to prevent memory issues
        const maxImagePages = Math.min(totalPages, 10);

        // Extract text and render pages to images
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);

            // 1. Text Extraction
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n\n';

            // 2. Image Rendering (for multimodal analysis)
            if (i <= maxImagePages) {
                try {
                    const viewport = page.getViewport({ scale: 1.5 }); // 1.5x scale for legible formulas
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    if (context) {
                        await page.render({
                            canvasContext: context,
                            viewport: viewport
                        }).promise;

                        // Convert to lightweight JPEG
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        images.push(dataUrl);
                    }
                } catch (imgErr) {
                    console.warn(`Failed to render page ${i} as image:`, imgErr);
                }
            }
        }

        const resultText = fullText.trim();

        if (resultText.length < 50 && images.length === 0) {
            throw new Error('Extracted content too minimal. PDF might be encrypted or empty.');
        }

        return { text: resultText, images };
    } catch (error: any) {
        console.error("PDF Parsing Error:", error);
        throw new Error(`PDF Parsing Failed: ${error.message}`);
    }
}
