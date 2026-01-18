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
                        <p className="text-zinc-500 font-sans text-sm">Last Updated: January 18, 2026</p>
                    </div>

                    <div className="prose prose-zinc prose-headings:font-serif prose-p:font-serif prose-p:text-zinc-700 max-w-none space-y-8">

                        <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-200 not-prose mb-8">
                            <p className="text-xl italic text-zinc-700 font-serif text-center">
                                "Transparency builds trust. We use AI to analyze your work, and we're honest about it."
                            </p>
                        </div>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                <FileX className="h-5 w-5" /> 1. AI-Powered Analysis
                            </h2>
                            <p className="mb-4">
                                ARGUS-Thesis uses <strong>Google Gemini 2.5 AI</strong> to analyze your manuscript. Your thesis text is sent to Google's API for processing. While Google states they don't use API data for training, your content does leave our servers during analysis.
                            </p>
                            <p>
                                <strong>What we DON'T do:</strong><br />
                                • Store your manuscript in our database<br />
                                • Share your content with third parties<br />
                                • Use your data for training our own models
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                <Lock className="h-5 w-5" /> 2. No Database Storage
                            </h2>
                            <p>
                                We do not maintain a database of user submissions. We do not write log files containing your intellectual property.
                                Only audit metadata (claim count, status, timestamps) is retained for billing and analytics.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                <Trash2 className="h-5 w-5" /> 3. Session Cleanup
                            </h2>
                            <p>
                                Upon clicking "End Session", the system performs a memory cleanup and generates a <strong>Deletion Certificate</strong>.
                                This is a timestamped hash proving the destruction of the session's temporary keys and data structures.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5" /> 4. Google's Privacy Commitment
                            </h2>
                            <p>
                                Google Gemini API is subject to Google's Enterprise Data Privacy policies. According to Google's terms, API data is not used for training models. However, your content is processed on Google's infrastructure during analysis.
                            </p>
                            <p className="mt-4">
                                <strong>For maximum privacy:</strong> If your research is highly sensitive, consider using the manual text paste option and reviewing your content before submission.
                            </p>
                        </section>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
