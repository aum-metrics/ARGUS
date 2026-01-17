/**
 * Author: Sambath Kumar Natarajan
 * 
 * Individual User Registration Page
 * Clean, unified registration flow for individual researchers
 */
"use client"

// Force dynamic rendering to avoid build-time Supabase errors
export const dynamic = 'force-dynamic'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, CheckCircle2, Building2 } from "lucide-react"
import { getURL } from "@/lib/utils"

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [view, setView] = useState<"form" | "verify">("form")

    // Form State
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            // 1. Create Supabase auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${getURL()}auth/callback`,
                    data: {
                        full_name: fullName,
                    }
                },
            })

            if (authError) throw authError

            // 2. Create profile entry
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        email: email,
                        full_name: fullName,
                        role: 'INDIVIDUAL',
                        is_trial_used: false
                    })

                if (profileError) {
                    console.error('Profile creation error:', profileError)
                    // Don't fail registration if profile creation fails
                }
            }

            setView("verify")
        } catch (err: any) {
            setError(err.message || "Registration failed. Please try again.")
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
                    {view === "form" ? (
                        <>
                            <CardTitle className="text-2xl font-bold text-center font-serif text-zinc-900">Create Account</CardTitle>
                            <CardDescription className="text-center font-sans text-zinc-500">
                                Join ARGUS-Thesis as an Individual Researcher
                            </CardDescription>
                        </>
                    ) : (
                        <>
                            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                                <CheckCircle2 className="h-6 w-6 text-green-600" /> Check Your Email
                            </CardTitle>
                            <CardDescription className="text-center font-sans text-zinc-500">
                                Verification link sent to {email}
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

                    {view === "form" ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="Dr. Jane Smith"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="border-zinc-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="researcher@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="border-zinc-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="border-zinc-300"
                                />
                                <p className="text-xs text-zinc-500">Must be at least 6 characters.</p>
                            </div>

                            <Button type="submit" className="w-full bg-zinc-900 text-white hover:bg-zinc-800" disabled={isLoading}>
                                Create Account
                            </Button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-zinc-500">Or</span>
                                </div>
                            </div>

                            <Link href="/register/organization">
                                <Button type="button" variant="outline" className="w-full border-zinc-300 hover:bg-zinc-50">
                                    <Building2 className="h-4 w-4 mr-2" />
                                    Register as Organization
                                </Button>
                            </Link>
                        </form>
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
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ email })
                                                    });
                                                    alert("DEV BYPASS: Account confirmed! Redirecting to login...");
                                                    router.push('/login');
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
                                onClick={() => setView("form")}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Registration
                            </Button>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
                    <p className="text-sm text-center text-zinc-600">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
                            Sign In
                        </Link>
                    </p>
                    <p className="text-xs text-center text-zinc-500 font-sans">
                        Protected by ARGUS-Thesis Governance. <br />
                        <Link href="/terms" className="underline hover:text-zinc-900">Terms</Link> & <Link href="/privacy" className="underline hover:text-zinc-900">Privacy</Link>.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
