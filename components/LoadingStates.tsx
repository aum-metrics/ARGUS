"use client";

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
    submessage?: string;
}

export function LoadingState({ message = "Loading...", submessage }: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-zinc-400 animate-spin mb-4" />
            <p className="text-sm font-medium text-zinc-700">{message}</p>
            {submessage && (
                <p className="text-xs text-zinc-500 mt-1">{submessage}</p>
            )}
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="animate-pulse">
            <div className="h-32 bg-zinc-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
        </div>
    );
}

export function ProgressBar({ progress, message }: { progress: number; message?: string }) {
    return (
        <div className="w-full space-y-2">
            {message && (
                <p className="text-sm font-medium text-zinc-700">{message}</p>
            )}
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-zinc-900 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-xs text-zinc-500 text-right">{progress}%</p>
        </div>
    );
}

export function ThinkingIndicator({ message = "Analyzing..." }: { message?: string }) {
    return (
        <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm text-zinc-600">{message}</span>
        </div>
    );
}
