/**
 * Password Reset Page
 * Handles Supabase password recovery links
 */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function ResetPasswordPage() {
    const router = useRouter()
    const supabase = createClient()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [hasToken, setHasToken] = useState(false)

    useEffect(() => {
        // Supabase sends recovery links in different formats:
        // Format 1: #access_token=xxx&type=recovery (full params)
        // Format 2: #token_hash (just the hash)

        const hash = window.location.hash.substring(1); // Remove #

        if (!hash) {
            setError("Invalid or expired password reset link");
            return;
        }

        // Try to parse as URL parameters first
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        const tokenHash = hashParams.get('token_hash');

        // Check if we have a valid recovery token
        if ((accessToken && type === 'recovery') || tokenHash || hash.length > 30) {
            // We have a token, now verify it with Supabase
            verifyAndSetSession(hash);
        } else {
            setError("Invalid or expired password reset link");
        }
    }, []);

    const verifyAndSetSession = async (hash: string) => {
        try {
            // Try to verify the token by exchanging it for a session
            // Supabase will handle the token validation
            const { error: sessionError } = await supabase.auth.verifyOtp({
                token_hash: hash,
                type: 'recovery'
            });

            if (sessionError) {
                // If OTP verification fails, try getting session from URL
                const { error: sessionFromUrlError } = await supabase.auth.getSession();

                if (sessionFromUrlError) {
                    console.error("Session verification failed:", sessionError, sessionFromUrlError);
                    setError("Invalid or expired password reset link. Please request a new one.");
                    return;
                }
            }

            // Token is valid
            setHasToken(true);
        } catch (err: any) {
            console.error("Token verification error:", err);
            setError("Failed to verify reset link. Please request a new one.");
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validation
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            // Update the password using the current session
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                throw updateError;
            }

            setSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err: any) {
            console.error("Password reset error:", err);
            setError(err.message || "Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <CardTitle>Password Reset Successful!</CardTitle>
                        <CardDescription>
                            Your password has been updated. Redirecting to login...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (!hasToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <CardTitle>Invalid Reset Link</CardTitle>
                        <CardDescription>
                            {error || "This password reset link is invalid or has expired."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => router.push('/login')}
                            className="w-full"
                        >
                            Back to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Reset Your Password</CardTitle>
                    <CardDescription>
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-red-50 border border-red-200">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                minLength={8}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500">
                                Must be at least 8 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                minLength={8}
                                disabled={isLoading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting Password...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
