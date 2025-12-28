import Link from "next/link"
import { ShieldCheck, ArrowLeft, Mail } from "lucide-react"
import { Footer } from "@/components/Footer"

export default function ContactPage() {
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
                                <a href="mailto:hello@aumdatalabs.com" className="text-blue-600 font-mono text-sm underline hover:text-blue-800">
                                    hello@aumdatalabs.com
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
