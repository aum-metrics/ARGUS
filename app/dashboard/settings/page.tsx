/**
 * Author: Sambath Kumar Natarajan
 */
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Shield, History, Building2, Users, Plus, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"


export default function SettingsPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [org, setOrg] = useState<any>(null)
    const [members, setMembers] = useState<any[]>([])

    // Org Form State
    const [newOrgName, setNewOrgName] = useState("")
    const [inviteEmail, setInviteEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setUser(user)

            // Fetch Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            setProfile(profile)

            if (profile?.org_id) {
                // Fetch Org
                const { data: org } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', profile.org_id)
                    .single()
                setOrg(org)

                // Fetch Members (If Admin or just to view)
                const { data: members } = await supabase
                    .from('profiles')
                    .select('email, role, id')
                    .eq('org_id', profile.org_id)
                setMembers(members || [])
            }
            setLoading(false)
        }
        loadData()
    }, [])

    const handleCreateOrg = async () => {
        if (!newOrgName) return alert("Please enter an organization name")
        setIsSubmitting(true)
        try {
            const res = await fetch('/api/org/create', {
                method: 'POST',
                body: JSON.stringify({ orgName: newOrgName, userId: user.id })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            alert("Organization Created! You are the Admin.")
            window.location.reload()
        } catch (e: any) {
            alert(e.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInvite = async () => {
        if (!inviteEmail) return alert("Please enter an email")
        setIsSubmitting(true)
        try {
            const res = await fetch('/api/org/invite', {
                method: 'POST',
                body: JSON.stringify({ email: inviteEmail, orgId: org.id, inviterId: user.id })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            if (data.created) {
                alert(`New Account Auto-Provisioned!\n\nEmail: ${data.user.email}\nTemporary Password: ${data.tempPassword}\n\nPlease share these credentials with the user safely. They can change their password after logging in.`)
            } else {
                alert("Existing User successfully added to the Organization!")
            }

            setInviteEmail("")
            // Refresh members
            const { data: members } = await supabase
                .from('profiles')
                .select('email, role, id')
                .eq('org_id', org.id)
            setMembers(members || [])
        } catch (e: any) {
            alert(e.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleLeaveOrg = async () => {
        if (!confirm("Are you sure you want to leave? You will lose access to shared credits.")) return
        const { error } = await supabase
            .from('profiles')
            .update({ org_id: null, role: 'USER' })
            .eq('id', user.id)

        if (error) alert("Error leaving org")
        else window.location.reload()
    }

    if (loading) return <div className="p-12 text-center">Loading Settings...</div>

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
                <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="organization" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> Organization
                    </TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
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
                                    <Input defaultValue={user?.user_metadata?.full_name} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Badge variant="outline">{profile?.role || 'INDIVIDUAL'}</Badge>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input defaultValue={user?.email} disabled className="bg-zinc-100" />
                            </div>
                        </CardContent>
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

                {/* ORGANIZATION TAB */}
                <TabsContent value="organization" className="space-y-6">
                    {!org ? (
                        <Card className="border-dashed border-2">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                                    <Building2 className="h-6 w-6 text-zinc-600" />
                                </div>
                                <CardTitle>Create an Organization</CardTitle>
                                <CardDescription>
                                    Collaborate with your team, share credits, and manage manuscripts centrally.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="max-w-md mx-auto space-y-4 pb-8">
                                <div className="space-y-2">
                                    <Label>Organization Name</Label>
                                    <Input
                                        placeholder="e.g. Stanford AI Lab"
                                        value={newOrgName}
                                        onChange={(e) => setNewOrgName(e.target.value)}
                                    />
                                </div>
                                <Button className="w-full" onClick={handleCreateOrg} disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Organization & Become Admin"}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl">{org.name}</CardTitle>
                                        <CardDescription>Organization ID: {org.id}</CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold font-mono">{org.credits_balance}</div>
                                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Enterprise Credits</div>
                                        <Badge variant="outline" className="mt-2 text-[10px] border-zinc-200">Subscription Active</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-900 rounded-lg text-sm border border-amber-200">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>You are a <strong>{profile?.role}</strong> of this organization.</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" /> Team Members
                                        </CardTitle>
                                        <span className="text-sm text-zinc-500">{members.length} Active</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Invite Form */}
                                    {profile?.role === 'ORG_ADMIN' && (
                                        <div className="flex gap-2 items-end border-b border-zinc-100 pb-6">
                                            <div className="flex-1 space-y-2">
                                                <Label>Add Member by Email</Label>
                                                <Input
                                                    placeholder="colleague@university.edu"
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                />
                                                <p className="text-[10px] text-zinc-400">User must already have an individual account.</p>
                                            </div>
                                            <Button onClick={handleInvite} disabled={isSubmitting}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                {isSubmitting ? "Adding..." : "Add Member"}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Members List */}
                                    <div className="space-y-4">
                                        {members.map((m) => (
                                            <div key={m.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">
                                                        {m.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">{m.email}</div>
                                                        <div className="text-xs text-zinc-500">{m.role}</div>
                                                    </div>
                                                </div>
                                                {m.role === 'ORG_ADMIN' ? (
                                                    <Badge variant="secondary">Admin</Badge>
                                                ) : profile?.role === 'ORG_ADMIN' && (
                                                    <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={async () => {
                                                        if (!confirm(`Promote ${m.email} to Admin? They will be able to spend credits.`)) return;
                                                        await supabase.from('profiles').update({ role: 'ORG_ADMIN' }).eq('id', m.id);
                                                        window.location.reload();
                                                    }}>
                                                        Promote
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-between border-t border-zinc-100 pt-4">
                                    <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLeaveOrg}>
                                        Leave Organization
                                    </Button>
                                </CardFooter>
                            </Card>
                        </>
                    )}
                </TabsContent>

                {/* BILLING TAB */}
                <TabsContent value="billing" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Credits & Usage</CardTitle>
                            <CardDescription>To buy credits, use the Dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Billing is managed via Razorpay on the main Dashboard.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* USAGE TAB */}
                <TabsContent value="usage">
                    {/* Reuse existing component or placeholder */}
                    <p className="text-sm text-zinc-500 p-4">Audit logs are displayed here.</p>
                </TabsContent>
            </Tabs>
        </div>
    )
}
