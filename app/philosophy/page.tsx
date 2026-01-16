/**
 * Author: Sambath Kumar Natarajan
 */
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Quote } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: 'Why Was My Paper Rejected? | ARGUS Philosophy',
    description: 'Stop guessing why your paper was rejected. ARGUS uses adversarial AI to simulate peer review before submission. Research validation for the modern era.',
    keywords: ['paper rejected peer review', 'why was my paper rejected', 'adversarial peer review', 'research validation', 'AI peer review']
};

export default function PhilosophyPage() {
    return (
        <div className="min-h-screen bg-white text-zinc-900 font-serif selection:bg-zinc-100 selection:text-zinc-900">
            {/* Header */}
            <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-200 bg-white sticky top-0 z-50">
                <Link href="/">
                    <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                        <img src="/logo.jpg" alt="ARGUS" className="h-10 w-auto" />
                    </div>
                </Link>
                <Link href="/login">
                    <Button variant="ghost" size="sm" className="font-sans">Login</Button>
                </Link>
            </header>

            <main className="container mx-auto px-4 py-16 max-w-3xl">

                {/* Hero Section: The Problem */}
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    Why Was My Paper Rejected?
                </h1>
                <p className="text-xl md:text-2xl text-zinc-600 mb-12 font-light italic leading-relaxed">
                    The crisis of modern peer review isn't just about harsh reviewers. It's about the invisible gap between your logic and their perception.
                </p>

                <div className="space-y-8 text-lg leading-relaxed text-zinc-800">
                    <p>
                        Every year, millions of hours of brilliant research vanish into the void of "Major Revisions" or outright rejection.
                        The feedback is often contradictory, vague, or devastatingly late. You ask yourself:
                        <em> "Why didn't I see that flaw?"</em> or <em>"Why did they misunderstand my core contribution?"</em>
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-zinc-900" />
                        Enter Adversarial Peer Review
                    </h2>
                    <p>
                        We built <strong>ARGUS</strong> on a single, radical philosophy:
                        <span className="bg-yellow-50 px-1 font-semibold">You should not be the first person to critique your own work.</span>
                    </p>
                    <p>
                        Subjective self-review is biologically impossible. You know what you <em>meant</em> to write. A reviewer only knows what you <em>actually</em> wrote.
                        This asymmetry is the primary cause of rejection.
                    </p>
                    <p>
                        ARGUS is not a "grammar checker." It is an <strong>Adversarial Engine</strong>. We use advanced AI agents configured with the persona of "Reviewer #2"—the one who hates your methodology, doubts your data, and questions your novelty.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">Research Validation Before Submission</h2>
                    <p>
                        Traditional peer review is verifiable but slow. ARGUS is <strong>immediate</strong>.
                        By simulating the review process <em>before</em> you submit, you gain three superpowers:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-zinc-400">
                        <li><strong>Pre-emption:</strong> Fix "Fatal Flaws" before a human ever sees them.</li>
                        <li><strong>Hardening:</strong> Strengthen your claims against the exact counter-arguments a skeptic would raise.</li>
                        <li><strong>Clarity:</strong> Identify where your text fails to convey your intent.</li>
                    </ul>

                    <div className="my-12 p-8 bg-zinc-50 border-l-4 border-zinc-900 italic text-zinc-600">
                        <Quote className="h-8 w-8 text-zinc-300 mb-2" />
                        "Validation is not about being right. It is about failing early, failing cheaply, and failing privately—so you can succeed publicly."
                    </div>

                    <h2 className="text-2xl font-bold mt-12 mb-4">The Ephemeral Promise</h2>
                    <p>
                        We believe research validation tools should not become surveillance tools.
                        Most AI platforms train on your data. <strong>We do not.</strong>
                    </p>
                    <p>
                        ARGUS operates on an "Ephemeral Memory" architecture. Your manuscript is ingested, analyzed, and forgotten.
                        The only record that remains is the audit trail of the metadata—that the work was done, not what the work contains.
                        Your intellectual property remains yours, untouched and untainted.
                    </p>

                    <hr className="my-12 border-zinc-200" />

                    <div className="flex flex-col items-center text-center space-y-6">
                        <h3 className="text-2xl font-bold">Ready to harden your research?</h3>
                        <p className="text-zinc-600 max-w-md">
                            Run an adversarial simulation on your abstract today. It costs less than a rejected submission fee.
                        </p>
                        <Link href="/dashboard">
                            <Button size="lg" className="bg-zinc-900 text-white hover:bg-zinc-800 px-8 text-lg h-14">
                                Initialize Governance Protocol
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-200 py-12 bg-zinc-50 mt-12">
                <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
                    <p className="mb-4">© 2026 ARGUS Protocol. All Academic Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
