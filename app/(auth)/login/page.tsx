/**
 * Author: Sambath Kumar Natarajan
 * 
 * Login Page
 * Handles user authentication via Supabase Auth with email/password and OTP flows.
 */
"use client"

import { cn, getURL } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Form State
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [otp, setOtp] = useState("")

    // View State: 'auth' (tabs) or 'verify' (otp input)
    const [view, setView] = useState<"auth" | "verify">("auth")
    const [activeTab, setActiveTab] = useState("signin")

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${getURL()}auth/callback`,
                },
            })

            if (error) throw error

            setSuccessMessage("Account created! Check your email for a verification code.")
            setView("verify")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-serif">
            <Link href="/" className="absolute top-8 left-8 text-zinc-500 hover:text-zinc-900 flex items-center gap-2 font-sans text-sm">
                <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>

            <div className="mb-8 flex flex-col items-center gap-2">
                <img src="/logo.jpg?v=2" alt="ARGUS-Thesis" className="h-24 w-auto drop-shadow-sm rounded-lg" />
            </div>

            <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border-zinc-200/60 shadow-2xl relative overflow-hidden ring-1 ring-zinc-900/5">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
                    </div>
                )}

                <CardHeader>
                    {view === "auth" ? (
                        <>
                            <CardTitle className="text-2xl font-bold text-center font-serif text-zinc-900">Researcher Login</CardTitle>
                            <CardDescription className="text-center font-sans text-zinc-500">
                                Secure Access to the Governance Engine
                            </CardDescription>
                        </>
                    ) : (
                        <>
                            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                                <CheckCircle2 className="h-6 w-6 text-green-600" /> Verify Identity
                            </CardTitle>
                            <CardDescription className="text-center font-sans text-zinc-500">
                                Enter the code sent to {email}
                            </CardDescription>
                        </>
                    )}
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-900 border border-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {successMessage && view === "auth" && (
                        <div className="mb-4 p-4 rounded-lg bg-green-50 text-green-900 border border-green-200 text-sm">
                            {successMessage}
                        </div>
                    )}

                    {view === "auth" ? (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="signin">Sign In</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="signin">
                                <form onSubmit={handleSignIn} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signin-email">Email</Label>
                                        <Input
                                            id="signin-email"
                                            type="email"
                                            placeholder="researcher@university.edu"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="signin-password">Password</Label>
                                            <Link href="#" className="text-xs text-zinc-500 hover:underline">Forgot?</Link>
                                        </div>
                                        <Input
                                            id="signin-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                                        Sign In
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="signup">
                                <form onSubmit={handleSignUp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="researcher@university.edu"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <p className="text-xs text-zinc-500">Must be at least 6 characters.</p>
                                    </div>
                                    <Button type="submit" className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                                        Create Account
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="space-y-6 text-center">
                            <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-100">
                                <p className="text-zinc-600 mb-4">
                                    We have sent a secure confirmation link to <br />
                                    <strong className="text-zinc-900">{email}</strong>
                                </p>
                                <p className="text-xs text-zinc-400">
                                    Click the link in the email to verify your account and sign in automatically.
                                </p>

                                {/* DEV ONLY: Auto-Confirm */}
                                {process.env.NODE_ENV === 'development' && (
                                    <div className="mt-4 pt-4 border-t border-zinc-200">
                                        <div className="text-[10px] text-amber-600 font-bold uppercase mb-2">Development Mode</div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full text-xs"
                                            onClick={async () => {
                                                try {
                                                    await fetch('/api/dev/verify-user', {
                                                        method: 'POST',
                                                        body: JSON.stringify({ email })
                                                    });
                                                    alert("DEV BYPASS: Account confirmed! You can now log in.");
                                                    setView('auth');
                                                    setActiveTab('signin');
                                                } catch (e) {
                                                    alert("Failed to auto-confirm");
                                                }
                                            }}
                                        >
                                            ⚡ Dev: Force Activate Account
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setView("auth")}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sign In
                            </Button>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-center border-t border-zinc-100 pt-4">
                    <p className="text-xs text-center text-zinc-500 font-sans">
                        Protected by ARGUS-Thesis Governance. <br />
                        <Link href="/terms" className="underline hover:text-zinc-900">Terms</Link> & <Link href="/privacy" className="underline hover:text-zinc-900">Privacy</Link>.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
