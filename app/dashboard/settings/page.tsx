"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, CreditCard, Download, Shield, User } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function SettingsPage() {
    const [keys, setKeys] = useState({
        chatgpt: "",
        perplexity: "",
        gemini: "",
    })

    const handleSave = () => {
        // Mock save
        localStorage.setItem("model_keys", JSON.stringify(keys))
        alert("Configuration saved.")
    }

    return (
        <div className="container max-w-4xl py-6 space-y-8 font-serif text-zinc-900 bg-white min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-serif tracking-tight">Account Settings</h1>
                    <p className="text-zinc-500 font-sans">Manage your credentials, billing, and security preferences.</p>
                </div>
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="general">General & Profile</TabsTrigger>
                    <TabsTrigger value="billing">Billing & Usage</TabsTrigger>
                    <TabsTrigger value="api">Model Configuration</TabsTrigger>
                </TabsList>

                {/* GENERAL TAB */}
                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details and academic affiliation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input defaultValue="Dr. Arjun Mehta" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Academic Institution</Label>
                                    <Input defaultValue="Indian Institute of Science (IISc)" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input defaultValue="arjun.mehta@iisc.ac.in" disabled className="bg-zinc-100" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => alert("Profile updated.")}>Save Changes</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-red-600 flex items-center gap-2">
                                <Shield className="h-4 w-4" /> Data Sovereignty
                            </CardTitle>
                            <CardDescription>Manage your data retention preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm">Ephemeral Storage Mode</h4>
                                    <p className="text-xs text-zinc-500">Data is wiped from RAM immediately after session termination.</p>
                                </div>
                                <Badge variant="outline" className="border-green-600 text-green-700 bg-green-50">Active</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* BILLING TAB */}
                <TabsContent value="billing" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Token Usage & Payment Method</CardTitle>
                            <CardDescription>Manage your "Pay-as-you-go" settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-zinc-200 rounded-full flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-zinc-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Visa ending in 4242</p>
                                        <p className="text-xs text-zinc-500">Expires 12/28</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">Edit</Button>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-bold text-sm">Billing History</h4>
                                <div className="border rounded-md">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-zinc-50 text-zinc-500 font-sans text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Invoice ID</th>
                                                <th className="px-4 py-3">Paper Title</th>
                                                <th className="px-4 py-3 text-right">Amount</th>
                                                <th className="px-4 py-3 text-center">Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            <tr>
                                                <td className="px-4 py-3">Dec 28, 2025</td>
                                                <td className="px-4 py-3 font-mono text-xs">INV-001-9X2</td>
                                                <td className="px-4 py-3 truncate max-w-[200px]">Analysis of RLHF in LLMs...</td>
                                                <td className="px-4 py-3 text-right font-bold">₹499.00</td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6"><Download className="h-3 w-3" /></Button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3">Dec 20, 2025</td>
                                                <td className="px-4 py-3 font-mono text-xs">INV-001-8B4</td>
                                                <td className="px-4 py-3 truncate max-w-[200px]">Transformer Complexity...</td>
                                                <td className="px-4 py-3 text-right font-bold">₹499.00</td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6"><Download className="h-3 w-3" /></Button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* API SETTINGS TAB */}
                <TabsContent value="api" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bring Your Own Key (BYOK)</CardTitle>
                            <CardDescription>
                                Optional: Provide your own API keys for higher rate limits and privacy control.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <b>Note:</b> Keys are stored in your browser's local storage only.
                            </div>
                            <div className="space-y-2">
                                <Label>Google Gemini API Key</Label>
                                <Input
                                    type="password"
                                    placeholder="AIza..."
                                    value={keys.gemini}
                                    onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>OpenAI API Key</Label>
                                <Input
                                    type="password"
                                    placeholder="sk-..."
                                    value={keys.chatgpt}
                                    onChange={(e) => setKeys({ ...keys, chatgpt: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave}>Save Configuration</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
