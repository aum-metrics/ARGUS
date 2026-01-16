import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full py-6 bg-white border-t border-zinc-200 mt-auto">
            <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-zinc-400">
                    &copy; 2026 ARGUS Governance Protocol. All rights reserved.
                </p>
                <nav className="flex gap-4 sm:gap-6 text-xs text-zinc-500 font-sans">
                    <Link href="/protocol" className="hover:underline hover:text-zinc-900 transition-colors">Protocol</Link>
                    <Link href="/about" className="hover:underline hover:text-zinc-900 transition-colors">About</Link>
                    <Link href="/terms" className="hover:underline hover:text-zinc-900 transition-colors">Terms</Link>
                    <Link href="/privacy" className="hover:underline hover:text-zinc-900 transition-colors">Privacy</Link>
                    <Link href="/refund-policy" className="hover:underline hover:text-zinc-900 transition-colors">Refunds</Link>
                    <Link href="/contact" className="hover:underline hover:text-zinc-900 transition-colors">Contact</Link>
                </nav>
            </div>
        </footer>
    )
}
