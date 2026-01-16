/**
 * Author: Sambath Kumar Natarajan
 */
"use client";

import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AuditEvent {
    type: 'REJECTED' | 'ACCEPTED';
    field: string;
    reason: string;
    score: number;
}

/**
 * Live Ticker - Production Version
 * Fetches real anonymized audit data from metadata_logs table
 */
export function LiveTicker() {
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLiveEvents();
        // Refresh every 30 seconds
        const interval = setInterval(fetchLiveEvents, 30000);
        return () => clearInterval(interval);
    }, []);

    async function fetchLiveEvents() {
        try {
            const response = await fetch('/api/public-stats');
            if (response.ok) {
                const data = await response.json();
                setEvents(data.events || []);
            }
        } catch (error) {
            console.error('[LiveTicker] Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    }

    // Fallback to empty state if no data
    if (!loading && events.length === 0) {
        return null;
    }

    // Display events (triple for smooth scrolling)
    const displayEvents = events.length > 0 ? [...events, ...events, ...events] : [];

    return (
        <div className="w-full bg-zinc-900 border-y border-zinc-800 py-3 overflow-hidden flex items-center relative z-20">
            {/* Gradient Masks for smooth fade */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-zinc-900 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-zinc-900 to-transparent z-10"></div>

            {/* Label */}
            <div className="absolute left-8 z-20 bg-red-900/40 text-red-400 text-[10px] font-bold px-2 py-1 rounded border border-red-900/50 uppercase tracking-widest backdrop-blur-sm">
                Live Audit Feed
            </div>

            {/* Scrolling Track */}
            <div className="flex animate-scroll whitespace-nowrap pl-40 hover:pause">
                {displayEvents.map((event, i) => (
                    <div key={i} className="flex items-center gap-3 mx-6 text-sm font-mono">
                        <span className="text-zinc-500">[{event.field}]</span>
                        {event.type === 'REJECTED' ? (
                            <>
                                <span className="text-red-500 font-bold flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> REJECTED
                                </span>
                                <span className="text-zinc-400 opacity-80">{event.reason}</span>
                                <span className="text-zinc-600 ml-1">(Score: {event.score})</span>
                            </>
                        ) : (
                            <>
                                <span className="text-green-500 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> VERIFIED
                                </span>
                                <span className="text-zinc-400 opacity-80 border-b border-zinc-800">Ready for Submission</span>
                                <span className="text-green-900/40 ml-1">(Score: {event.score})</span>
                            </>
                        )}
                        <span className="text-zinc-800 mx-2">•</span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                .hover\:pause:hover {
                    animation-play-state: paused;
                }
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
