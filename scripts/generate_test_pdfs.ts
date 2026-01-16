
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "test_data");

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
}

// SAMPLE 1: The "Good" Paper (Valid Logic)
const doc1 = new jsPDF();
doc1.text("Title: The Efficacy of Adversarial Training in LLMs", 10, 10);
doc1.text("Abstract:", 10, 20);
doc1.text("We demonstrate that adversarial training reduces overfitting by 20% in large language models.", 10, 30);
doc1.text("This effect is statistically significant (p < 0.05) across 5 distinct datasets.", 10, 40);
doc1.text("We hypothesize that this is due to the regularization effect of the adversarial examples.", 10, 50);
doc1.save(path.join(OUT_DIR, "sample_paper_robust.pdf"));

// SAMPLE 2: The "Bad" Paper (Flawed Logic)
const doc2 = new jsPDF();
doc2.text("Title: Why AI Will Replace Doctors Tomorrow", 10, 10);
doc2.text("Abstract:", 10, 20);
doc2.text("AI models have shown 99% accuracy on training data, proving they are infallible.", 10, 30);
doc2.text("We assume that training data perfectly represents the real world.", 10, 40);
doc2.text("Therefore, no human oversight is required.", 10, 50);
doc2.save(path.join(OUT_DIR, "sample_paper_flawed.pdf"));

console.log("✅ Generated 2 Sample PDFs in /test_data");
