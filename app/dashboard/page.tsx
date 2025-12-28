"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Textarea } from "@/components/ui/textarea"
import { createSession, destroySession, ArgusSession } from "@/argus/session"
import { Trash2, FileText, CheckCircle2, ShieldCheck, Network, PlayCircle, ScanSearch, Coins, AlertTriangle, XCircle, Download } from "lucide-react"
import { useGovernance, TOKEN_COSTS } from "@/argus/hooks/useGovernance"
import { KnowledgeGraph } from "@/components/KnowledgeGraph"
import { generateManuscriptPDF } from "@/argus/pdfGenerator"
import Link from "next/link"

export default function ArgusDashboard() {
    const [session, setSession] = useState<ArgusSession | null>(null)
    const [certificate, setCertificate] = useState<string | null>(null)
    const [paperInput, setPaperInput] = useState("")
    const [paperImages, setPaperImages] = useState<string[]>([])
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

    // De-coupled Governance Hooks
    const {
        logs,
        isProcessing,
        currentStep,
        tokenUsage,
        extractClaims,
        runAdversaryOnClaim
    } = useGovernance();

    const [userEmail, setUserEmail] = useState<string | null>(null)
    const supabase = createClient()

    // Initialize Session (Load from Storage or Create New)
    useEffect(() => {
        // 1. Check Auth (Redundant backup to middleware)
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserEmail(user.email || "Research Account")
            }
        }
        checkUser()

        // 2. Load Local Session
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem("argus_session");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Simple expiry check
                    if (new Date(parsed.expiresAt) > new Date()) {
                        setSession(parsed);
                        return;
                    }
                } catch (e) {
                    console.error("Session parse error", e);
                }
            }
            // If no valid session, create new
            if (!session) {
                setSession(createSession());
            }
        }
    }, [])

    // Persistence Effect: Save on every update
    useEffect(() => {
        if (session) {
            localStorage.setItem("argus_session", JSON.stringify(session));
        }
    }, [session]);

    const handleLogout = async () => {
        // 1. Destroy Local Crypto Session
        if (session) {
            const { certificate } = destroySession(session);
            localStorage.removeItem("argus_session"); // Clear storage
            setSession(null);
            setCertificate(certificate);
        }

        // 2. Sign Out of Supabase (End Auth Session)
        await supabase.auth.signOut()
    }

    const handleScan = () => {
        if (session && (paperInput || paperImages.length > 0)) {
            // Updated to pass images
            extractClaims(paperInput, paperImages, session, (newData: any) => setSession({ ...session, data: newData }));
        }
    }

    const handleAudit = (claimId: string) => {
        if (session) {
            runAdversaryOnClaim(claimId, session, (newData: any) => setSession({ ...session, data: newData }));
        }
    }

    // ------------------------------------------------------------------
    // RENDER: Deletion Certificate
    // ------------------------------------------------------------------
    if (certificate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in bg-white text-zinc-900 font-serif p-8">
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-2xl font-bold font-serif">Session Destroyed</h2>
                    <p className="text-zinc-500 italic">All ephemeral data has been zeroed out.</p>
                </div>
                <Card className="w-full max-w-lg bg-zinc-50 border-zinc-200 shadow-sm">
                    <CardHeader className="border-b border-zinc-200 pb-2 bg-white">
                        <CardTitle className="text-sm uppercase tracking-widest text-zinc-500">Deletion Certificate</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 whitespace-pre-wrap bg-white font-mono text-xs text-zinc-600">
                        {certificate}
                    </CardContent>
                </Card>
                <Button onClick={() => window.location.href = "/"} variant="outline">Return to Home</Button>
            </div>
        )
    }

    if (!session) return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-serif">Initializing Secure Session...</div>

    // ------------------------------------------------------------------
    // RENDER: Main Dashboard
    // ------------------------------------------------------------------
    return (
        <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-serif selection:bg-zinc-100 selection:text-zinc-900">
            {/* HEADER */}
            <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-200 bg-white sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                            <img src="/logo.jpg" alt="ARGUS" className="h-10 w-auto" />
                        </div>
                    </Link>
                    <span className="text-zinc-300 mx-2">/</span>
                    <div className="flex flex-col">
                        <span className="text-sm font-sans text-zinc-500 uppercase tracking-wider">Methodological Validator</span>
                        {userEmail && <span className="text-[10px] text-zinc-400 font-mono lowercase">{userEmail}</span>}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Token Meter */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full border border-zinc-200">
                        <Coins className="h-3 w-3 text-zinc-500" />
                        <span className="text-xs font-mono font-bold text-zinc-700">{tokenUsage} TOKENS</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => {
                        if (confirm("Reset Dashboard? This will clear current results and require new payment authorization.")) {
                            const newSession = createSession(); // Fresh ID
                            setSession(newSession); // Effect will save to storage
                            setPaperInput("");
                        }
                    }} className="text-zinc-600 hover:bg-zinc-100">
                        <ScanSearch className="h-4 w-4 mr-2" /> New Audit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" /> End Session
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateManuscriptPDF(session)} disabled={session.data.claims.length === 0} className="hidden md:flex">
                        <Download className="h-4 w-4 mr-2" /> Report
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                        const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `argus_session_${session.id}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }} className="text-zinc-500 hover:text-zinc-900" title="Backup Session Data">
                        <FileText className="h-4 w-4" />
                    </Button>
                    <Link href="/dashboard/settings">
                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-900">
                            <Coins className="h-4 w-4 hidden" /> {/* Dummy hidden icon to maintain height if needed, or just use size=icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12 space-y-8">

                {/* 1. INPUT & SCANNER */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-white border-zinc-200 shadow-sm relative overflow-hidden">
                            {isProcessing && currentStep === 'SCANNING' && (
                                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                                    <div className="flex flex-col items-center">
                                        <ScanSearch className="h-8 w-8 animate-pulse text-zinc-900 mb-2" />
                                        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Scanning Document...</span>
                                    </div>
                                </div>
                            )}
                            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Step 1: Ingestion
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <Textarea
                                    placeholder="Paste your abstract or hypothesis here..."
                                    className="min-h-[200px] font-serif text-base resize-none bg-white border-zinc-200 focus-visible:ring-zinc-400 placeholder:text-zinc-400"
                                    value={paperInput}
                                    onChange={(e) => setPaperInput(e.target.value)}
                                    disabled={session.data.claims.length > 0} // Lock input after scan
                                />

                                {/* MULTIMODAL INPUT */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="h-3 w-3" /> Attach Figures / Charts
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="block w-full text-xs text-zinc-500 font-mono file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                Array.from(e.target.files).forEach(file => {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const base64 = reader.result as string;
                                                        setPaperImages(prev => [...prev, base64]);
                                                    };
                                                    reader.readAsDataURL(file);
                                                });
                                            }
                                        }}
                                        disabled={session.data.claims.length > 0}
                                    />
                                    {paperImages.length > 0 && (
                                        <div className="flex gap-2 flex-wrap mt-2">
                                            {paperImages.map((img, i) => (
                                                <div key={i} className="relative w-16 h-16 border border-zinc-200 rounded overflow-hidden group">
                                                    <img src={img} className="w-full h-full object-cover" alt="Upload preview" />
                                                    <button
                                                        onClick={() => setPaperImages(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {session.data.claims.length === 0 ? (
                                    <>
                                        <Button
                                            className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
                                            onClick={() => {
                                                if (session.paymentStatus === 'UNPAID') {
                                                    setIsPaymentModalOpen(true);
                                                } else {
                                                    handleScan();
                                                }
                                            }}
                                            disabled={!paperInput || isProcessing}
                                        >
                                            <ScanSearch className="h-4 w-4 mr-2" />
                                            {session.paymentStatus === 'UNPAID' ? "Unlock Audit (₹1499)" : `Extract Claims (Compute Active)`}
                                        </Button>

                                        {/* PAYMENT MODAL */}
                                        {isPaymentModalOpen && (
                                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                                                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4 border border-zinc-200">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                                                            <ShieldCheck className="h-5 w-5" /> Secure Payment Gate
                                                        </h3>
                                                        <Button variant="ghost" size="icon" onClick={() => setIsPaymentModalOpen(false)}>
                                                            <XCircle className="h-5 w-5 text-zinc-400" />
                                                        </Button>
                                                    </div>

                                                    {/* Dynamic Pricing Logic */}
                                                    {(() => {
                                                        const storedKeys = JSON.parse(localStorage.getItem("model_keys") || "{}");
                                                        const hasKeys = storedKeys.gemini || storedKeys.chatgpt;
                                                        const price = hasKeys ? "₹799.00 / $7.99" : "₹2,499.00 / $24.99";
                                                        const label = hasKeys ? "Platform Fee (BYOK Active)" : "Full Adversarial Audit";

                                                        return (
                                                            <>
                                                                <div className={`p-4 rounded mb-6 border ${hasKeys ? "bg-green-50 border-green-200" : "bg-zinc-50 border-zinc-100"}`}>
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="text-sm font-sans text-zinc-600">{label}</span>
                                                                        <span className="font-bold text-lg">{price}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-xs text-zinc-500">
                                                                        <span>{hasKeys ? "Dev Tokens: Your Keys" : "Compute: Included (Multi-Pass)"}</span>
                                                                        <span>GST Incl.</span>
                                                                    </div>
                                                                    {hasKeys && (
                                                                        <div className="mt-2 text-xs text-green-700 font-bold flex items-center gap-1">
                                                                            <CheckCircle2 className="h-3 w-3" /> Custom API Keys Detected. Discount Applied.
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <Button
                                                                    className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 text-base font-bold"
                                                                    onClick={async () => {
                                                                        // 1. Load Razorpay SDK
                                                                        const loadRazorpay = () => {
                                                                            return new Promise((resolve) => {
                                                                                const script = document.createElement("script");
                                                                                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                                                                                script.onload = () => resolve(true);
                                                                                script.onerror = () => resolve(false);
                                                                                document.body.appendChild(script);
                                                                            });
                                                                        };

                                                                        const res = await loadRazorpay();
                                                                        if (!res) {
                                                                            alert("Razorpay SDK failed to load. Are you online?");
                                                                            return;
                                                                        }

                                                                        // 2. Create Order
                                                                        // Calculate price based on keys (799 or 2499)
                                                                        const amount = hasKeys ? 799 : 2499;

                                                                        const orderRes = await fetch("/api/create-order", {
                                                                            method: "POST",
                                                                            headers: { "Content-Type": "application/json" },
                                                                            body: JSON.stringify({ amount: amount * 100 }), // in paise
                                                                        });

                                                                        if (!orderRes.ok) {
                                                                            const err = await orderRes.json();
                                                                            alert("Error creating order: " + (err.error || err.message));
                                                                            return;
                                                                        }

                                                                        const orderData = await orderRes.json();

                                                                        // 3. Open Razorpay
                                                                        const options = {
                                                                            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public env var
                                                                            amount: orderData.amount,
                                                                            currency: orderData.currency,
                                                                            name: "ARGUS Governance",
                                                                            description: hasKeys ? "Platform Fee (BYOK)" : "Full Adversarial Audit",
                                                                            order_id: orderData.id,
                                                                            handler: async function (response: any) {
                                                                                // 4. Verify Payment
                                                                                const verifyRes = await fetch("/api/verify-payment", {
                                                                                    method: "POST",
                                                                                    headers: { "Content-Type": "application/json" },
                                                                                    body: JSON.stringify({
                                                                                        orderCreationId: orderData.id,
                                                                                        razorpayPaymentId: response.razorpay_payment_id,
                                                                                        razorpaySignature: response.razorpay_signature,
                                                                                    }),
                                                                                });

                                                                                const verifyData = await verifyRes.json();

                                                                                if (verifyData.message === "success") {
                                                                                    setSession({ ...session, paymentStatus: 'PAID' });
                                                                                    setIsPaymentModalOpen(false);
                                                                                    alert("Payment verified. Governance engine unlocked.");
                                                                                } else {
                                                                                    alert("Payment verification failed. Please contact support.");
                                                                                }
                                                                            },
                                                                            prefill: {
                                                                                name: "Researcher",
                                                                                email: "researcher@argus.protocol",
                                                                            },
                                                                            theme: {
                                                                                color: "#18181b", // zinc-900
                                                                            },
                                                                        };

                                                                        const paymentObject = new (window as any).Razorpay(options);
                                                                        paymentObject.open();
                                                                    }}
                                                                >
                                                                    Pay {price} (Secure)
                                                                </Button>
                                                            </>
                                                        )
                                                    })()}


                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-green-800 flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Input Locked. {session.data.claims.length} Claims Extracted.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Logs */}
                        <Card className="bg-zinc-900 text-zinc-100 border-zinc-800 shadow-md h-[400px] flex flex-col">
                            <CardHeader className="border-b border-zinc-800 pb-3 py-3">
                                <CardTitle className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                    System Kernel
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2">
                                {logs.length === 0 && <span className="text-zinc-600 italic">...</span>}
                                {logs.map((log, i) => (
                                    <div key={i} className="border-l-2 border-zinc-700 pl-2 py-0.5 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <span className={log.includes("ERROR") ? "text-red-400" : "text-zinc-300"}>
                                            {log}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* 2. CLAIM AUDIT LIST */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Knowledge Graph Always Visible */}
                        <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <Network className="h-4 w-4" />
                                    Topology
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <KnowledgeGraph data={session.data} />
                            </CardContent>
                        </Card>

                        {/* Actionable Claim List */}
                        <Card className="bg-white border-zinc-200 shadow-sm">
                            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    Step 2: Adversarial Audit
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="text-xs font-mono font-normal text-zinc-400 normal-case">
                                            Claims Detected: {session.data.claims.length} / 15
                                        </span>
                                        <div className="group relative">
                                            <AlertTriangle className="h-3 w-3 text-zinc-300 cursor-help" />
                                            <div className="absolute right-0 w-48 bg-zinc-800 text-zinc-100 text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                The 15 claim limit is a soft upper bound for V1 token governance. Complex theses may generate fewer, denser claims.
                                            </div>
                                        </div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {session.data.claims.length === 0 ? (
                                    <div className="text-center py-12 text-zinc-400 italic">
                                        Waiting for claims extraction...
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {session.data.claims.map((claim: any) => (
                                            <div key={claim.id} className="p-4 border border-zinc-200 rounded bg-white shadow-sm flex flex-col gap-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="font-mono">{claim.id}</Badge>
                                                            <Badge className={
                                                                claim.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                                    claim.status === 'REJECTED' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                                                        'bg-zinc-100 text-zinc-700 hover:bg-zinc-100'
                                                            }>
                                                                {claim.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm font-serif text-zinc-800">{claim.statement}</p>
                                                    </div>

                                                    {claim.status === 'PENDING' ? (
                                                        <Button
                                                            size="sm"
                                                            className="bg-zinc-900 text-white hover:bg-zinc-800 shrink-0"
                                                            onClick={() => handleAudit(claim.id)}
                                                            disabled={isProcessing}
                                                        >
                                                            {isProcessing && currentStep === `AUDITING_${claim.id}` ? (
                                                                <PlayCircle className="h-3 w-3 animate-spin mr-1" />
                                                            ) : (
                                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                            )}
                                                            Run Adversary ({TOKEN_COSTS.AUDIT_SINGLE} T)
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="ghost" disabled className="opacity-50">
                                                            Audit Complete
                                                        </Button>
                                                    )}
                                                </div>

                                                {/* Rejection Details */}
                                                {claim.status === 'REJECTED' && (
                                                    <div className="bg-red-50 p-3 rounded text-xs text-red-800 border border-red-100">
                                                        <span className="font-bold flex items-center gap-1 mb-1">
                                                            <AlertTriangle className="h-3 w-3" /> FATAL FLAW DETECTED
                                                        </span>
                                                        {claim.governanceLog.find((l: any) => l.role === 'THESIS_DESTROYER')?.content}
                                                    </div>
                                                )}
                                                {/* Acceptance Details */}
                                                {claim.status === 'ACCEPTED' && (
                                                    <div className="bg-green-50 p-3 rounded text-xs text-green-800 border border-green-100">
                                                        <span className="font-bold flex items-center gap-1 mb-1">
                                                            <CheckCircle2 className="h-3 w-3" /> VERIFIED ROBUST
                                                        </span>
                                                        Claim withstood adversarial optimization.
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
