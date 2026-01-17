/**
 * Author: Sambath Kumar Natarajan
 */
"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, ChevronRight, HelpCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ----------------------------------------------------------------------
// DYNAMIC KNOWLEDGE BASE (SERVER-SIDE CONFIG)
// ----------------------------------------------------------------------

type ScenarioId = 'ROOT' | 'QA_MODE' | 'PRICING' | 'PRIVACY' | 'REFUNDS' | 'ENTERPRISE';

interface BotMessage {
    id: string;
    text: React.ReactNode;
    options?: { label: string; nextId: ScenarioId }[];
}

interface Message {
    id: number;
    role: 'bot' | 'user';
    content: React.ReactNode;
    options?: { label: string; nextId: ScenarioId }[];
}

export function SupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isQaMode, setIsQaMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Dynamic Config State
    const [scenarios, setScenarios] = useState<Record<string, BotMessage> | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Configuration on Mount
    useEffect(() => {
        async function loadConfig() {
            try {
                const res = await fetch('/api/support/config');
                const data = await res.json();
                setScenarios(data);
                // Initialize with ROOT message once loaded
                if (data && data.ROOT) {
                    setMessages([{
                        id: 1,
                        role: 'bot',
                        content: data.ROOT.text,
                        options: data.ROOT.options
                    }]);
                }
            } catch (e) {
                console.error("Failed to load generic support config", e);
                // Fallback hardcoded if API fails? For V1 Product, we should probably fail gracefully or show offline msg.
                setMessages([{
                    id: 1,
                    role: 'bot',
                    content: "System Offline. Please email help@argus-thesis.com",
                    options: []
                }]);
            }
        }
        loadConfig();
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isLoading]);

    const handleOptionClick = (option: { label: string; nextId: ScenarioId }) => {
        if (!scenarios) return;

        // 1. Add User Selection Message
        const userMsg: Message = {
            id: Date.now(),
            role: 'user',
            content: option.label
        };
        setMessages(prev => [...prev, userMsg]);

        // 2. Handle QA Mode transition
        if (option.nextId === 'QA_MODE') {
            setIsQaMode(true);
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'bot',
                    content: "I've switched to Q&A Mode. Using the updated User Guide, I can answer questions about the Audit Types, Dashboard, or Interpreting Reports. What's your question?",
                    options: [] // No options, waiting for text
                }]);
            }, 500);
            return;
        }

        // 3. Handle Static Response from Dynamic Config
        // Type assertion needed because JSON keys are strings
        const responseFrame = scenarios[option.nextId as string];

        if (responseFrame) {
            setTimeout(() => {
                const botMsg: Message = {
                    id: Date.now() + 1,
                    role: 'bot',
                    content: responseFrame.text,
                    options: responseFrame.options
                };
                setMessages(prev => [...prev, botMsg]);
            }, 300);
        } else {
            // Fallback for missing ID
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                content: "I'm sorry, that topic isn't available right now."
            }]);
        }
    };

    const handleSendQuery = async () => {
        if (!inputValue.trim() || isLoading) return;

        const query = inputValue.trim();
        setInputValue("");

        // Add user message
        const userMsg: Message = { id: Date.now(), role: 'user', content: query };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: query,
                    role: 'SUPPORT_AGENT'
                })
            });

            if (!response.ok) throw new Error("Support service busy");
            const data = await response.json();

            let content = data.content || "I apologize, I couldn't process that.";

            // Unpack JSON content if the model returns JSON string
            try {
                const parsed = JSON.parse(content);
                content = parsed.answer || parsed.message || content;
            } catch (e) {
                // Was raw text
            }

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                content: content
            }]);

        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                content: "I'm having trouble connecting to the Knowledge Base. Please try again or email help@argus-thesis.com."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSendQuery();
    }

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-zinc-900 shadow-xl hover:bg-zinc-800 hover:scale-105 transition-all z-50 flex items-center justify-center"
            >
                <HelpCircle className="h-6 w-6 text-white" />
            </Button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[350px] md:w-[400px] bg-white rounded-2xl shadow-2xl border border-zinc-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200 font-sans">
            {/* Header */}
            <div className="bg-zinc-900 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <div className="bg-green-500 h-2 w-2 rounded-full animate-pulse"></div>
                    <span className="font-bold font-serif">ARGUS-Thesis</span>
                </div>
                <div className="flex items-center gap-2">
                    {isQaMode && (
                        <button
                            onClick={() => {
                                setIsQaMode(false);
                                if (scenarios && scenarios.ROOT) {
                                    setMessages(prev => [...prev, { id: Date.now(), role: 'bot', content: scenarios.ROOT.text, options: scenarios.ROOT.options }]);
                                }
                            }}
                            className="text-[10px] bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700 transition"
                        >
                            Reset
                        </button>
                    )}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-700 transition-colors text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 h-[450px] max-h-[55vh] overflow-y-auto p-4 space-y-4 bg-zinc-50 scroll-smooth">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                        <div className={cn(
                            "rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed whitespace-pre-wrap",
                            msg.role === 'user'
                                ? "bg-zinc-900 text-white rounded-tr-none"
                                : "bg-white text-zinc-800 border border-zinc-200 rounded-tl-none"
                        )}>
                            {msg.content}
                        </div>

                        {/* Options (Only for latest bot message if NOT loading and has options) */}
                        {msg.role === 'bot' && msg.options && msg === messages[messages.length - 1] && !isLoading && (
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

                {isLoading && (
                    <div className="mr-auto flex items-center gap-2 text-zinc-400 text-xs pl-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Consulting User Manual...</span>
                    </div>
                )}
            </div>

            {/* Input Area (Only in QA Mode) */}
            {isQaMode ? (
                <div className="p-3 bg-white border-t border-zinc-200 flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about audits, claims, or reports..."
                        className="flex-1 text-sm bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleSendQuery}
                        disabled={!inputValue.trim() || isLoading}
                        size="icon"
                        className="bg-zinc-900 hover:bg-zinc-800 shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="p-3 bg-zinc-100 text-center border-t border-zinc-200">
                    <p className="text-[10px] text-zinc-400 font-sans uppercase tracking-wider">
                        Select an option above to begin
                    </p>
                </div>
            )}
        </div>
    );
}
