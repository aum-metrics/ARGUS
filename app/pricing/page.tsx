/**
 * Author: Sambath Kumar Natarajan
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Check } from "lucide-react"
import { Footer } from "@/components/Footer"

import { Header } from "@/components/Header"

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-serif">
            <Header />

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

                        {/* CENTERED SINGLE TIER */}
                        <div className="border border-zinc-200 rounded-lg p-8 bg-white shadow-lg relative col-span-2 max-w-lg mx-auto w-full">
                            <div className="absolute top-0 right-0 bg-zinc-900 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                ENTERPRISE GRADE
                            </div>
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-500 mb-2">Full Adversarial Audit</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-extrabold text-zinc-900">$14.99</span>
                                    <span className="text-zinc-500">/audit</span>
                                </div>
                                <p className="text-zinc-500 mt-2 font-mono text-sm">One complete adversarial audit session.</p>
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
                                    <span>PDF Audit Report & Viral Certificate</span>
                                </li>
                            </ul>

                            <Link href="/dashboard">
                                <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 h-12 shadow-md">
                                    Start Full Audit
                                </Button>
                            </Link>
                        </div>

                    </div>

                    {/* INSTITUTIONAL SECTION */}
                    <div className="max-w-4xl mx-auto mt-16 mb-20 text-center">
                        <div className="bg-zinc-900 rounded-2xl p-8 md:p-12 text-zinc-50 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold font-serif mb-4">Are you a Department Head or Lab Director?</h3>
                                <p className="text-zinc-400 max-w-2xl mx-auto mb-8 font-sans">
                                    Equip your entire research cohort with ARGUS-Thesis. Standardize pre-submission rigor, reduce desk rejections, and track output quality with our unified dashboard.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/enterprise">
                                        <Button className="bg-white text-zinc-950 hover:bg-zinc-200 h-12 px-8 font-bold">
                                            View Institutional Tiers
                                        </Button>
                                    </Link>
                                    <Link href="/contact">
                                        <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-12 px-8">
                                            Book Demo
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-3xl mx-auto mt-12 space-y-8">
                        <div className="text-center space-y-4">
                            <h3 className="text-xl font-bold font-serif">Why only one tier?</h3>
                            <p className="text-zinc-600">
                                ARGUS-Thesis requires <strong>managed, high-reasoning compute clusters</strong> to perform its adversarial audit. We bundle this cost directly into the session fee to ensure consistent, secure performance without you needing to manage API keys.
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
                                    You do not need to manually identify claims. ARGUS-Thesis does this for you.
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
