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
    doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2)); // Border

    // BRANDING HEADER
    // Logo (Top Left - Letterhead Style)
    if (logoData) {
        doc.addImage(logoData, 'JPEG', margin + 5, margin + 5, 25, 25);
    }

    // Titles (Centered) - Independent of Logo Y for layout, but Y variable must update for body
    // Start Titles slightly lower than margin
    let titleY = margin + 15;

    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text("ARGUS-THESIS", pageWidth / 2, titleY, { align: "center" });
    titleY += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.text("METHODOLOGICAL VALIDATOR", pageWidth / 2, titleY, { align: "center" });
    titleY += 6;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("INSTITUTIONAL GOVERNANCE LAYER", pageWidth / 2, titleY, { align: "center" });

    // Reset Y for the body content (Metadata)
    // 35px height for header area
    y = margin + 45;

    // Report Metadata
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`AUDIT ID: ${session.id}`, margin + 10, y);
    y += 8;
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, margin + 10, y);
    y += 15;

    // Context Box
    doc.setFillColor(245, 245, 245);
    doc.rect(margin + 5, y, contentWidth - 10, 35, "F");
    y += 10;
    doc.setFont("courier", "bold");
    doc.setFontSize(11);
    doc.text(`CANDIDATE: ${metadata.candidateName || "ANONYMOUS"}`, margin + 15, y);
    y += 8;
    doc.text(`PROGRAM:   ${metadata.degree || "UNSPECIFIED"}`, margin + 15, y);
    y += 8;
    doc.text(`TARGET:    ${metadata.targetJournal || "GENERAL ACADEMIC"}`, margin + 15, y);
    y += 25;

    // Verdict
    const score = report?.readinessScore || 0;
    const verdict = report?.verdict || "PENDING";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PUBLICATION READINESS ASSESSMENT", pageWidth / 2, y, { align: "center" });
    y += 15;

    // Score Circle
    doc.setDrawColor(score > 80 ? 0 : 200, score > 80 ? 150 : 0, 0);
    doc.setLineWidth(3);
    doc.circle(pageWidth / 2, y + 15, 15);
    doc.text(`${score}`, pageWidth / 2, y + 17, { align: "center" });
    doc.setFontSize(10);
    doc.text("/ 100", pageWidth / 2, y + 25, { align: "center" });
    y += 50;

    // Verdict Badge
    doc.setFillColor(verdict === "PUBLISHABLE" ? 220 : 255, verdict === "PUBLISHABLE" ? 255 : 230, 230);
    doc.rect((pageWidth / 2) - 40, y, 80, 12, "F");
    doc.setTextColor(verdict === "PUBLISHABLE" ? 0 : 200, verdict === "PUBLISHABLE" ? 100 : 0, 0);
    doc.setFontSize(12);
    doc.text(verdict, pageWidth / 2, y + 8, { align: "center" });
    y += 20;

    // Exec Summary
    doc.setTextColor(0);
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    const summary = report?.executiveSummary || "No executive summary generated.";
    doc.text("EXECUTIVE SUMMARY:", margin + 10, y);
    y += 7;
    doc.setFont("times", "italic");
    y += wrapText(doc, summary, margin + 10, y, contentWidth - 20, 5);

    // --- PAGE 2+: DETAILED CLAIM ANALYSIS ---
    session.data.claims.forEach((claim, idx) => {
        if (y > pageHeight - 40) {
            doc.addPage();
            y = margin;
        }

        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`CLAIM ${idx + 1}`, margin, y);
        y += 8;

        doc.setFont("times", "normal");
        doc.setFontSize(10);
        y += wrapText(doc, claim.statement, margin + 5, y, contentWidth - 10, 5);
        y += 5;

        // Verdict for this claim
        const claimVerdict = claim.status || "PENDING";
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(claimVerdict === "ACCEPTED" ? 0 : 200, claimVerdict === "ACCEPTED" ? 100 : 0, 0);
        doc.text(`VERDICT: ${claimVerdict}`, margin + 5, y);
        y += 8;
        doc.setTextColor(0);

        // Governance Logs
        if (claim.governanceLog && claim.governanceLog.length > 0) {
            claim.governanceLog.forEach((log: any) => {
                if (y > pageHeight - 30) {
                    doc.addPage();
                    y = margin;
                }
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.setTextColor(80);
                doc.text(log.role, margin + 5, y);
                y += 5;
                doc.setFont("helvetica", "normal");
                doc.setTextColor(0);
                const cleanContent = log.content.replace(/\*\*/g, "");
                y += wrapText(doc, cleanContent, margin + 5, y, contentWidth - 10, 4);
                y += 8;
            });
        }
        y += 10;
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
    });

    // --- SEND TO PROXY ---
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Argus_Governance_Report_${session.id}_${timestamp}.pdf`;
    const dataUri = doc.output('datauristring');

    // Create form with Multipart
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/secure-download';
    form.enctype = 'multipart/form-data';
    form.target = '_blank'; // Force new context to avoid frame issues
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
    console.log("[DOWNLOADER] Submitting form to /api/secure-download with file: " + filename);
    try {
        form.submit();
    } catch (e) {
        alert("Download Proxy Failed: " + e);
        console.error(e);
    }
    document.body.removeChild(form);
};
