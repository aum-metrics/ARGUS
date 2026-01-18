/**
 * Author: Sambath Kumar Natarajan
 */
import Link from "next/link"
import { ShieldCheck, ArrowLeft, Lock, FileX, Trash2 } from "lucide-react"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"

export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-serif selection:bg-zinc-100 selection:text-zinc-900">
            <Header />

            <main className="flex-1 py-16 md:py-24">
                <div className="container px-4 md:px-6 max-w-3xl mx-auto space-y-12">
                    <div className="space-y-4 border-b border-zinc-100 pb-8">
                        <Link href="/" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 font-sans mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
                        </Link>
                        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Privacy Policy</h1>
                        <p className="text-zinc-500 font-sans text-sm">Last Updated: December 28, 2025</p>
                    </div>

                    <div className="prose prose-zinc prose-headings:font-serif prose-p:font-serif prose-p:text-zinc-700 max-w-none space-y-8">

                        <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-200 not-prose mb-8">
                            <p className="text-xl italic text-zinc-700 font-serif text-center">
                                "Data that doesn't exist cannot be subpoenaed, leaked, or stolen."
                            </p>
                        </div>

                        <section>
                            <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 mb-3">
                                <FileX className="h-5 w-5" /> 1. AI-Powered Analysis
                            </h3>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                ARGUS-Thesis uses <strong>Google Gemini 2.5 AI</strong> to analyze your manuscript. Your thesis text is sent to Google's API for processing. While Google states they don't use API data for training, your content does leave our servers during analysis.
                            </p>
                            <p className="text-zinc-600 leading-relaxed">
                                <strong>What we DON'T do:</strong><br />
                                • Store your manuscript in our database<br />
                                • Share your content with third parties<br />
                                • Use your data for training our own models
                            </p>
                            When the node process ends or your session times out (42 minutes), the memory is zeroed.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                            <Lock className="h-5 w-5" /> 2. Zero Persistence
                        </h2>
                        <p>
                            We do not maintain a database of user submissions. We do not write log files containing your intellectual property.
                            We do not use your data to train our own models. Your data exists only for the millisecond duration of the network request to the LLM provider.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                            <Trash2 className="h-5 w-5" /> 3. Cryptographic Deletion
                        </h2>
                        <p>
                            Upon clicking "End Session", the system performs a memory cleanup and generates a <strong>Deletion Certificate</strong>.
                            This is a timestamped hash proving the destruction of the session's temporary keys and data structures.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-zinc-900 mb-4">4. Third Party Processors</h2>
                        <p>
                            To perform the audit, snippets of your text are sent to Large Language Model providers (e.g., Google Gemini, OpenAI).
                            These providers are subject to their own stringent Enterprise Data Privacy policies, which generally preclude training on API-submitted data.
                        </p>
                    </section>

                </div>
        </div>
            </main >
        <Footer />
        </div >
    );
}
