/**
 * Author: Sambath Kumar Natarajan
 */
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, CreditCard, Download, Shield, User, History } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { UsageHistory } from "@/components/UsageHistory"

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
                    <TabsTrigger value="usage" className="flex items-center gap-2">
                        <History className="h-3 w-3" /> Audit Log
                    </TabsTrigger>
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
                                    <Input placeholder="Researcher Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Academic Institution</Label>
                                    <Input placeholder="Institution Name" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input placeholder="email@institution.edu" disabled className="bg-zinc-100" />
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
                                        <p className="font-bold text-sm">No saved card</p>
                                        <p className="text-xs text-zinc-500">--/--</p>
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
                                                <td colSpan={5} className="px-4 py-8 text-center text-zinc-400 italic">No transaction history found.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* USAGE TAB */}
                <TabsContent value="usage" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Audit</CardTitle>
                            <CardDescription>Transparent ledger of all your interactions with the ARGUS system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UsageHistory />
                        </CardContent>
                    </Card>
                </TabsContent>


            </Tabs>
        </div>
    )
}
