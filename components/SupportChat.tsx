/**
 * Author: Sambath Kumar Natarajan
 */
"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, ChevronRight, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ----------------------------------------------------------------------
// SAFE KNOWLEDGE BASE
// ----------------------------------------------------------------------
// Strictly hardcoded to prevent prompt injection or logic leaks.
// Returns ready-made answers based on scenario IDs.

type ScenarioId = 'ROOT' | 'PRICING' | 'PRIVACY' | 'REFUNDS' | 'TECH_SUPPORT' | 'ENTERPRISE' | 'REPORT_HELP';

interface BotMessage {
    id: string;
    text: React.ReactNode;
    options?: { label: string; nextId: ScenarioId }[];
}

const SCENARIOS: Record<ScenarioId, BotMessage> = {
    ROOT: {
        id: 'ROOT',
        text: "Hello! I'm the Argus Support Assistant. I can help with non-technical inquiries. What would you like to know about?",
        options: [
            { label: "Pricing & Plans", nextId: 'PRICING' },
            { label: "How to Read Report", nextId: 'REPORT_HELP' },
            { label: "Data Privacy", nextId: 'PRIVACY' },
            { label: "Refunds", nextId: 'REFUNDS' },
            { label: "Enterprise / Labs", nextId: 'ENTERPRISE' },
        ]
    },
    PRICING: {
        id: 'PRICING',
        text: (
            <div className="space-y-2">
                <p>We offer two simple tiers:</p>
                <ul className="list-disc pl-4 text-sm">
                    <li><strong>$25 Standard:</strong> Full audit compute included.</li>
                    <li><strong>$9 BYOK:</strong> You use your own API keys.</li>
                </ul>
                <p>No subscriptions. Pay per audit.</p>
            </div>
        ),
        options: [
            { label: "Back to Menu", nextId: 'ROOT' }
        ]
    },
    PRIVACY: {
        id: 'PRIVACY',
        text: (
            <div className="space-y-2">
                <p><strong>Security is our First Law.</strong></p>
                <p>Your manuscript data is processed in ephemeral RAM only. Once the session ends, the memory is cryptographically zeroed.</p>
                <p>We do not train models on your data.</p>
            </div>
        ),
        options: [
            { label: "Back to Menu", nextId: 'ROOT' }
        ]
    },
    REFUNDS: {
        id: 'REFUNDS',
        text: "If the system failed to generate a report due to a technical error, we issue full refunds. Please email support@argus.ac with your Session ID.",
        options: [
            { label: "Back to Menu", nextId: 'ROOT' }
        ]
    },
    ENTERPRISE: {
        id: 'ENTERPRISE',
        text: "For University Departments and Labs, we offer bulk licensing with centralized dashboards. Visit the Enterprise page or contact sales@argus.ac.",
        options: [
            { label: "Back to Menu", nextId: 'ROOT' }
        ]
    },
    REPORT_HELP: {
        id: 'REPORT_HELP',
        text: (
            <div className="space-y-2">
                <p><strong>How to Read the Report:</strong></p>
                <ul className="list-disc pl-4 text-sm space-y-1">
                    <li><strong>Executive Summary:</strong> High-level check of structure and coherency.</li>
                    <li><strong>Claims Analysis:</strong> We extract key claims and cross-reference them with AI knowledge.</li>
                    <li><strong>Visual Integrity:</strong> We check if figures match their captions.</li>
                </ul>
                <p className="text-xs mt-2 text-zinc-500">Note: 'Unverified' means the AI could not firmly confirm or deny.</p>
            </div>
        ),
        options: [
            { label: "Back to Menu", nextId: 'ROOT' }
        ]
    },
    TECH_SUPPORT: {
        id: 'TECH_SUPPORT',
        text: "For bug reports, please check the console logs or email us. I cannot diagnose technical issues directly to maintain system security.",
        options: [
            { label: "Back to Menu", nextId: 'ROOT' }
        ]
    }
};

interface Message {
    id: number;
    role: 'bot' | 'user';
    content: React.ReactNode;
    options?: { label: string; nextId: ScenarioId }[];
}

export function SupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, role: 'bot', content: SCENARIOS.ROOT.text, options: SCENARIOS.ROOT.options }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleOptionClick = (option: { label: string; nextId: ScenarioId }) => {
        // 1. Add User Selection Message
        const userMsg: Message = {
            id: Date.now(),
            role: 'user',
            content: option.label
        };

        // 2. Add Bot Response
        const responseFrame = SCENARIOS[option.nextId];
        const botMsg: Message = {
            id: Date.now() + 1,
            role: 'bot',
            content: responseFrame.text,
            options: responseFrame.options
        };

        setMessages(prev => [...prev, userMsg, botMsg]);
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-zinc-900 shadow-xl hover:bg-zinc-800 hover:scale-105 transition-all z-50 flex items-center justify-center"
            >
                <MessageSquare className="h-6 w-6 text-white" />
            </Button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[350px] md:w-[400px] bg-white rounded-2xl shadow-2xl border border-zinc-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
            {/* Header */}
            <div className="bg-zinc-900 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <div className="bg-green-500 h-2 w-2 rounded-full animate-pulse"></div>
                    <span className="font-bold font-serif">Argus Support</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-700 transition-colors text-white"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 h-[500px] max-h-[60vh] overflow-y-auto p-4 space-y-4 bg-zinc-50 scroll-smooth">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                        <div className={cn(
                            "rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed",
                            msg.role === 'user'
                                ? "bg-zinc-900 text-white rounded-tr-none"
                                : "bg-white text-zinc-800 border border-zinc-200 rounded-tl-none"
                        )}>
                            {msg.content}
                        </div>

                        {/* Options (Only for latest bot message) */}
                        {msg.role === 'bot' && msg.options && msg === messages[messages.length - 1] && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {msg.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionClick(opt)}
                                        className="text-xs bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 px-3 py-2 rounded-full transition-colors font-medium flex items-center gap-1"
                                    >
                                        {opt.label} <ChevronRight className="h-3 w-3" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer (Read Only) */}
            <div className="p-3 bg-zinc-100 text-center border-t border-zinc-200">
                <p className="text-[10px] text-zinc-400 font-sans uppercase tracking-wider">
                    Automated Support • Security Focused
                </p>
            </div>
        </div>
    );
}
