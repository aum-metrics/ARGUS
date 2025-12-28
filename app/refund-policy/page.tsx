import Link from "next/link"
import { ShieldCheck, ArrowLeft } from "lucide-react"
import { Footer } from "@/components/Footer"

export default function RefundPolicy() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-serif selection:bg-zinc-100 selection:text-zinc-900">
            <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-200 sticky top-0 bg-white z-50">
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

            <main className="flex-1 py-16 md:py-24">
                <div className="container px-4 md:px-6 max-w-3xl mx-auto space-y-12">
                    <div className="space-y-4 border-b border-zinc-100 pb-8">
                        <Link href="/" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 font-sans mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
                        </Link>
                        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Refund & Cancellation Policy</h1>
                        <p className="text-zinc-500 font-sans text-sm">Last Updated: December 28, 2025</p>
                    </div>

                    <div className="prose prose-zinc prose-headings:font-serif prose-p:font-serif prose-p:text-zinc-700 max-w-none space-y-8">

                        <div className="bg-red-50 border border-red-100 p-6 rounded-lg text-red-900 font-sans">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5" /> All Sales Are Final
                            </h3>
                            <p className="text-sm">
                                Due to the high computational cost of the Adversarial Audit Engine, we typically do not offer refunds. Please read below for details.
                            </p>
                        </div>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">1. No Refunds</h2>
                            <p>
                                ARGUS operates on a "consume-on-demand" model. Instantiating the governance agents consumes irreversible computational resources (tokens) from our providers.
                                Therefore, <strong>we do not offer refunds</strong> for any "Full Adversarial Audit" or "Platform Fee" payments once the audit process has been unlocked.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">2. Cancellations</h2>
                            <p>
                                You may cancel your session at any time by closing the browser or clicking "End Session".
                                However, cancellation does not trigger a refund for fees already paid to unlock that session.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">3. Exceptions</h2>
                            <p>
                                In the rare event of a <strong>verifyable system failure</strong> where you were charged but the audit engine explicitly failed to initialize (zero claims extracted), you may contact support.
                                We will review server logs and, solely at our discretion, may issue a refund or a credit for a future audit.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">Contact Support</h2>
                            <p>
                                For billing disputes or technical failures, please email: <a href="mailto:hello@aumdatalabs.com" className="text-blue-600 underline">hello@aumdatalabs.com</a>
                            </p>
                        </section>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
