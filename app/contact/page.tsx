/**
 * Author: Sambath Kumar Natarajan
 */
import Link from "next/link"
import { ShieldCheck, ArrowLeft, Mail } from "lucide-react"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-serif selection:bg-zinc-100 selection:text-zinc-900">
            <Header />

            <main className="flex-1 py-16 md:py-24">
                <div className="container px-4 md:px-6 max-w-xl mx-auto space-y-12">
                    <div className="space-y-4 border-b border-zinc-100 pb-8">
                        <Link href="/" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 font-sans mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
                        </Link>
                        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Contact Us</h1>
                        <p className="text-zinc-500 font-sans text-sm">We are here to help.</p>
                    </div>

                    <div className="space-y-8">

                        <div className="flex items-start gap-4 p-6 bg-zinc-50 rounded-lg border border-zinc-100">
                            <Mail className="h-6 w-6 text-zinc-900 mt-1" />
                            <div>
                                <h3 className="font-bold text-lg mb-1">Email Support</h3>
                                <p className="text-zinc-600 text-sm mb-2">
                                    For general inquiries, enterprise licensing, or academic partnerships.
                                </p>
                                <a href="mailto:help@argus-thesis.com" className="text-blue-600 font-mono text-sm underline hover:text-blue-800">
                                    help@argus-thesis.com
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
