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
                                <h2 className="text-2xl font-bold">1. Ephemeral Privacy (First Law)</h2>
                            </div>
                            <p className="text-zinc-700 leading-relaxed pl-14">
                                All session data exists only in Random Access Memory (RAM). No inputs, claims, or generated critiques are ever written to a disk, database, or log file that persists beyond the active session window. Upon session termination (or timeout), a cryptographic deletion certificate is generated, and the memory address space is zeroed.
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
                                <h2 className="text-2xl font-bold">4. The 6-Adversary Protocol</h2>
                            </div>
                            <p className="text-zinc-700 leading-relaxed pl-14 mb-8">
                                When you audit a claim, you aren't just getting a "correction". You are deploying six specialized AI agents that simulate the harshest possible peer review committee. They do not communicate with each other until the final verdict, preventing "groupthink".
                            </p>

                            <div className="pl-14 grid gap-6 md:grid-cols-2">
                                <div className="p-5 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors">
                                    <h3 className="font-bold font-serif text-lg mb-2">1. The Thesis Constructor</h3>
                                    <p className="text-base text-zinc-600 leading-relaxed">Extracts the core logical structure of your argument. It ignores rhetoric to isolate the "atomic claims" you are establishing.</p>
                                </div>
                                <div className="p-5 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors">
                                    <h3 className="font-bold font-serif text-lg mb-2">2. The Thesis Critic</h3>
                                    <p className="text-base text-zinc-600 leading-relaxed">A rigorous stress-testing agent. Its goal is to identify counter-examples, logical fallacies, or weak premises in your argument hierarchy.</p>
                                </div>
                                <div className="p-5 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors">
                                    <h3 className="font-bold font-serif text-lg mb-2">3. Methodology Analyst</h3>
                                    <p className="text-base text-zinc-600 leading-relaxed">Evaluates procedural integrity. It checks for potential sampling biases, statistical inconsistencies, or over-claiming of results.</p>
                                </div>
                                <div className="p-5 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors">
                                    <h3 className="font-bold font-serif text-lg mb-2">4. Literature Reviewer</h3>
                                    <p className="text-base text-zinc-600 leading-relaxed">Scans for conceptual proximity in existing literature. It flags claims that may be derivative or insufficiently differentiated from prior art.</p>
                                </div>
                                <div className="p-5 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors">
                                    <h3 className="font-bold font-serif text-lg mb-2">5. Formalism Auditor</h3>
                                    <p className="text-base text-zinc-600 leading-relaxed">Checks technical precision. Are definitions recursive? Do equations balance? It demands mathematical and linguistic rigor.</p>
                                </div>
                                <div className="p-5 border-l-4 border-zinc-900 bg-zinc-50 rounded-r-lg pl-5">
                                    <h3 className="font-bold font-serif text-lg mb-2">6. The Reviewer Simulator</h3>
                                    <p className="text-base text-zinc-600 leading-relaxed">The Synthesizer. It aggregates the findings from all agents and renders a final verdict: ACCEPT, REVISE, or REJECT.</p>
                                </div>
                            </div>
                        </section>


                        <section className="pt-8 border-t border-zinc-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-zinc-100 p-2 rounded">
                                    <FileSearch className="h-6 w-6 text-zinc-900" />
                                </div>
                                <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                            </div>

                            <div className="pl-14 space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold font-serif mb-2">Will ARGUS-Thesis guarantee my paper gets accepted?</h3>
                                    <p className="text-zinc-700 leading-relaxed">
                                        No. ARGUS-Thesis validates your methodology and logical consistency.
                                        It does NOT guarantee acceptance—journals care about novelty, impact, and empirical results too.
                                    </p>
                                    <p className="text-zinc-700 leading-relaxed mt-2">
                                        However, ARGUS-Thesis DOES help you:
                                    </p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-700">
                                        <li>Identify fatal logical flaws before peer review</li>
                                        <li>Strengthen weak premises that reviewers would attack</li>
                                        <li>Clarify claims so reviewers can't misinterpret</li>
                                    </ul>
                                    <p className="text-zinc-700 leading-relaxed mt-2 font-medium">
                                        In short: ARGUS can't make your paper innovative. But it CAN prevent rejection due to careless mistakes or logical inconsistency.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold font-serif mb-2">What if ARGUS doesn't find any problems?</h3>
                                    <p className="text-zinc-700 leading-relaxed">
                                        That's good news. It means:
                                    </p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-700">
                                        <li>Your logical consistency is strong</li>
                                        <li>Your claims are well-bounded and defensible</li>
                                        <li>You're ready for peer review</li>
                                    </ul>
                                    <p className="text-zinc-700 leading-relaxed mt-2">
                                        ARGUS isn't a rubber stamp. If it passes your work, you can defend every claim.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold font-serif mb-2">What if ARGUS REJECTS all my claims?</h3>
                                    <p className="text-zinc-700 leading-relaxed">
                                        This happens occasionally with overstated claims. It's actually valuable—better to know before journal submission.
                                    </p>
                                    <p className="text-zinc-700 leading-relaxed mt-2">
                                        <strong>Typical path:</strong>
                                    </p>
                                    <ol className="list-decimal pl-5 mt-2 space-y-1 text-zinc-700">
                                        <li>Run ARGUS, get REJECTED verdicts</li>
                                        <li>Revise claims (narrow scope, add evidence)</li>
                                        <li>Re-run ARGUS, get ACCEPTED or REVISE</li>
                                        <li>Iterate until confidence is high</li>
                                    </ol>
                                    <p className="text-zinc-700 leading-relaxed mt-2 italic">
                                        We've seen PhD students avoid major revisions by iterating with ARGUS pre-submission.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold font-serif mb-2">How many times should I run ARGUS on my paper?</h3>
                                    <p className="text-zinc-700 leading-relaxed">
                                        We recommend:
                                    </p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-700">
                                        <li><strong>First draft:</strong> 1-2 audits (find major issues)</li>
                                        <li><strong>After revisions:</strong> 1 audit (validate improvements)</li>
                                        <li><strong>Pre-submission:</strong> 1 final audit (confidence check)</li>
                                    </ul>
                                    <p className="text-zinc-700 leading-relaxed mt-2 text-sm text-zinc-500">
                                        Total: ~3-4 audits per paper (~$80-120 with Standard Mode)
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div >
            </main >

            <Footer />
        </div >
    )
}
