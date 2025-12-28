import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Scale, ScrollText, Lock, ArrowRight, BookOpen, XCircle, AlertTriangle } from "lucide-react"
import { Footer } from "@/components/Footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-serif selection:bg-zinc-100 selection:text-zinc-900">
      {/* HEADER */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="ARGUS" className="h-10 w-auto" />
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-600 font-sans">
          <Link href="/how-it-works" className="hover:text-black hover:underline underline-offset-4">Methodology</Link>
          <Link href="/pricing" className="hover:text-black hover:underline underline-offset-4">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4 font-sans">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-600 hover:text-black hover:bg-zinc-100">Log In</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-zinc-900 text-white hover:bg-zinc-700">Initialize Governance</Button>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1">
        <section className="relative w-full py-16 md:py-24 bg-white overflow-hidden border-b border-zinc-100">
          {/* Background Decoration */}
          <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-10">

              <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-sans font-medium text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50">
                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                v1.0 Protocol Active
              </div>

              <div className="space-y-6 max-w-[900px]">
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-zinc-900 font-serif leading-[0.9]">
                  Pre-Flight <br className="hidden sm:inline" /> <span className="text-zinc-500 decoration-zinc-300 underline underline-offset-8">Validator</span> for Research.
                </h1>
                <p className="mx-auto max-w-[700px] text-zinc-500 md:text-xl/relaxed lg:text-2xl/relaxed font-serif leading-normal">
                  A multi-agent governance system for academic claims.
                  Ensure <strong>Logical & Methodological Robustness</strong> before you submit.
                </p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto font-sans">
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-zinc-900 text-white hover:bg-zinc-800 px-8 h-14 rounded-full text-base font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
                      Initialize Audit <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/Demo.mov" target="_blank" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-black hover:border-zinc-300 px-8 h-14 rounded-full text-base font-medium">
                      Watch Demo
                    </Button>
                  </Link>
                </div>

                <div className="mt-6">
                  <Link href="/argus_audit_manuscript.pdf" target="_blank" className="inline-flex items-center gap-2 text-sm font-sans font-medium text-zinc-500 hover:text-zinc-900 border-b border-zinc-300 hover:border-zinc-900 pb-0.5 transition-colors">
                    <BookOpen className="h-4 w-4" /> View Sample Audit Report (PDF)
                  </Link>
                </div>

                <div className="flex items-center gap-6 text-xs text-zinc-400 font-sans tracking-wide uppercase">
                  <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Ephemeral Privacy</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Deterministic Output</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST/LOGOS STRIP (Mock) */}
        <section className="border-b border-zinc-100 bg-zinc-50/50 py-10">
          <div className="container px-4 md:px-6 text-center">
            <p className="text-xs font-sans font-semibold text-zinc-400 uppercase tracking-widest mb-6">Optimized for researchers at</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Simple text placeholders for logos to avoid image dependencies */}
              <span className="text-xl font-serif font-bold text-zinc-800">Stanford</span>
              <span className="text-xl font-serif font-bold text-zinc-800">MIT</span>
              <span className="text-xl font-serif font-bold text-zinc-800">Oxford</span>
              <span className="text-xl font-serif font-bold text-zinc-800">Cambridge</span>
              <span className="text-xl font-serif font-bold text-zinc-800">ETH Zürich</span>
            </div>
          </div>
        </section>

        {/* CORE METHODOLOGY */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-sans font-medium text-zinc-800">
                  The Methodology
                </div>
                <h2 className="text-4xl font-bold font-serif tracking-tight text-zinc-900 leading-tight">
                  Adversarial Verification <br /> of Academic Claims.
                </h2>
                <p className="text-lg text-zinc-500 font-serif leading-relaxed">
                  Beyond standard grammar checks, ARGUS evaluates logical consistency and argumentative novelty.
                  Our hybrid "Compiler" parses your claims into an Abstract Syntax Tree (AST) and subjects them to multi-perspective analysis.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-start gap-4">
                    <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg shrink-0">
                      <Scale className="h-5 w-5 text-zinc-900" />
                    </div>
                    <div>
                      <h4 className="font-bold font-sans text-sm text-zinc-900">Human-Directed Scrutiny</h4>
                      <p className="text-sm text-zinc-500 font-serif mt-1">Controlled evaluation. Trigger specific agents (e.g., The Thesis Reviewer, The Logic Auditor) manually. Transparent per-step execution.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg shrink-0">
                      <BookOpen className="h-5 w-5 text-zinc-900" />
                    </div>
                    <div>
                      <h4 className="font-bold font-sans text-sm text-zinc-900">Novelty Depth Classification</h4>
                      <p className="text-sm text-zinc-500 font-serif mt-1">Findings are categorized by significance: Trivial Extension, Contextual Variation, or Substantive Contribution.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Visual Representation of the Process */}
              <div className="relative">
                <div className="absolute inset-0 bg-zinc-100 rounded-2xl rotate-3 transform transition-transform duration-500 group-hover:rotate-6"></div>
                <div className="relative bg-zinc-900 rounded-2xl p-8 shadow-2xl text-white overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
                  {/* Code/Terminal aesthetic */}
                  <div className="font-mono text-xs space-y-4 opacity-90">
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-4 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="ml-2 text-zinc-500">argus_kernel — -zsh — 80x24</span>
                    </div>
                    <p className="text-green-400">➜  ~ initializing audit_session</p>
                    <p className="text-zinc-400">[INFO] Loading 6 agents into ephemeral memory...</p>
                    <p className="text-zinc-400">[INFO] Parsing claim 14B: "Attention is all you need..."</p>
                    <div className="pl-4 border-l-2 border-zinc-600 my-4">
                      <p className="text-zinc-300">Agent: Reviewer_1 active.</p>
                      <p>Analysis: Counter-example identified regarding recurrent neural network limits in infinite context tasks.</p>
                    </div>
                    <p className="text-zinc-400">[INFO] Classification: <span className="text-yellow-400">Contextual Variation</span></p>
                    <p><span className="animate-pulse">_</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Column Features */}
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="group p-8 border border-zinc-200 rounded-xl bg-white hover:border-zinc-300 hover:shadow-lg transition-all duration-300 cursor-default">
                <div className="mb-6 inline-flex p-3 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-900 group-hover:scale-110 transition-transform">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold font-serif mb-3">Ephemeral Privacy</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Session-scoped processing. Data is securely cleared upon session termination. We do not retain manuscript data.
                </p>
              </div>
              <div className="group p-8 border border-zinc-200 rounded-xl bg-white hover:border-zinc-300 hover:shadow-lg transition-all duration-300 cursor-default">
                <div className="mb-6 inline-flex p-3 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-900 group-hover:scale-110 transition-transform">
                  <Scale className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold font-serif mb-3">Unbiased Verdict</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Six independent agents critique your work without direct communication. This methodology reduces "groupthink" and enhances analytical rigor.
                </p>
              </div>
              <div className="group p-8 border border-zinc-200 rounded-xl bg-white hover:border-zinc-300 hover:shadow-lg transition-all duration-300 cursor-default">
                <div className="mb-6 inline-flex p-3 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-900 group-hover:scale-110 transition-transform">
                  <ScrollText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold font-serif mb-3">Rapid Feedback</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Receive detailed, structured feedback on your hypothesis in real-time, allowing for rapid iteration before formal submission.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* WHAT ARGUS IS NOT (Redesigned) */}
        <section className="w-full py-16 bg-zinc-50 border-t border-zinc-200">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold font-serif text-zinc-900">Operational Boundaries</h2>
                <p className="text-zinc-500 font-sans mt-2">To use ARGUS effectively, one must understand system limitations.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm flex items-start gap-4">
                  <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold font-sans text-sm text-zinc-900">NOT a Ghostwriter</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">ARGUS does not generate text for manuscripts. It provides structured critique and audit logs only.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm flex items-start gap-4">
                  <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold font-sans text-sm text-zinc-900">NOT a Fact Checker</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Models may hallucinate. This system checks internal logical consistency, not external empirical truth.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm flex items-start gap-4">
                  <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold font-sans text-sm text-zinc-900">NOT Guaranteed Acceptance</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Passing an ARGUS audit indicates argumentative robustness, not necessarily scientific significance or popularity.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm flex items-start gap-4">
                  <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold font-sans text-sm text-zinc-900">NOT Free or Unlimited</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Advanced inference incurs compute costs. These are passed to the user to maintain sustainable access.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
