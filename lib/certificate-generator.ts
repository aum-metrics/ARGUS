/**
 * Author: Sambath Kumar Natarajan
 */
import { jsPDF } from "jspdf"
import { saveAs } from "file-saver";

interface AuditSession {
    id: string;
    score: number;
    claim: string;
    date: string;
}

export const generateCertificate = (session: AuditSession, userName: string = "Researcher") => {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Border
    doc.setLineWidth(3);
    doc.setDrawColor(24, 24, 27);
    doc.rect(10, 10, width - 20, height - 20);

    doc.setLineWidth(0.5);
    doc.setDrawColor(82, 82, 91);
    doc.rect(15, 15, width - 30, height - 30);

    // Header
    doc.setFont("times", "bold");
    doc.setFontSize(40);
    doc.setTextColor(24, 24, 27);
    doc.text("ARGUS", width / 2, 45, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(82, 82, 91);
    doc.text("ADVERSARIAL RESEARCH GOVERNANCE & VALIDATION SYSTEM", width / 2, 53, { align: "center" });

    // Certificate Title
    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    doc.text("CERTIFICATE OF DEFENSIBILITY", width / 2, 80, { align: "center" });

    // Recipient
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("This certifies that", width / 2, 100, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.text(userName, width / 2, 112, { align: "center" });

    // Achievement
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("has successfully completed an adversarial audit with the following result:", width / 2, 125, { align: "center" });

    // Score Badge
    const scoreX = width / 2;
    const scoreY = 150;

    doc.setFillColor(session.score >= 80 ? 34 : 220, session.score >= 80 ? 197 : 38, session.score >= 80 ? 94 : 38);
    doc.circle(scoreX, scoreY, 20, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.text(`${session.score}`, scoreX, scoreY + 5, { align: "center" });

    doc.setFontSize(12);
    doc.text("/ 100", scoreX, scoreY + 15, { align: "center" });

    // Watermark
    doc.saveGraphicsState();
    const gState = new (doc as any).GState({ opacity: 0.1 });
    doc.setGState(gState);
    doc.setFont("times", "bold");
    doc.setFontSize(120);
    doc.setTextColor(0, 0, 0);
    doc.text("ARGUS", width / 2, height / 2 + 30, { align: "center", angle: 45 });
    doc.restoreGraphicsState();

    // Viral CTA
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text("⚠ ATTACH THIS CERTIFICATE TO YOUR SUBMISSION PACKAGE", width / 2, 195, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Signal quality to editors and reviewers", width / 2, 206, { align: "center" });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text(`Generated: ${new Date().toUTCString()} | Session ID: ${session.id}`, width / 2, height - 10, { align: "center" });

    // Download with proper extension
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `ARGUS_Certificate_${session.id}_${timestamp}.pdf`;

    // NUCLEAR OPTION: Server-Side Proxy
    const dataUri = doc.output('datauristring');

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/download-proxy';
    form.style.display = 'none';

    const nameInput = document.createElement('input');
    nameInput.name = 'filename';
    nameInput.value = filename;
    form.appendChild(nameInput);

    const dataInput = document.createElement('input');
    dataInput.name = 'fileData';
    dataInput.value = dataUri;
    form.appendChild(dataInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};
