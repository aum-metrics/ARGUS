import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Loader2, Cpu, ShieldAlert, BookOpen, Scale } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface GovernanceLogViewerProps {
    logs: string[];
    isProcessing: boolean;
    currentStep: string;
}

export function GovernanceLogViewer({ logs, isProcessing, currentStep }: GovernanceLogViewerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [dots, setDots] = useState('');

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    // Blinking dots animation
    useEffect(() => {
        if (!isProcessing) return;
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, [isProcessing]);

    if (logs.length === 0 && !isProcessing) return null;

    return (
        <Card className="bg-black border-zinc-800 shadow-2xl mt-8 animate-in slide-in-from-bottom-4 overflow-hidden relative group">
            {/* CRT Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat opacity-20"></div>

            <CardHeader className="border-b border-zinc-900 py-3 bg-zinc-950/90 relative z-30">
                <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-green-500 animate-pulse" />
                    ARGUS_OS KERNEL V1.4
                    {isProcessing && (
                        <span className="ml-auto inline-flex items-center gap-2 text-green-400">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                            PROCESS: {currentStep}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative z-10 font-mono text-xs">
                {/* Vintage Screen Glow */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] z-20"></div>

                <div
                    ref={scrollRef}
                    className="h-72 overflow-y-auto p-4 space-y-1.5 bg-black/90 text-zinc-300 font-mono"
                >
                    {logs.map((log, i) => {
                        // Role Detection & Coloring
                        let roleColor = 'text-zinc-400';
                        let Icon = Cpu;
                        let prefix = '';

                        if (log.includes("[SYSTEM]")) { roleColor = 'text-blue-400'; Icon = Terminal; }
                        else if (log.includes("[ERROR]")) { roleColor = 'text-red-500 font-bold'; Icon = ShieldAlert; }
                        else if (log.includes("THESIS_DESTROYER")) { roleColor = 'text-red-400'; Icon = ShieldAlert; prefix = 'ADVERSARY'; }
                        else if (log.includes("METHODOLOGY")) { roleColor = 'text-cyan-400'; Icon = Scale; prefix = 'METHOD'; }
                        else if (log.includes("LITERATURE")) { roleColor = 'text-yellow-400'; Icon = BookOpen; prefix = 'LIBRARY'; }
                        else if (log.includes("[SWARM]")) { roleColor = 'text-purple-400'; Icon = Cpu; }

                        return (
                            <div key={i} className="flex items-start gap-3 p-0.5 animate-in fade-in duration-300">
                                <span className="text-zinc-700 select-none w-8 text-right font-light text-[10px] pt-0.5 opacity-50">
                                    {(i + 1).toString().padStart(3, '0')}
                                </span>
                                <div className={`flex-1 break-words leading-relaxed ${roleColor}`}>
                                    {prefix && <span className="opacity-80 font-bold mr-2 text-[10px] border border-current px-1 rounded-sm">{prefix}</span>}
                                    <span className="font-medium tracking-wide">{log.replace(/\[.*?\]/g, '').trim()}</span>
                                </div>
                            </div>
                        );
                    })}

                    {isProcessing && (
                        <div className="flex items-center gap-2 text-green-500 pl-11 pt-2 animate-pulse">
                            <span className="w-2 h-4 bg-green-500 block animate-[cursor-blink_1s_steps(2)_infinite]"></span>
                            <span className="tracking-widest">AWAITING_INPUT{dots}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
