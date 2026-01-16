"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Coins, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface CreditCounterProps {
    userId?: string;
}

export function CreditCounter({ userId }: CreditCounterProps) {
    const [total, setTotal] = useState(0);
    const [used, setUsed] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchCredits();
            // Refresh every 10 seconds
            const interval = setInterval(fetchCredits, 10000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    async function fetchCredits() {
        if (!userId) return;

        const supabase = createClient();

        // Get individual credits
        const { count: individualCredits } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'success');

        // Get profile for org
        const { data: profile } = await supabase
            .from('profiles')
            .select('org_id')
            .eq('id', userId)
            .single();

        // Get org credits TOTAL (not balance)
        let orgCreditsTotal = 0;
        if (profile?.org_id) {
            const { data: org } = await supabase
                .from('organizations')
                .select('credits_total')
                .eq('id', profile.org_id)
                .single();

            if (org) orgCreditsTotal = org.credits_total || 0;
        }

        // Get usage
        const { count: usage } = await supabase
            .from('audit_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('action', 'THESIS_CONSTRUCTOR');

        const totalCredits = (individualCredits || 0) + orgCreditsTotal;
        setTotal(totalCredits);
        setUsed(usage || 0);
        setLoading(false);
    }

    const remaining = total - used;
    const percentage = total > 0 ? (remaining / total) * 100 : 0;

    // Color coding
    const getColor = () => {
        if (remaining > 5) return 'text-green-600 bg-green-50 border-green-200';
        if (remaining > 2) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 animate-pulse">
                <Coins className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-400">Loading...</span>
            </div>
        );
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(true)}
                className={`flex items-center gap-2 ${getColor()} hover:opacity-80 transition-opacity`}
            >
                <Coins className="h-4 w-4" />
                <span className="font-bold">{remaining}</span>
                <span className="text-xs opacity-70">/ {total}</span>
            </Button>

            <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Credit Usage</DialogTitle>
                        <DialogDescription>
                            Track your audit credit consumption
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-600">Credits Remaining</span>
                                <span className="font-bold">{remaining} / {total}</span>
                            </div>
                            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${percentage > 50 ? 'bg-green-500' :
                                            percentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 text-green-600 mb-1">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-xs font-medium">Total</span>
                                </div>
                                <div className="text-2xl font-bold text-green-700">{total}</div>
                            </div>

                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <div className="flex items-center gap-2 text-red-600 mb-1">
                                    <TrendingDown className="h-4 w-4" />
                                    <span className="text-xs font-medium">Used</span>
                                </div>
                                <div className="text-2xl font-bold text-red-700">{used}</div>
                            </div>
                        </div>

                        {/* Warning */}
                        {remaining < 3 && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ Low credits! Contact your administrator to top up.
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
