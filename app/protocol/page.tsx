/**
 * Author: Sambath Kumar Natarajan
 * 
 * Protocol Page
 * Explains the ARGUS validation hybrid protocol, including ephemeral privacy, compiler rigor, and the 6-adversary model.
 */
import Link from "next/link"
import { ShieldCheck, Check, Fingerprint, Book, Gavel, FileSearch } from "lucide-react"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"

export default function HowItWorksPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-serif">
            <Header />

            <main className="flex-1 py-16 md:py-24">
                <div className="container px-4 md:px-6 max-w-4xl mx-auto">
                    <div className="space-y-6 mb-12 border-b border-zinc-100 pb-8">
                        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
                            The Hybrid Protocol
                        </h1>
                        <p className="text-xl text-zinc-600 italic">
                            "A compiler for truth. Deterministic extraction, adversarial checking, and human confirmation."
                        </p>
                    </div>

                    <div className="space-y-12">
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-zinc-100 p-2 rounded">
                                    <Fingerprint className="h-6 w-6 text-zinc-900" />
                                </div>
                                <h2 className="text-2xl font-bold">1. Session-Scoped Processing</h2>
                            </div>
                            <p className="text-zinc-700 leading-relaxed pl-14">
                                Your manuscript is processed in real-time by our secure AI partners (Google Vertex AI). We never store your text in our own database. Once the audit session concludes, your data is discarded from our execution context.
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-zinc-100 p-2 rounded">
                                    <Gavel className="h-6 w-6 text-zinc-900" />
                                </div>
                                <h2 className="text-2xl font-bold">2. Compiler-Like Rigor</h2>
                            </div>
                            <p className="text-zinc-700 leading-relaxed pl-14">
                                ARGUS-Thesis behaves like a compiler, not a chatbot. It parses your input document into atomic claims (AST), then allows you to run specific "unit tests" (adversarial agents) against each claim. You see the token cost before you commit to an audit.
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-zinc-100 p-2 rounded">
                                    <FileSearch className="h-6 w-6 text-zinc-900" />
                                </div>
                                <h2 className="text-2xl font-bold">3. Novelty Classification</h2>
                            </div>
                            <div className="pl-14 space-y-4">
                                <p className="text-zinc-700 leading-relaxed">
                                    We categorize all "valid" claims into one of four novelty tiers. Merely being "true" is not enough for publication.
                                </p>
                                <ul className="grid gap-2 text-sm font-sans border border-zinc-100 p-4 bg-zinc-50 rounded">
                                    <li className="flex gap-2"><span className="font-bold text-zinc-900">Type I:</span> Substantive Contribution (Pass)</li>
                                    <li className="flex gap-2"><span className="font-bold text-zinc-500">Type II:</span> Incremental Replication (Warn)</li>
                                    <li className="flex gap-2"><span className="font-bold text-zinc-500">Type III:</span> Contextual Variation (Warn)</li>
                                    <li className="flex gap-2"><span className="font-bold text-red-600">Type IV:</span> Trivial Extension (Fail)</li>
                                </ul>
                            </div>
                        </section>

                        <section className="pt-8 border-t border-zinc-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-zinc-100 p-2 rounded">
                                    <ShieldCheck className="h-6 w-6 text-zinc-900" />
                                </div>
                                <h2 className="text-2xl font-bold">4. The Consensus Engine</h2>
                            </div>
                            <p className="text-zinc-700 leading-relaxed pl-14 mb-8">
                                We employ a proprietary multi-agent architecture to stress-test your claims. Rather than a single "AI Critic," your work is evaluated by a diverse ensemble of specialized logic engines, each with a conflicting mandate.
                            </p>

                            <div className="pl-14 grid gap-6 md:grid-cols-2">
                                <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-200">
                                    <h3 className="font-bold font-serif text-lg mb-2 text-zinc-900">Adversarial Diversity</h3>
                                    <p className="text-zinc-600 leading-relaxed">
                                        Our agents do not collaborate; they compete to find flaws. This prevents "groupthink" and hallucination loops common in single-model systems.
                                    </p>
                                </div>
                                <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-200">
                                    <h3 className="font-bold font-serif text-lg mb-2 text-zinc-900">Cryptographic Signing</h3>
                                    <p className="text-zinc-600 leading-relaxed">
                                        The final consensus score is cryptographically signed and stamped into the PDF artifact. This ensures the integrity of the audit cannot be tampered with.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <div className="mt-12 bg-zinc-900 text-white p-8 rounded-2xl text-center">
                            <h3 className="text-2xl font-bold mb-4">Have questions about the process?</h3>
                            <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                                Read about acceptance guarantees, revision cycles, and more in our FAQ.
                            </p>
                            <Link href="/faq">
                                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-zinc-900 h-12 px-8 rounded-full">
                                    Read FAQ
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div >
            </main >

            <Footer />
        </div >
    )
}
