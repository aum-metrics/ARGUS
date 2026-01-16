import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Building2, Users, FileText, ArrowRight, CheckCircle2 } from "lucide-react"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"

export default function EnterprisePage() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-serif selection:bg-zinc-100 selection:text-zinc-900">
            <Header />

            <main className="flex-1">
                {/* HERO */}
                <section className="relative py-24 md:py-32 overflow-hidden bg-white">
                    {/* Subtle Academic Grid Pattern */}
                    <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

                    <div className="container relative z-10 px-4 md:px-6 text-center">
                        <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm font-sans font-medium text-zinc-600 mb-8 shadow-sm">
                            <Building2 className="mr-2 h-3 w-3 text-zinc-900" />
                            For Universities & Research Labs
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-zinc-900 font-serif">
                            Governance at <br className="hidden md:inline" /> <span className="text-zinc-500 underline decoration-zinc-200 underline-offset-8">Institutional Scale</span>.
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg md:text-xl text-zinc-500 leading-relaxed mb-10 font-serif">
                            Deploy ARGUS across your entire department. Standardize pre-submission rigor, track output quality, and reduce desk rejections by 40%.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center font-sans">
                            <Link href="/contact">
                                <Button size="lg" className="bg-zinc-900 text-white hover:bg-zinc-800 h-14 px-8 rounded-full font-bold text-base shadow-xl hover:shadow-2xl transition-all">
                                    Partner with ARGUS <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/protocol">
                                <Button size="lg" variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 h-14 px-8 rounded-full font-medium">
                                    View Protocol Details
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FEATURES GRID */}
                <section className="py-24 bg-zinc-50 border-y border-zinc-200">
                    <div className="container px-4 md:px-6">
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="space-y-4">
                                <div className="p-3 bg-white w-fit rounded-lg border border-zinc-200 shadow-sm">
                                    <ShieldCheck className="h-6 w-6 text-zinc-800" />
                                </div>
                                <h3 className="text-xl font-bold font-serif text-zinc-900">Standardized Audit Trail</h3>
                                <p className="text-zinc-600 text-base leading-relaxed font-sans">
                                    Every manuscript submitted by your students generates a digitally certified Governance Report. Ensure rigorous methodology before it leaves the lab.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 bg-white w-fit rounded-lg border border-zinc-200 shadow-sm">
                                    <Users className="h-6 w-6 text-zinc-800" />
                                </div>
                                <h3 className="text-xl font-bold font-serif text-zinc-900">Departmental Seats</h3>
                                <p className="text-zinc-600 text-base leading-relaxed font-sans">
                                    Provision access for 50-500 researchers. Centralized billing, shared credit pools, and admin oversight on usage metrics (without seeing private data).
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 bg-white w-fit rounded-lg border border-zinc-200 shadow-sm">
                                    <FileText className="h-6 w-6 text-zinc-800" />
                                </div>
                                <h3 className="text-xl font-bold font-serif text-zinc-900">Custom Output Schemas</h3>
                                <p className="text-zinc-600 text-base leading-relaxed font-sans">
                                    Tailor the "Judge" agent to your specific field (e.g., Computer Vision vs. Molecular Biology) or target journal requirements.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRICING TABLE (Enterprise) */}
                <section className="py-24 bg-white">
                    <div className="container px-4 md:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4 font-serif text-zinc-900">Institutional Tiers</h2>
                            <p className="text-zinc-500 font-sans">Designed for high-volume research environments.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* DEPARTMENT TIER */}
                            <div className="p-8 border border-zinc-200 rounded-2xl bg-white hover:shadow-lg transition-shadow">
                                <h3 className="text-xl font-bold mb-2 font-serif text-zinc-900">Department License</h3>
                                <div className="text-4xl font-bold mb-6 text-zinc-900">$299.99<span className="text-base font-normal text-zinc-500 font-sans">/mo</span></div>
                                <ul className="space-y-3 mb-8 text-sm text-zinc-600 font-sans">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Up to 10 Researcher Seats</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> 15 Full Audits / Month</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Priority Compute Queue</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Branded Reports</li>
                                </ul>
                                <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 h-12">Start Trial</Button>
                            </div>

                            {/* UNIVERSITY TIER */}
                            <div className="p-8 border border-zinc-200 rounded-2xl bg-zinc-50 relative hover:border-zinc-300 transition-colors">
                                <div className="absolute top-0 right-0 bg-zinc-900 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg font-sans uppercase">
                                    Most Popular
                                </div>
                                <h3 className="text-xl font-bold mb-2 font-serif text-zinc-900">University License</h3>
                                <div className="text-4xl font-bold mb-6 text-zinc-900">$999.99<span className="text-base font-normal text-zinc-500 font-sans">/mo</span></div>
                                <ul className="space-y-3 mb-8 text-sm text-zinc-600 font-sans">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-zinc-900" /> Unlimited Seats (SSO)</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-zinc-900" /> 60 Full Audits / Month</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-zinc-900" /> Custom Agent Configurations</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-zinc-900" /> Dedicated Account Manager</li>
                                </ul>
                                <Button variant="outline" className="w-full border-zinc-300 text-zinc-900 hover:bg-zinc-100 h-12">Contact Sales</Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
