/**
 * Author: Sambath Kumar Natarajan
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Scale, ScrollText, Lock, ArrowRight, BookOpen, PlayCircle } from "lucide-react"
import { Footer } from "@/components/Footer"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

import { Header } from "@/components/Header"
import { LiveTicker } from "@/components/landing/LiveTicker"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-serif selection:bg-zinc-100 selection:text-zinc-900">
      {/* HEADER */}
      <Header />

      {/* HERO SECTION */}
      <main className="flex-1">
        <section className="relative w-full py-16 md:py-24 bg-white overflow-hidden border-b border-zinc-100">
          {/* Background Decoration */}
          <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-10">

              <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-sans font-medium text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50">
                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                System V2.0: Enterprise Ready
              </div>

              <div className="space-y-6 max-w-[900px]">
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-zinc-900 font-serif leading-[0.9]">
                  Pre-Flight <br className="hidden sm:inline" /> <span className="text-zinc-500 decoration-zinc-300 underline underline-offset-8">Validator</span> for Research.
                </h1>
                <p className="mx-auto max-w-[800px] text-zinc-500 md:text-xl/relaxed lg:text-2xl/relaxed font-serif leading-normal uppercase-nums">
                  Define the institutional standard. ARGUS-Thesis functions as an adversarial pre-flight check. It generates a <strong>Technical Governance Report</strong> evaluating your manuscript against the structural patterns of high-impact research.
                </p>

                <div className="mt-12 w-full max-w-4xl mx-auto border-t border-zinc-100 pt-8">
                  <p className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest text-center mb-6">Trusted By</p>
                  <div className="grid md:grid-cols-3 gap-6 text-center font-sans">
                    <div>
                      <h3 className="font-bold text-zinc-900 text-sm">PhD Candidates</h3>
                      <p className="text-zinc-500 text-sm mt-1">Stress-testing defenses</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 text-sm">Lab Directors</h3>
                      <p className="text-zinc-500 text-sm mt-1">Standardizing output quality</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 text-sm">Grant Writers</h3>
                      <p className="text-zinc-500 text-sm mt-1">Validating core impact</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto font-sans">
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-zinc-900 text-white hover:bg-zinc-800 px-8 h-14 rounded-full text-base font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
                      Start Audit <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <Link href="/playground" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 px-8 h-14 rounded-full text-base font-bold shadow-sm hover:shadow-md transition-all duration-300">
                      Try Logic Scan (Free)
                    </Button>
                  </Link>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg" variant="outline" className="w-full sm:w-auto border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-black hover:border-zinc-300 px-8 h-14 rounded-full text-base font-medium gap-2">
                        <PlayCircle className="h-5 w-5" /> Watch Demo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px] p-0 bg-black border-zinc-800 overflow-hidden">
                      <video
                        src="/Demo.mov"
                        className="w-full h-auto max-h-[80vh] object-contain bg-black"
                        controls
                        autoPlay
                        playsInline
                      />
                    </DialogContent>
                  </Dialog>

                  <Link href="/enterprise" className="w-full sm:w-auto">
                    <Button size="lg" variant="ghost" className="w-full sm:w-auto text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 px-8 h-14 rounded-full text-base font-medium">
                      For Universities
                    </Button>
                  </Link>
                </div>

                <p className="border-t border-zinc-100 pt-6 text-xs text-zinc-500 font-serif max-w-md mx-auto md:mx-0 text-left">
                  <span className="font-bold text-zinc-900">Technical Governance:</span> The system generates a timestamped <span className="underline decoration-zinc-300 underline-offset-4">Audit Artifact</span> documenting the logical stress-test results. This is a computational benchmark, not a peer review replacement.
                </p>
              </div>

              <div className="mt-6 flex flex-col items-center md:items-start gap-4">
                <Link href="/argus_audit_manuscript.pdf" target="_blank" className="inline-flex items-center gap-2 text-sm font-sans font-medium text-zinc-500 hover:text-zinc-900 border-b border-zinc-200 hover:border-zinc-900 pb-0.5 transition-all">
                  <BookOpen className="h-4 w-4" /> View Sample Audit Report (PDF)
                </Link>
                <p className="text-xs text-zinc-400 font-mono tracking-wide">
                  Top 25% of Papers Verified by ARGUS-Thesis<br />are Accepted without Revisions.
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs text-zinc-400 font-sans tracking-wide uppercase">
                <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Ephemeral Privacy</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Verifiable Artifacts</span>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE TICKER - "The Pulse of Science" */}
        <LiveTicker />

        {/* TRUSTED BY - Clean Integration */}
        <section className="border-b border-zinc-100 py-12">
          <div className="container px-4 md:px-6 text-center">
            <p className="text-xs md:text-sm font-sans font-bold text-zinc-500 uppercase tracking-widest mb-8">Calibrated for Researchers at Top Universities</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-opacity duration-700">
              <span className="text-xl font-serif font-bold text-zinc-800">IITs</span>
              <span className="text-xl font-serif font-bold text-zinc-800">IIMs</span>
              <span className="text-xl font-serif font-bold text-zinc-800">Stanford</span>
              <span className="text-xl font-serif font-bold text-zinc-800">MIT</span>
              <span className="text-xl font-serif font-bold text-zinc-800">Oxford</span>
              <span className="text-xl font-serif font-bold text-zinc-800">Harvard</span>
              <span className="text-xl font-serif font-bold text-zinc-800">IISc</span>
            </div>
          </div>
        </section>

        {/* UNIFIED SYSTEM ARCHITECTURE */}
        <section className="w-full py-24 bg-white">
          <div className="container px-4 md:px-6">

            {/* 1. Methodology - The Compiler */}
            <div className="max-w-4xl mx-auto space-y-16">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-zinc-50 border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  System V2.0 Architecture
                </div>
                <h2 className="text-4xl md:text-5xl font-bold font-serif tracking-tight text-zinc-900">
                  The Adversarial Compiler.
                </h2>
                <p className="text-xl text-zinc-500 font-serif leading-relaxed max-w-2xl mx-auto">
                  Research is not written; it is forged. ARGUS-Thesis treats your manuscript as code, compiling it against strict logical axioms and novelty requirements.
                </p>
              </div>

              {/* The Visual Process Loop */}
              <div className="grid md:grid-cols-3 gap-8 pt-8">
                {/* Step 1 */}
                <div className="relative p-8 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <h3 className="text-lg font-bold font-serif text-zinc-900 mb-2">1. AST Parsing</h3>
                  <p className="text-base text-zinc-600 leading-relaxed">
                    Decomposing text into an Abstract Syntax Tree of core claims, evidence, and logical connectives.
                  </p>
                </div>
                {/* Step 2 */}
                <div className="relative p-8 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <h3 className="text-lg font-bold font-serif text-zinc-900 mb-2">2. Agent Swarm</h3>
                  <p className="text-base text-zinc-600 leading-relaxed">
                    Six specialized agents (The Auditor, The Reviewer, The Statistician) attack the AST from conflicting perspectives.
                  </p>
                </div>
                {/* Step 3 */}
                <div className="relative p-8 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <h3 className="text-lg font-bold font-serif text-zinc-900 mb-2">3. Consensus</h3>
                  <p className="text-base text-zinc-600 leading-relaxed">
                    Only claims that survive multi-agent convergence are stamped with a Validity Key.
                  </p>
                </div>
              </div>
            </div>

            <div className="my-24 border-t border-zinc-100"></div>

            {/* 2. System Properties (Privacy etc) */}
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div>
                <h3 className="text-3xl font-bold font-serif text-zinc-900 mb-4">Zero-Retention Protocol.</h3>
                <p className="text-lg text-zinc-500 font-serif leading-relaxed mb-6">
                  Your intellectual property is ephemeral. The system processes the AST in volatile memory and purposefully destroys the session data post-audit.
                </p>
                <ul className="space-y-4 font-sans text-sm">
                  <li className="flex items-center gap-3 text-zinc-700">
                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-600"><Lock className="w-3.5 h-3.5" /></div>
                    <span>No database persistence of manuscript text.</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-700">
                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-600"><ShieldCheck className="w-3.5 h-3.5" /></div>
                    <span>Cryptographically signed Audit Artifacts.</span>
                  </li>
                </ul>
              </div>

              {/* Abstract Visual - The Code Block */}
              <div className="rounded-xl bg-zinc-900 p-6 shadow-2xl skew-y-1 transform">
                <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-zinc-500 font-mono ml-2">audit_core.py</span>
                </div>
                <div className="space-y-2 font-mono text-xs text-zinc-400">
                  <p><span className="text-purple-400">def</span> <span className="text-blue-400">verify_integrity</span>(claim):</p>
                  <p className="pl-4">consensus = agents.swarm(claim)</p>
                  <p className="pl-4"><span className="text-purple-400">if</span> consensus.score &lt; <span className="text-orange-400">0.85</span>:</p>
                  <p className="pl-8"><span className="text-purple-400">raise</span> <span className="text-yellow-400">LogicalFallacyError</span></p>
                  <p className="pl-4"><span className="text-purple-400">return</span> consensus.signed_packet()</p>
                </div>
              </div>
            </div>

            <div className="my-24 border-t border-zinc-100"></div>

            {/* 3. System Limitations (Clean Text) */}
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-base font-bold font-sans uppercase tracking-widest text-zinc-900 mb-8">System Constraints</h3>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-zinc-900 text-lg">Logical Consistency Only</h4>
                  <p className="text-base text-zinc-600 font-serif leading-relaxed">ARGUS-Thesis verifies internal logic and novelty structure. It does not verify external empirical data correctness vs the real world.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-zinc-900 text-lg">No Authorship</h4>
                  <p className="text-base text-zinc-600 font-serif leading-relaxed">The system is a critic, not a writer. It will never generate manuscript prose, only structural critique.</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div >
  )
}
