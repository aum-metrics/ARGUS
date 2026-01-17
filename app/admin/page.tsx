
"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Activity,
    Users,
    Building2,
    ShieldAlert,
    RefreshCcw,
    Server,
    Database,
    Lock
} from "lucide-react";

interface AdminData {
    metrics: {
        totalUsers: number;
        totalOrgs: number;
        totalAudits: number;
        systemHealth: string;
    };
    feed: any[];
    data: {
        organizations: any[];
        users: any[];
    };
}

export default function AdminDashboard() {
    const [data, setData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/stats");
            if (res.status === 403) {
                setError("Access Denied. Super Admin Role Required.");
                return;
            }
            if (!res.ok) throw new Error("API Failure");
            const json = await res.json();
            setData(json);
            setError("");
        } catch (e) {
            setError("Failed to load System Stats.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-serif">
                <div className="text-center space-y-4">
                    <ShieldAlert className="h-12 w-12 text-red-600 mx-auto" />
                    <h1 className="text-2xl font-bold text-zinc-900">Security Alert</h1>
                    <p className="text-zinc-600">{error}</p>
                    <Button onClick={() => window.location.href = '/dashboard'} variant="outline">Return to Safety</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
            {/* DARK MODE ADMIN HEADER */}
            <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white">
                        A
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white leading-none">System Command</h1>
                        <span className="text-xs text-zinc-500 font-mono">SUPER_ADMIN::ACTIVE</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                        <Activity className="h-3 w-3" /> LIVE
                    </span>
                    <Button size="sm" variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-zinc-400" onClick={fetchStats}>
                        <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync
                    </Button>
                </div>
            </header>

            <main className="container mx-auto p-6 md:p-8 space-y-8">

                {/* 1. METRICS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data?.metrics.totalUsers || '-'}</div>
                            <p className="text-xs text-zinc-500">Registered across all tiers</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Organizations</CardTitle>
                            <Building2 className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data?.metrics.totalOrgs || '-'}</div>
                            <p className="text-xs text-zinc-500">Labs & Departments</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Total Audits</CardTitle>
                            <Database className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data?.metrics.totalAudits || '-'}</div>
                            <p className="text-xs text-zinc-500">Claims Computed</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">System Status</CardTitle>
                            <Server className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-400">{data?.metrics.systemHealth || '...'}</div>
                            <p className="text-xs text-zinc-500">Latency: 42ms</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 2. DATA TABS */}
                <Tabs defaultValue="feed" className="w-full">
                    <TabsList className="bg-zinc-900 border border-zinc-800 text-zinc-400">
                        <TabsTrigger value="feed">Global Pulse</TabsTrigger>
                        <TabsTrigger value="orgs">Organizations</TabsTrigger>
                        <TabsTrigger value="users">User Directory</TabsTrigger>
                    </TabsList>

                    {/* FEED */}
                    <TabsContent value="feed" className="mt-4">
                        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
                            <CardHeader>
                                <CardTitle className="text-sm font-mono uppercase tracking-widest text-zinc-500">Live Audit Stream</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data?.feed.length === 0 && <div className="text-zinc-500 text-sm">No recent activity.</div>}
                                {data?.feed.map((log: any) => (
                                    <div key={log.id} className="flex flex-col md:flex-row gap-4 border-b border-zinc-800 pb-3 last:border-0 hover:bg-zinc-800/50 p-2 rounded transition-colors">
                                        <div className="min-w-[140px] text-xs font-mono text-zinc-500">
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs font-mono border-zinc-700 text-zinc-300">
                                                    {log.action}
                                                </Badge>
                                                <span className="text-xs text-zinc-500 font-mono">{log.user_id.slice(0, 8)}...</span>
                                            </div>
                                            <div className="text-sm text-zinc-300">
                                                Target: <span className="font-bold text-indigo-400">{log.metadata?.model || 'Unknown Model'}</span>
                                                <span className="mx-2 text-zinc-600">|</span>
                                                IO: {log.metadata?.input_chars} / {log.metadata?.output_chars} chars
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ORGS */}
                    <TabsContent value="orgs" className="mt-4">
                        <div className="rounded-md border border-zinc-800 bg-zinc-900">
                            <table className="w-full text-sm text-left text-zinc-400">
                                <thead className="bg-zinc-950 text-zinc-500 font-mono uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Tier</th>
                                        <th className="px-4 py-3">Credits</th>
                                        <th className="px-4 py-3">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {data?.data.organizations.map((org: any) => (
                                        <tr key={org.id} className="hover:bg-zinc-800/50">
                                            <td className="px-4 py-3 font-medium text-zinc-200">{org.name}</td>
                                            <td className="px-4 py-3">
                                                <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">{org.subscription_tier || 'N/A'}</Badge>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{org.credits_balance}</td>
                                            <td className="px-4 py-3 text-xs">{new Date(org.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    {/* USERS */}
                    <TabsContent value="users" className="mt-4">
                        <div className="rounded-md border border-zinc-800 bg-zinc-900">
                            <table className="w-full text-sm text-left text-zinc-400">
                                <thead className="bg-zinc-950 text-zinc-500 font-mono uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Full Name</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Org ID</th>
                                        <th className="px-4 py-3">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {data?.data.users.map((u: any) => (
                                        <tr key={u.id} className="hover:bg-zinc-800/50">
                                            <td className="px-4 py-3 font-medium text-zinc-200">
                                                {u.full_name || 'Anonymous'}
                                                <div className="text-[10px] text-zinc-600 font-mono">{u.email}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {u.role === 'SUPER_ADMIN' ? (
                                                    <span className="text-purple-400 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> ROOT</span>
                                                ) : u.role}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">{u.org_id ? u.org_id.slice(0, 8) + '...' : '-'}</td>
                                            <td className="px-4 py-3 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
