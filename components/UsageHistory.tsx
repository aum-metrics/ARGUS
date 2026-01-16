/**
 * Author: Sambath Kumar Natarajan
 */
"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, CreditCard } from 'lucide-react';

export function UsageHistory() {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [credits, setCredits] = useState({ used: 0, bought: 0 });

    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Get user profile to check org membership
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('org_id')
                    .eq('id', user.id)
                    .single();

                // 1. Fetch Audit Logs (Usage)
                // For org users, show both personal AND org-wide logs
                let auditQuery = supabase
                    .from('audit_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (profile?.org_id) {
                    // Org user: show personal logs OR org logs
                    auditQuery = auditQuery.or(`user_id.eq.${user.id},org_id.eq.${profile.org_id}`);
                } else {
                    // Individual user: show only personal logs
                    auditQuery = auditQuery.eq('user_id', user.id);
                }

                const { data: auditData, error: logError } = await auditQuery;

                if (logError) console.error("Log Error", logError);
                setLogs(auditData || []);

                // 2. Fetch Transactions (Credits)
                const { data: txData, error: txError } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'success')
                    .order('created_at', { ascending: false });

                if (txError) console.error("Tx Error", txError);
                setTransactions(txData || []);

                // 3. Calc Totals
                // Assuming 1 Audit = 1 Credit for simplicity in V1
                // Real logic might differ
                const used = (auditData || []).filter(l => l.action === 'THESIS_CONSTRUCTOR').length;
                const bought = (txData || []).length; // Each tx is 1 unit for now? Or check amount

                setCredits({ used, bought });

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    function exportToCSV(logs: any[]) {
        if (logs.length === 0) {
            alert('No audit logs to export');
            return;
        }

        // Create CSV content
        const headers = ['Date', 'Action', 'Filename', 'Model', 'Input Chars', 'Output Chars'];
        const rows = logs.map(log => [
            new Date(log.created_at).toISOString(),
            log.action,
            log.metadata?.filename || '',
            log.metadata?.model || 'gemini-flash',
            log.metadata?.input_chars || '',
            log.metadata?.output_chars || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('
');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `argus_audit_history_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>;

    return (
        <div className="space-y-8">
            {/* SUMMARY CARD */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Total Audits Run</div>
                    <div className="text-2xl font-mono font-bold text-zinc-900">{credits.used}</div>
                </div>
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Purchased Credits</div>
                    <div className="text-2xl font-mono font-bold text-zinc-900">{credits.bought}</div>
                </div>
            </div>

            {/* AUDIT LOG TABLE */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Audit History
                    </h3>
                    <button
                        onClick={() => exportToCSV(logs)}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors flex items-center gap-2"
                    >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export CSV
                    </button>
                </div>
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 text-zinc-500 font-mono text-xs uppercase border-b border-zinc-200">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">Action</th>
                                <th className="p-3">Filename</th>
                                <th className="p-3 text-right">Model</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                                    <td className="p-3 text-zinc-600 font-mono text-xs">
                                        {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="p-3">
                                        <Badge variant="outline" className="text-[10px] font-mono">
                                            {log.action.replace('THESIS_', '')}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-zinc-900 font-medium">
                                        {log.metadata?.filename || "—"}
                                    </td>
                                    <td className="p-3 text-right text-zinc-400 text-xs font-mono">
                                        {log.metadata?.model || "gemini-flash"}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-zinc-400 italic">No usage history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* TRANSACTIONS TABLE */}
            <div>
                <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Payments
                </h3>
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 text-zinc-500 font-mono text-xs uppercase border-b border-zinc-200">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">ID</th>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-zinc-50 transition-colors">
                                    <td className="p-3 text-zinc-600 font-mono text-xs">
                                        {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="p-3 font-mono text-xs text-zinc-400">
                                        {tx.razorpay_payment_id || tx.id.substring(0, 8)}
                                    </td>
                                    <td className="p-3 text-right font-bold text-zinc-900">
                                        ₹{(tx.amount / 100).toFixed(2)}
                                    </td>
                                    <td className="p-3 text-right">
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                            {tx.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-zinc-400 italic">No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
