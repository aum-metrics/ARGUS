/**
 * CLEAN SLATE DOWNLOADER
 * Forces fresh module resolution to bypass stale cache/blobs.
 */
import { jsPDF } from "jspdf";
import { ArgusSession } from "./session";

// Helper to wrap text
const wrapText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const splitText = doc.splitTextToSize(text, maxWidth);
    doc.text(splitText, x, y);
    return splitText.length * lineHeight;
};

// Async Logo Fetcher
const getLogoBase64 = (): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = '/logo.jpg';
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg'));
            } else {
                resolve('');
            }
        };
        img.onerror = () => resolve('');
    });
};

// Helper to safely print text across pages
const printTextSafely = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number, pageHeight: number, margin: number): number => {
    const splitText = doc.splitTextToSize(text, maxWidth);

    for (const line of splitText) {
        if (y > pageHeight - margin) {
            doc.addPage();
            y = margin + 10; // Reset Y with small pad
        }
        doc.text(line, x, y);
        y += lineHeight;
    }
    return y;
};

export const robustDownloader = async (session: ArgusSession) => {
    // Start Download Sequence
    console.log("[DOWNLOADER] Initiating PDF Generation");

    const logoData = await getLogoBase64();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    const metadata = session.data.context || {};
    const report = session.data.report;

    // --- PAGE 1: CERTIFICATE OF GOVERNANCE ---
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    // doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2)); // Removed border to reduce clutter

    // BRANDING HEADER
    if (logoData) {
        doc.addImage(logoData, 'JPEG', margin, margin, 25, 25);
    }

    let titleY = margin + 10;
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text("ARGUS-THESIS", pageWidth / 2, titleY, { align: "center" });
    titleY += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.text("METHODOLOGICAL VALIDATOR", pageWidth / 2, titleY, { align: "center" });

    // Metadata Block
    y = margin + 40;
    doc.setFillColor(248, 248, 250);
    doc.setDrawColor(230);
    doc.rect(margin, y, contentWidth, 35, "FD");

    y += 10;
    doc.setFont("courier", "bold");
    doc.setTextColor(50);
    doc.setFontSize(10);
    doc.text(`CANDIDATE: ${metadata.candidateName || "ANONYMOUS"}`, margin + 10, y);
    y += 7;
    doc.text(`PROGRAM:   ${metadata.degree || "UNSPECIFIED"}`, margin + 10, y);
    y += 7;
    doc.text(`TARGET:    ${metadata.targetJournal || "GENERAL ACADEMIC"}`, margin + 10, y);
    y += 7;
    doc.text(`DATE:      ${new Date().toLocaleDateString()}`, margin + 10, y);
    y += 20;

    // Verdict Section
    const score = report?.readinessScore || session.data.score || 0;
    const rawVerdict = (report?.finalVerdict || report?.verdict || "PENDING").toUpperCase();
    const isPositive = ["PUBLISHABLE", "ACCEPT", "ACCEPTED"].includes(rawVerdict);
    const isPending = rawVerdict === "PENDING";

    // Map internal status to badge text
    const displayVerdict = isPending ? "PENDING REVIEW" : rawVerdict;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("PUBLICATION READINESS ASSESSMENT", pageWidth / 2, y, { align: "center" });
    y += 15;

    // Score Circle
    const circleY = y + 15;
    doc.setDrawColor(score >= 80 ? 34 : 220, score >= 80 ? 197 : 50, score >= 80 ? 94 : 70); // Green or Red
    doc.setLineWidth(4);
    doc.circle(pageWidth / 2, circleY, 18);

    doc.setFontSize(18);
    doc.text(`${score}`, pageWidth / 2, circleY + 2, { align: "center" });
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("/ 100", pageWidth / 2, circleY + 12, { align: "center" });
    y += 50;

    // Verdict Badge
    doc.setFillColor(
        isPositive ? 220 : (isPending ? 240 : 255),
        isPositive ? 255 : (isPending ? 240 : 235),
        isPositive ? 220 : (isPending ? 240 : 235)
    ); // Greenish, Grayish, or Reddish

    // Centered Badge
    doc.roundedRect((pageWidth / 2) - 40, y, 80, 12, 3, 3, "F");

    doc.setTextColor(
        isPositive ? 0 : (isPending ? 100 : 180),
        isPositive ? 100 : (isPending ? 100 : 0),
        0
    );
    doc.setFontSize(11);
    doc.text(displayVerdict, pageWidth / 2, y + 8, { align: "center" });
    y += 25;

    // Executive Summary
    doc.setTextColor(0);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text("EXECUTIVE SUMMARY:", margin, y);
    y += 8;

    doc.setFont("times", "italic");
    doc.setFontSize(10.5);
    const summary = report?.executiveSummary || "No executive summary generated yet.";

    // Use safe printing for summary
    y = printTextSafely(doc, summary, margin, y, contentWidth, 5, pageHeight, margin);
    y += 10;

    // Truth Statement
    if (report?.truthStatement) {
        doc.setFont("courier", "bold");
        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text("THE UNVARNISHED TRUTH:", margin, y);
        y += 6;
        doc.setFont("courier", "normal");
        doc.setTextColor(0);
        y = printTextSafely(doc, `"${report.truthStatement}"`, margin + 5, y, contentWidth - 10, 5, pageHeight, margin);
    }

    // --- DETAILED CLAIMS (New Page) ---
    doc.addPage();
    y = margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("DETAILED FORENSIC AUDIT", margin, y);
    y += 15;

    session.data.claims.forEach((claim, idx) => {
        // Header for Claim
        if (y > pageHeight - 40) {
            doc.addPage();
            y = margin;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(50);
        doc.text(`CLAIM ${idx + 1}`, margin, y);
        y += 7;

        // Statement
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        doc.setTextColor(0);
        y = printTextSafely(doc, claim.statement, margin, y, contentWidth, 5, pageHeight, margin);
        y += 5;

        // Verdict Helper
        const claimVerdict = claim.status || "PENDING";
        const accepted = claimVerdict === 'ACCEPTED';

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(accepted ? 0 : 200, accepted ? 128 : 0, 0);
        doc.text(`VERDICT: ${claimVerdict}`, margin, y);
        y += 8;

        // Logs
        if (claim.governanceLog && claim.governanceLog.length > 0) {
            // Pick mainly the Thesis Destroyer or key adversaries to save space/clutter?
            // User requested robust output. Let's print all but nicely formatted.

            const relevantLogs = claim.governanceLog.filter((l: any) => l.role !== 'JOURNAL_REVIEWER_SIMULATOR'); // Reviewer is redundant with status usually?

            relevantLogs.forEach((log: any) => {
                if (y > pageHeight - 30) {
                    doc.addPage();
                    y = margin;
                }

                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(log.role, margin + 5, y);
                y += 4;

                doc.setFont("helvetica", "normal");
                doc.setTextColor(60);
                const cleanContent = log.content.replace(/\*\*/g, "").replace(/\n/g, " ");
                y = printTextSafely(doc, cleanContent, margin + 5, y, contentWidth - 5, 4, pageHeight, margin);
                y += 6;
            });
        }

        y += 5;
        doc.setDrawColor(230);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
    });

    // --- SEND TO PROXY ---
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Argus_Audit_${session.id.substring(0, 8)}.pdf`; // Shorter name
    const dataUri = doc.output('datauristring');

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/secure-download';
    form.enctype = 'multipart/form-data';
    form.target = '_blank';
    form.style.display = 'none';

    const nameInput = document.createElement('input');
    nameInput.name = 'filename';
    nameInput.value = filename;
    form.appendChild(nameInput);

    const dataInput = document.createElement('textarea');
    dataInput.name = 'fileData';
    dataInput.value = dataUri;
    form.appendChild(dataInput);

    document.body.appendChild(form);
    try {
        form.submit();
    } catch (e) {
        alert("Download Failed: " + e);
    }
    document.body.removeChild(form);
};
