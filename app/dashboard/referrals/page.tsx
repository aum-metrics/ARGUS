"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Gift, Copy, CheckCircle2, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ReferralsPage() {
    const [referralCode, setReferralCode] = useState("");
    const [referralLink, setReferralLink] = useState("");
    const [stats, setStats] = useState({ pending: 0, completed: 0, rewarded: 0, totalEarned: 0 });
    const [referrals, setReferrals] = useState<any[]>([]);
    const [newRefereeEmail, setNewRefereeEmail] = useState("");
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        loadReferralData();
    }, []);

    const loadReferralData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get referral code
        const { data: profile } = await supabase
            .from('profiles')
            .select('referral_code')
            .eq('id', user.id)
            .single();

        if (profile?.referral_code) {
            setReferralCode(profile.referral_code);
            setReferralLink(`${window.location.origin}/login?ref=${profile.referral_code}`);
        }

        // Get referral stats
        const { data: statsData } = await supabase.rpc('get_referral_stats', { user_id: user.id });
        if (statsData && statsData.length > 0) {
            const s = statsData[0];
            setStats({
                pending: parseInt(s.pending_count) || 0,
                completed: parseInt(s.completed_count) || 0,
                rewarded: parseInt(s.rewarded_count) || 0,
                totalEarned: parseInt(s.total_earned_credits) || 0
            });
        }

        // Get referral list
        const { data: referralsList } = await supabase
            .from('referrals')
            .select('*')
            .eq('referrer_id', user.id)
            .order('created_at', { ascending: false });

        setReferrals(referralsList || []);
    };

    const handleSendInvite = async () => {
        if (!newRefereeEmail) return;
        setLoading(true);

        try {
            const res = await fetch('/api/referral/send-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refereeEmail: newRefereeEmail })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Referral invite created! Share the link below.');
                setNewRefereeEmail("");
                loadReferralData();
            } else {
                alert(data.error || 'Failed to send invite');
            }
        } catch (e) {
            alert('Network error');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-serif">
            {/* Header */}
            <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-200 bg-white">
                <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
                    ← Back to Dashboard
                </Link>
                <h1 className="text-lg font-bold">Referral Program</h1>
                <div className="w-24"></div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white border-zinc-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-zinc-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">Signed Up</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-zinc-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">Rewarded</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.rewarded}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-zinc-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">Credits Earned</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-600">{stats.totalEarned}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Referral Link */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gift className="h-5 w-5 text-indigo-600" />
                            Your Referral Link
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                value={referralLink}
                                readOnly
                                className="font-mono text-sm bg-white"
                            />
                            <Button onClick={copyToClipboard} variant="outline">
                                {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-zinc-600">
                            Share this link with colleagues. When they sign up and complete their first paid audit, you'll earn 1 free audit credit!
                        </p>
                    </CardContent>
                </Card>

                {/* Send Invite */}
                <Card className="bg-white border-zinc-200">
                    <CardHeader>
                        <CardTitle className="text-sm">Send Invite</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                placeholder="colleague@university.edu"
                                value={newRefereeEmail}
                                onChange={(e) => setNewRefereeEmail(e.target.value)}
                            />
                            <Button onClick={handleSendInvite} disabled={loading || !newRefereeEmail}>
                                {loading ? 'Sending...' : 'Invite'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Referral List */}
                <Card className="bg-white border-zinc-200">
                    <CardHeader>
                        <CardTitle className="text-sm">Your Referrals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {referrals.length === 0 ? (
                            <p className="text-sm text-zinc-500 text-center py-8">No referrals yet. Start inviting colleagues!</p>
                        ) : (
                            <div className="space-y-2">
                                {referrals.map((ref) => (
                                    <div key={ref.id} className="flex justify-between items-center p-3 border border-zinc-100 rounded">
                                        <div>
                                            <div className="text-sm font-medium">{ref.referee_email}</div>
                                            <div className="text-xs text-zinc-500">
                                                {new Date(ref.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div>
                                            {ref.status === 'pending' && <span className="text-xs text-zinc-500">Pending</span>}
                                            {ref.status === 'completed' && <span className="text-xs text-blue-600">Signed Up</span>}
                                            {ref.status === 'rewarded' && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Rewarded</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
