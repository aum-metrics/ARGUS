/**
 * Author: Sambath Kumar Natarajan
 */
import Link from "next/link"
import { ShieldCheck, ArrowLeft } from "lucide-react"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"

export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-serif selection:bg-zinc-100 selection:text-zinc-900">
            <Header />

            <main className="flex-1 py-16 md:py-24">
                <div className="container px-4 md:px-6 max-w-3xl mx-auto space-y-12">
                    <div className="space-y-4 border-b border-zinc-100 pb-8">
                        <Link href="/" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 font-sans mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
                        </Link>
                        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Terms of Service</h1>
                        <p className="text-zinc-500 font-sans text-sm">Last Updated: December 28, 2025</p>
                    </div>

                    <div className="prose prose-zinc prose-headings:font-serif prose-p:font-serif prose-p:text-zinc-700 max-w-none space-y-8">

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using the ARGUS Adversarial Research Governance System ("Service"), you agree to be bound by these Terms.
                                This Service provides automated, algorithmic auditing of academic claims using third-party Large Language Models (LLMs).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">2. Nature of the Service (Adversarial Audit)</h2>
                            <p>
                                ARGUS-Thesis is not an editing tool, a writing assistant, or a plagiarism checker. It is an <strong>adversarial stress-testing system</strong>.
                                Its meaningful output may include severe critiques, rejection of your premises, or identification of logical fallacies.
                                By using the Service, you acknowledge that the system is designed to challenge your work, not to validate it.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">3. Ephemeral Data Policy</h2>
                            <p>
                                We operate on a strict "Zero Persistence" model for user inputs.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-4 text-zinc-700">
                                <li><strong>Ephemeral Processing:</strong> Your manuscript text is held in volatile memory only for the duration of the active session.</li>
                                <li><strong>No Database Storage:</strong> We do not write your inputs or the system's outputs to a persistent database.</li>
                                <li><strong>Session Termination:</strong> Upon logging out or closing the browser window, all session keys are destroyed. Data cannot be recovered.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">4. Usage & Token Billing</h2>
                            <p>
                                Elements of the Service are billed on a "Per-Audit" or "Pay-as-you-go" basis.
                                Costs are estimated based on token consumption by the underlying LLM agents (e.g., Google Gemini).
                                Users are responsible for all charges incurred by initiating an audit loop.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">5. Disclaimer of Liability</h2>
                            <p>
                                The Service is provided "AS IS". We make no warranties regarding the accuracy of the adversarial feedback.
                                Use of ARGUS does not guarantee acceptance at any journal or conference.
                                We are not liable for any rejection, academic penalty, or loss of data resulting from the use of the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">6. Refund & Cancellation Policy</h2>
                            <p className="font-bold text-red-600">
                                STRICT NO REFUND POLICY:
                            </p>
                            <p className="mt-2">
                                All purchases of ARGUS-Thesis Audit Credits or Platform Access are <strong>FINAL and NON-REFUNDABLE</strong>.
                            </p>
                            <p className="mt-2">
                                Because the Service incurs immediate irreversible costs (LLM token consumption) upon initiation, we cannot offer refunds once a session has begun.
                                By clicking "Pay" and unlocking the audit engine, you explicitly acknowledge and waive your right to a refund.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">7. Bring Your Own Key (BYOK)</h2>
                            <p>
                                If you choose to provide your own API keys (e.g., OpenAI, Gemini), you are responsible for maintaining the secrecy of those keys.
                                Keys are stored in your browser's local storage and are never transmitted to our servers except to proxy the request to the model provider.
                            </p>
                        </section>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
