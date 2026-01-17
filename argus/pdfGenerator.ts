/**
 * Author: Sambath Kumar Natarajan
 */
import { jsPDF } from "jspdf"
import { saveAs } from "file-saver";
import { ArgusSession } from "@/argus/session";

// Helper to wrap text
const wrapText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const splitText = doc.splitTextToSize(text, maxWidth);
    doc.text(splitText, x, y);
    return splitText.length * lineHeight;
};

export const generateManuscriptPDF = (session: ArgusSession) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    const metadata = session.data.context || {};
    const report = session.data.report;

    // --- PAGE 1: CERTIFICATE OF GOVERNANCE ---

    // 1. Branding / Letterhead
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2)); // Border

    // Logo Placeholder or Text
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text("ARGUS PROTOCOL", pageWidth / 2, y + 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.text("INSTITUTIONAL GOVERNANCE LAYER", pageWidth / 2, y + 28, { align: "center" });

    y += 50;

    // 2. Report Metadata
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

    // 3. The Verdict (Gauge Visualization)
    const score = report?.readinessScore || 0;
    const verdict = report?.verdict || "PENDING";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PUBLICATION READINESS ASSESSMENT", pageWidth / 2, y, { align: "center" });
    y += 15;

    // Draw Score Circle
    doc.setDrawColor(score > 80 ? 0 : 200, score > 80 ? 150 : 0, 0); // Green or Red
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

    // 4. Executive Summary
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

        // Governance Logs for this claim
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
                // Clean log content slightly
                const cleanContent = log.content.replace(/\*\*/g, "");
                y += wrapText(doc, cleanContent, margin + 5, y, contentWidth - 10, 4);
                y += 8;
            });
        }
        y += 10;
        doc.line(margin, y, pageWidth - margin, y); // Separator
        y += 10;
    });

    // --- DOWNLOAD with proper extension ---
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Argus_Governance_Report_${session.id}_${timestamp}.pdf`;

    // Manual Download with Timeout (Robust Fix)
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    // Delay cleanup to ensure browser captures the download
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 500);
};
