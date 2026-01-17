import React, { useEffect, useRef } from 'react';
import { ScrollText, Terminal, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface GovernanceLogViewerProps {
    logs: string[];
    isProcessing: boolean;
    currentStep: string;
}

export function GovernanceLogViewer({ logs, isProcessing, currentStep }: GovernanceLogViewerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    if (logs.length === 0 && !isProcessing) return null;

    return (
        <Card className="bg-zinc-950 border-zinc-800 shadow-2xl mt-8 animate-in slide-in-from-bottom-4">
            <CardHeader className="border-b border-zinc-800 py-3 bg-zinc-900/50">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-green-500" />
                    System Kernel Ops
                    {isProcessing && (
                        <span className="ml-auto inline-flex items-center gap-2 text-green-400 animate-pulse">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Running: {currentStep}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div
                    ref={scrollRef}
                    className="h-64 overflow-y-auto p-4 space-y-2 font-mono text-xs bg-black/40"
                >
                    {logs.map((log, i) => {
                        const isSystem = log.startsWith("[SYSTEM]");
                        const isError = log.includes("[ERROR]");
                        const isSwarm = log.startsWith("[SWARM]") || log.startsWith("[ORCHESTRATOR]");

                        return (
                            <div key={i} className="flex items-start gap-3 border-l-2 border-transparent hover:bg-white/5 p-1 rounded transition-colors group">
                                <span className="text-zinc-600 select-none w-6 text-right opacity-50">{i + 1}</span>
                                <span className={`break-words flex-1 ${isError ? 'text-red-400 font-bold border-l-red-500 pl-2' :
                                        isSystem ? 'text-blue-400' :
                                            isSwarm ? 'text-purple-400' :
                                                'text-zinc-300'
                                    }`}>
                                    {log}
                                </span>
                            </div>
                        );
                    })}
                    {isProcessing && (
                        <div className="flex items-center gap-2 text-zinc-500 animate-pulse pl-9 pt-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Processing stream...</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
