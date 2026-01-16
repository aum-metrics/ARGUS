/**
 * Author: Sambath Kumar Natarajan
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
    return (
        <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-200/50 bg-white/70 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
            <div className="flex items-center gap-2">
                <Link href="/">
                    <div className="flex items-center gap-2 cursor-pointer">
                        <img src="/logo.jpg" alt="ARGUS" className="h-10 w-auto" />
                    </div>
                </Link>
            </div>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-600 font-sans">
                <Link href="/protocol" className="hover:text-black hover:underline underline-offset-4 decoration-zinc-300">Protocol</Link>
                <Link href="/pricing" className="hover:text-black hover:underline underline-offset-4 decoration-zinc-300">Pricing</Link>
                <Link href="/enterprise" className="hover:text-black hover:underline underline-offset-4 decoration-zinc-300">Enterprise</Link>
            </nav>
            <div className="flex items-center gap-4 font-sans">
                <Link href="/login">
                    <Button variant="ghost" className="text-zinc-600 hover:text-black hover:bg-white text-xs uppercase tracking-wider font-bold">
                        Sign In
                    </Button>
                </Link>
                <Link href="/dashboard">
                    <Button className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm px-6">
                        Launch Argus
                    </Button>
                </Link>
            </div>
        </header>
    )
}
