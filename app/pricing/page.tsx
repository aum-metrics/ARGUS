import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Check } from "lucide-react"
import { Footer } from "@/components/Footer"

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-serif">
            <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-200">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <img src="/logo.jpg" alt="ARGUS" className="h-10 w-auto" />
                        </div>
                    </Link>
                </div>
                <nav className="flex gap-4 font-sans text-sm font-medium text-zinc-600">
                    <Link href="/" className="hover:text-black">Home</Link>
                    <Link href="/login" className="bg-zinc-900 text-white px-4 py-2 rounded hover:bg-zinc-700 transition-colors">Login</Link>
                </nav>
            </header>

            <main className="flex-1 py-24 bg-zinc-50">
                <div className="container px-4 md:px-6">
                    <div className="text-center space-y-4 mb-12">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-zinc-900">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-lg text-zinc-600 font-sans max-w-2xl mx-auto">
                            No subscriptions. No hidden fees. Pay only for the audits you run.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                        {/* FULL GOVERNANCE TIER */}
                        <div className="border border-zinc-200 rounded-lg p-8 bg-white shadow-sm hover:shadow-md transition-shadow relative">
                            <div className="absolute top-0 right-0 bg-zinc-100 text-zinc-600 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg border-l border-b border-zinc-200">
                                MANAGED COMPUTE
                            </div>
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-500 mb-2">Full Adversarial Audit</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-extrabold text-zinc-900">₹2,499</span>
                                    <span className="text-zinc-500">/session</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2 font-mono">Includes compute-heavy multi-pass governance ($24.99 USD)</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3 text-zinc-700 text-sm">
                                    <Check className="h-5 w-5 text-green-600 shrink-0" />
                                    <span><strong>One Complete Adversarial Audit</strong> (Up to 15 Claims)</span>
                                </li>
                                <li className="flex items-start gap-3 text-zinc-700 text-sm">
                                    <Check className="h-5 w-5 text-green-600 shrink-0" />
                                    <span>Typically completes within 10-15 minutes</span>
                                </li>
                                <li className="flex items-start gap-3 text-zinc-700 text-sm">
                                    <Check className="h-5 w-5 text-green-600 shrink-0" />
                                    <span>Full 6-Agent Protocol (We pay provider)</span>
                                </li>
                                <li className="flex items-start gap-3 text-zinc-700 text-sm">
                                    <Check className="h-5 w-5 text-green-600 shrink-0" />
                                    <span>PDF Audit Report</span>
                                </li>
                            </ul>

                            <Link href="/dashboard">
                                <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 h-12 shadow-md">
                                    Start Full Audit
                                </Button>
                            </Link>
                        </div>

                        {/* BYOK TIER */}
                        <div className="border border-zinc-200 rounded-lg p-8 bg-zinc-50 hover:bg-white hover:shadow-md transition-all">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-500 mb-2">BYO-Key</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-extrabold text-zinc-900">₹799</span>
                                    <span className="text-zinc-500">/session</span>
                                </div>
                                <p className="text-xs text-zinc-400 mt-2 font-mono">Platform Fee Only ($7.99 USD)</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3 text-zinc-700 text-sm">
                                    <Check className="h-5 w-5 text-zinc-400 shrink-0" />
                                    <span><strong>Unlimited Operations</strong> (Billed to you directly)</span>
                                </li>
                                <li className="flex items-start gap-3 text-zinc-700 text-sm">
                                    <Check className="h-5 w-5 text-zinc-400 shrink-0" />
                                    <span>Use your own OpenAI/Gemini Keys</span>
                                </li>
                                <li className="flex items-start gap-3 text-zinc-700 text-sm">
                                    <ShieldCheck className="h-5 w-5 text-zinc-400 shrink-0" />
                                    <span className="text-xs text-zinc-500 leading-tight">
                                        <strong>Privacy Guarantee:</strong> Keys are never stored. They exist only in-session and are destroyed on logout.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3 text-zinc-700 text-sm">
                                    <Check className="h-5 w-5 text-green-600 shrink-0" />
                                    <span>PDF Audit Report</span>
                                </li>
                            </ul>

                            <Link href="/dashboard/settings">
                                <Button variant="outline" className="w-full border-zinc-300 hover:bg-zinc-100 h-12">
                                    Run with Your Own Keys
                                </Button>
                            </Link>
                        </div>

                    </div>

                    <div className="max-w-3xl mx-auto mt-12 space-y-8">
                        <div className="text-center space-y-4">
                            <h3 className="text-xl font-bold font-serif">Why the difference?</h3>
                            <p className="text-zinc-600">
                                <strong>Standard Mode</strong> includes the cost of the high-reasoning inference required to run multi-pass adversarial governance.
                                <strong> BYOK Mode</strong> allows you to pay those providers directly, so we charge only a small protocol fee for the interface and orchestration.
                            </p>
                        </div>

                        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 md:p-8">
                            <h4 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
                                <span className="text-zinc-400">?</span> What does "Up to 15 Claims" mean?
                            </h4>
                            <div className="space-y-4 text-sm text-zinc-700 leading-relaxed font-sans">
                                <p>
                                    A claim is a core assertion your paper makes that must survive reviewer scrutiny — for example, a novelty claim, a methodological claim, or a theoretical implication.
                                </p>
                                <p>
                                    <strong>ARGUS automatically extracts and audits the most important claims in your manuscript.</strong>
                                </p>
                                <p>
                                    Most abstracts and early-stage manuscripts contain fewer than 15 core claims. Full-length papers with extensive contributions may contain more. If your paper exceeds the limit, ARGUS will prioritize the most central claims and clearly indicate which ones were not audited.
                                </p>
                                <p className="text-zinc-500 italic border-t border-zinc-200 pt-4 mt-4">
                                    You do not need to manually identify claims. ARGUS does this for you.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
