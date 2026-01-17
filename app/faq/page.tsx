/**
 * Author: Sambath Kumar Natarajan
 * 
 * FAQ Page
 * Detailed answers about usage, acceptance guarantees, and pricing.
 */
import Link from "next/link"
import { HelpCircle, ChevronRight } from "lucide-react"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"

export default function FAQPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-serif">
            <Header />

            <main className="flex-1 py-16 md:py-24">
                <div className="container px-4 md:px-6 max-w-3xl mx-auto">
                    <div className="space-y-6 mb-12 border-b border-zinc-100 pb-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-zinc-100 p-3 rounded-full">
                                <HelpCircle className="h-8 w-8 text-zinc-900" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-xl text-zinc-500">
                            Everything you need to know about the audit process.
                        </p>
                    </div>

                    <div className="space-y-12">
                        <div>
                            <h3 className="text-xl font-bold font-serif mb-3">Will ARGUS-Thesis guarantee my paper gets accepted?</h3>
                            <p className="text-zinc-700 leading-relaxed text-lg">
                                No. ARGUS-Thesis validates your methodology and logical consistency.
                                It does <span className="font-bold">NOT</span> guarantee acceptance—journals care about novelty, impact, and empirical results too.
                            </p>
                            <p className="text-zinc-700 leading-relaxed mt-4 text-lg">
                                However, ARGUS-Thesis DOES help you:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-2 text-zinc-700 text-lg">
                                <li>Identify fatal logical flaws before peer review</li>
                                <li>Strengthen weak premises that reviewers would attack</li>
                                <li>Clarify claims so reviewers can't misinterpret</li>
                            </ul>
                            <div className="mt-6 bg-zinc-50 p-4 border-l-4 border-zinc-900 rounded-r">
                                <p className="text-zinc-800 italic">
                                    "ARGUS can't make your paper innovative. But it CAN prevent rejection due to careless mistakes or logical inconsistency."
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-zinc-100 pt-8">
                            <h3 className="text-xl font-bold font-serif mb-3">What if ARGUS doesn't find any problems?</h3>
                            <p className="text-zinc-700 leading-relaxed text-lg">
                                That's good news. It means:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-2 text-zinc-700 text-lg">
                                <li>Your logical consistency is strong</li>
                                <li>Your claims are well-bounded and defensible</li>
                                <li>You're ready for peer review</li>
                            </ul>
                            <p className="text-zinc-700 leading-relaxed mt-4 text-lg">
                                ARGUS isn't a rubber stamp. If it passes your work, you can defend every claim.
                            </p>
                        </div>

                        <div className="border-t border-zinc-100 pt-8">
                            <h3 className="text-xl font-bold font-serif mb-3">What if ARGUS REJECTS all my claims?</h3>
                            <p className="text-zinc-700 leading-relaxed text-lg">
                                This happens occasionally with overstated claims. It's actually valuable—better to know before journal submission.
                            </p>
                            <div className="mt-4 bg-red-50 p-6 rounded-lg border border-red-100">
                                <p className="font-bold text-red-900 mb-2">Typical Turnaround Path:</p>
                                <ol className="list-decimal pl-5 space-y-2 text-red-800">
                                    <li>Run ARGUS, get REJECTED verdicts</li>
                                    <li>Revise claims (narrow scope, add evidence)</li>
                                    <li>Re-run ARGUS, get ACCEPTED or REVISE</li>
                                    <li>Iterate until confidence is high</li>
                                </ol>
                            </div>
                        </div>

                        <div className="border-t border-zinc-100 pt-8">
                            <h3 className="text-xl font-bold font-serif mb-3">How many times should I run ARGUS on my paper?</h3>
                            <p className="text-zinc-700 leading-relaxed text-lg">
                                We recommend a 3-stage process:
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-700 text-lg">
                                <li><strong>First draft:</strong> 1-2 audits (find major issues)</li>
                                <li><strong>After revisions:</strong> 1 audit (validate improvements)</li>
                                <li><strong>Pre-submission:</strong> 1 final audit (confidence check)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16 flex justify-center">
                        <Link href="/playground">
                            <Button size="lg" className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full h-14 px-8 text-lg">
                                Try Logic Scan <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div >
            </main >

            <Footer />
        </div >
    )
}
