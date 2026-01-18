"use client";

import React from 'react';
import { ShieldCheck, AlertTriangle, Scale, Network } from 'lucide-react';

export default function FlyersPage() {
    return (
        <div className="min-h-screen bg-zinc-100 p-8 space-y-16">

            {/* DESIGN 1: THE CHALLENGE (Red/Black) */}
            <div id="flyer-fear" className="w-[794px] h-[1123px] bg-zinc-900 mx-auto relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl p-16 border-8 border-zinc-900">
                {/* Background Texture */}
                <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: "radial-gradient(#3f3f46 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>

                <div className="z-10 relative space-y-8 flex flex-col items-center">
                    {/* LOGO INTEGRATION */}
                    <div className="w-32 h-32 rounded-lg overflow-hidden border-4 border-white/10 mb-8 mx-auto">
                        <img src="/logo.jpg" alt="ARGUS Logo" className="w-full h-full object-contain" />
                    </div>

                    <h1 className="text-8xl font-black text-white leading-none tracking-tighter">
                        REJECTED?
                    </h1>

                    <div className="h-1 w-32 bg-red-600 mx-auto"></div>

                    <p className="text-3xl font-serif text-zinc-400 max-w-2xl leading-snug">
                        <span className="text-white font-bold">Research is hard.</span><br />
                        Ensure your <span className="text-red-500">logic is sound</span> before submission.
                    </p>

                    <div className="pt-12">
                        <p className="text-zinc-500 uppercase tracking-widest text-sm mb-4">Don't let oversight delay your tenure.</p>
                        <div className="text-4xl font-bold text-white bg-zinc-800 py-4 px-12 rounded-full border border-zinc-700">
                            ARGUS-Thesis
                        </div>
                        <p className="text-zinc-600 mt-4 font-mono text-sm">Adversarial Pre-Flight Check.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-12 w-full flex justify-between px-16 text-zinc-700 text-xs tracking-[0.2em]">
                    <span>SYSTEM V2.0 // ADVERSARIAL GOVERNANCE</span>
                    <span className="font-mono lowercase tracking-normal">help@argus-thesis.com</span>
                </div>
            </div>

            {/* DESIGN 2: THE SOLUTION (Clean/White) */}
            <div id="flyer-solution" className="w-[794px] h-[1123px] bg-white mx-auto relative overflow-hidden flex flex-col p-16 shadow-2xl border border-zinc-200">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-8 mb-16">
                    <div className="flex items-center gap-4">
                        {/* LOGO INTEGRATION */}
                        <div className="h-16 w-16 rounded-lg overflow-hidden border border-zinc-200">
                            <img src="/logo.jpg" alt="ARGUS Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">ARGUS-Thesis</h2>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest">Validation System</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-zinc-900">CERTIFICATE OF DEFENSIBILITY</p>
                        <p className="text-xs text-zinc-400 font-mono">ENGINEERING-GRADE VALIDATION</p>
                        <p className="text-[10px] text-zinc-300 font-mono mt-1 lowercase">help@argus-thesis.com</p>
                        <p className="text-[10px] text-indigo-600 font-bold mt-2">www.ARGUS-Thesis.com</p>
                    </div>
                </div>

                <div className="absolute bottom-8 right-8">
                    <div className="flex flex-col items-end gap-2">
                        <div className="w-24 h-24 bg-white p-2 rounded-lg shadow-xl">
                            <img src="/qr-code.png" alt="QR Code" className="w-full h-full object-contain" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">www.ARGUS-Thesis.com</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-12">
                    <h1 className="text-7xl font-serif font-medium text-zinc-900 leading-[0.9]">
                        Don't Just Submit.<br />
                        <span className="italic text-zinc-400">Verify.</span>
                    </h1>

                    <div className="space-y-6 max-w-lg">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-1"><span className="text-green-700 font-bold">1</span></div>
                            <p className="text-lg text-zinc-600"><strong>Paste Text.</strong> Our AI analyzes your thesis for logical consistency using Google Gemini 2.5.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-1"><span className="text-green-700 font-bold">2</span></div>
                            <p className="text-lg text-zinc-600"><strong>Review Report.</strong> Detailed feedback on clarity, robustness, and novelty positioning.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-1"><span className="text-green-700 font-bold">3</span></div>
                            <p className="text-lg text-zinc-600"><strong>Improve.</strong> Strengthen your claims before peer review.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-50 p-8 rounded-xl border border-zinc-100 mt-16">
                    <p className="text-center font-serif text-xl italic text-zinc-800">
                        "A tool to check your thinking, not just your grammar."
                    </p>
                </div>
            </div>

            {/* DESIGN 3: THE INSTITUTION (Blue/Academic) */}
            <div id="flyer-institution" className="w-[794px] h-[1123px] bg-slate-900 mx-auto relative overflow-hidden flex flex-col p-16 shadow-2xl border-t-8 border-indigo-500">
                <div className="absolute top-0 right-0 p-16 opacity-10">
                    <Network className="w-96 h-96 text-indigo-300" />
                </div>

                <div className="z-10 relative">
                    <div className="inline-block px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-bold uppercase tracking-widest mb-8 border border-indigo-500/30">
                        For Lab Directors
                    </div>

                    <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
                        Standardize Your<br />Lab's <span className="text-indigo-400">Intellectual Output.</span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-xl leading-relaxed mb-16">
                        You generate data at world-class speed. <br />
                        Establish a baseline for logical robustness.
                    </p>

                    <div className="grid grid-cols-2 gap-8 mb-16">
                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 backdrop-blur-sm">
                            <h3 className="text-indigo-400 font-bold text-lg mb-2">AI-Powered</h3>
                            <p className="text-slate-400 text-sm">Powered by Google Gemini 2.5. We never store your manuscript in our database.</p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 backdrop-blur-sm">
                            <h3 className="text-indigo-400 font-bold text-lg mb-2">Audit Trails</h3>
                            <p className="text-slate-400 text-sm">Track the "Defensibility Score" across your research cohort.</p>
                        </div>
                    </div>

                    <div className="border-l-4 border-indigo-500 pl-8 py-2">
                        <p className="text-white text-2xl font-serif">
                            "Engineering reliability for academic claims."
                        </p>
                        <p className="text-slate-500 mt-2">
                            — The ARGUS-Thesis Standard
                        </p>
                    </div>
                </div>

                {/* Footer Area with QR Code avoiding overlap */}
                <div className="mt-auto pt-16 border-t border-slate-800 flex justify-between items-end relative">
                    <div className="text-slate-500 font-mono text-sm">
                        help@argus-thesis.com
                    </div>

                    <div className="flex items-center gap-8">
                        {/* QR Code Block */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-16 h-16 bg-white p-1 rounded-lg shadow-xl">
                                <img src="/qr-code.png" alt="QR Code" className="w-full h-full object-contain" />
                            </div>
                            <p className="text-indigo-400 text-[10px] font-mono">argus-thesis.com</p>
                        </div>

                        {/* Logo Block */}
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg overflow-hidden opacity-80">
                                <img src="/logo.jpg" alt="ARGUS Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-4xl font-bold text-white tracking-tighter">
                                ARGUS-Thesis
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div >
    );
}
