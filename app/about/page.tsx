/**
 * Author: Sambath Kumar Natarajan
 * 
 * About Page
 * Displays mission statement, team information, and core philosophy of the platform.
 */
import Link from "next/link"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { Users, Target, Shield, Globe } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-serif">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-24 border-b border-zinc-100">
                    <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-zinc-900 mb-6 font-serif">
                            Guardians of Scientific Integrity.
                        </h1>
                        <p className="text-xl text-zinc-500 font-serif leading-relaxed max-w-2xl mx-auto">
                            In an age of generative noise, we build the adversarial infrastructure required to verify truth.
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-24 bg-white">
                    <div className="container px-4 md:px-6 max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-bold font-serif mb-6">The Mission</h2>
                                <p className="text-lg text-zinc-600 leading-relaxed mb-6 font-serif">
                                    Argus was founded on a simple, yet radial premise: **Scientific verification must be harder than scientific generation.**
                                </p>
                                <p className="text-zinc-600 leading-relaxed font-serif">
                                    As AI tools make it effortless to generate plausible-sounding text, the barrier to producing low-quality research has collapsed. We are rebuilding that barrier—not with bureaucracy, but with superior engineering.
                                </p>
                            </div>
                            <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-100">
                                <ul className="space-y-6">
                                    <li className="flex items-start gap-4">
                                        <div className="bg-white p-2 rounded border border-zinc-200 shadow-sm">
                                            <Target className="h-6 w-6 text-zinc-900" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold font-sans text-zinc-900">Precision</h3>
                                            <p className="text-sm text-zinc-500 mt-1">We value rigorous structural logic over stylistic flair.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="bg-white p-2 rounded border border-zinc-200 shadow-sm">
                                            <Shield className="h-6 w-6 text-zinc-900" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold font-sans text-zinc-900">Neutrality</h3>
                                            <p className="text-sm text-zinc-500 mt-1">Our algorithms are blind to author reputation, focusing only on the argument.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="bg-white p-2 rounded border border-zinc-200 shadow-sm">
                                            <Globe className="h-6 w-6 text-zinc-900" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold font-sans text-zinc-900">Access</h3>
                                            <p className="text-sm text-zinc-500 mt-1">Democratizing elite-level peer review for researchers globally.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team / Context */}
                <section className="py-24 bg-zinc-50 border-t border-zinc-200">
                    <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center">
                        <div className="mb-12">
                            <div className="inline-flex items-center justify-center p-3 bg-white rounded-full border border-zinc-200 shadow-sm mb-6">
                                <Users className="h-8 w-8 text-zinc-900" />
                            </div>
                            <h2 className="text-3xl font-bold font-serif mb-4">The Origin</h2>
                            <p className="text-zinc-600 leading-relaxed font-serif mb-6">
                                Argus was architected by an **Executive MBA student at IIT Madras**, leveraging nearly two decades of professional experience in Computer Science and high-stakes IT Consulting.
                            </p>
                            <p className="text-zinc-600 leading-relaxed font-serif">
                                It is an engineered response to a pervasive academic problem, built with the solidity of enterprise systems and the nuance of scholarly inquiry.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
                            {/* Reusing the trusted logos as 'Background' context */}
                            <span className="text-xl font-serif font-bold text-zinc-800">IITs</span>
                            <span className="text-xl font-serif font-bold text-zinc-800">IIMs</span>
                            <span className="text-xl font-serif font-bold text-zinc-800">Stanford</span>
                            <span className="text-xl font-serif font-bold text-zinc-800">MIT</span>
                            <span className="text-xl font-serif font-bold text-zinc-800">Oxford</span>
                            <span className="text-xl font-serif font-bold text-zinc-800">Harvard</span>
                            <span className="text-xl font-serif font-bold text-zinc-800">IISc</span>
                        </div>

                        <div className="mt-16">
                            <p className="text-xs text-zinc-400 font-sans uppercase tracking-widest">
                                Built in Chennai, India for the global academic community.
                            </p>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    )
}
