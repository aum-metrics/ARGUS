"use client";

import React, { useState } from 'react';
import { Bot, ShieldCheck, AlertTriangle, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PlaygroundPage() {
    const [input, setInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<null | { score: number, issues: string[] }>(null);

    const handleAnalyze = () => {
        if (!input.trim()) return;
        setIsAnalyzing(true);

        // Simulate Swarm Analysis
        setTimeout(() => {
            setIsAnalyzing(false);
            setResult({
                score: 82,
                issues: [
                    "Circular Reasoning detected in paragraph 2.",
                    "Unsubstantiated claim regarding 'market volatility' efficiency.",
                    "Correlation implies causation error in final conclusion."
                ]
            });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-200">
                            <img src="/logo.jpg" alt="ARGUS Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-zinc-900">ARGUS-Thesis</span>
                    </div>
                    <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                        Researcher Login
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Public Research Playground
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-zinc-900">
                        Will Your Thesis <span className="text-indigo-600">Survive Defense?</span>
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
                        Paste your abstract or core argument below. Our 6-agent swarm will stress-test your logic for free.
                    </p>
                </div>

                {/* Input Area */}
                <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden transition-all duration-500">
                    {!result ? (
                        <div className="p-1">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Paste your abstract here (min 100 words)..."
                                className="w-full h-64 p-8 text-lg resize-none focus:outline-none placeholder:text-zinc-300"
                            />
                            <div className="bg-zinc-50 p-4 border-t border-zinc-100 flex justify-between items-center">
                                <span className="text-xs text-zinc-400 uppercase tracking-widest font-semibold pl-4">
                                    Zero-Retention Protocol Active
                                </span>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!input.trim() || isAnalyzing}
                                    className={`
                                        group relative px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold transition-all
                                        ${!input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 hover:bg-indigo-600'}
                                    `}
                                >
                                    {isAnalyzing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></span>
                                            Swarm Analyzing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Run Logic Scan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Results View
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 p-12 text-center">
                            <div className="mb-8">
                                <div className="inline-block relative">
                                    <svg className="w-40 h-40 transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-zinc-100" />
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-indigo-600" strokeDasharray={440} strokeDashoffset={440 - (440 * result.score / 100)} />
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                        <span className="text-5xl font-black text-zinc-900">{result.score}</span>
                                        <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Score</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-zinc-900 mb-2">Defensibility Assessment: <span className="text-indigo-600">Strong</span></h3>
                            <p className="text-zinc-500 mb-8">We found {result.issues.length} potential logical vulnerabilities in your argument.</p>

                            <div className="max-w-lg mx-auto bg-red-50 border border-red-100 rounded-lg p-6 text-left mb-10">
                                <h4 className="flex items-center gap-2 text-red-800 font-bold mb-4">
                                    <AlertTriangle className="w-5 h-5" /> Critical Vulnerabilities
                                </h4>
                                <ul className="space-y-3">
                                    {result.issues.map((issue, i) => (
                                        <li key={i} className="flex items-start gap-2 text-red-700 text-sm">
                                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                                            {issue}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <Link href="/login" className="w-full max-w-sm py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                                    <Lock className="w-5 h-5" /> Unlock Full Report
                                </Link>
                                <p className="text-sm text-zinc-400">
                                    Create a free account to see the full 20-page evidence breakdown.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Social Proof */}
                <div className="mt-16 text-center">
                    <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-6">Calibrated for Researchers at</p>
                    <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="text-xl font-serif font-bold text-zinc-600">IITs</div>
                        <div className="text-xl font-serif font-bold text-zinc-600">IIMs</div>
                        <div className="text-xl font-serif font-bold text-zinc-600">Stanford</div>
                        <div className="text-xl font-serif font-bold text-zinc-600">MIT</div>
                        <div className="text-xl font-serif font-bold text-zinc-600">Oxford</div>
                        <div className="text-xl font-serif font-bold text-zinc-600">Harvard</div>
                        <div className="text-xl font-serif font-bold text-zinc-600">IISc</div>
                    </div>
                </div>

            </main>
        </div>
    );
}
