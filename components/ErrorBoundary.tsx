/**
 * Author: Sambath Kumar Natarajan
 */
"use client";

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-zinc-200 p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-zinc-900 mb-2">
                            Something went wrong
                        </h2>

                        <p className="text-zinc-600 mb-6">
                            We encountered an unexpected error. Don't worry, your data is safe.
                        </p>

                        <div className="mb-6 p-4 bg-zinc-100 rounded-lg text-left overflow-auto max-h-48">
                            <p className="text-xs font-mono text-red-600 font-bold mb-1">Error Details:</p>
                            <p className="text-xs font-mono text-zinc-700 break-all">
                                {this.state.error?.message || "Unknown error"}
                            </p>
                            {this.state.error?.stack && (
                                <pre className="mt-2 text-[10px] text-zinc-500 whitespace-pre-wrap">
                                    {this.state.error.stack.split('\n').slice(0, 3).join('\n')}
                                </pre>
                            )}
                        </div>

                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full bg-zinc-900 hover:bg-zinc-800"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reload Page
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                            className="w-full mt-2"
                        >
                            Go to Homepage
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
