/**
 * Author: Sambath Kumar Natarajan
 */
"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Textarea } from "@/components/ui/textarea"
import { createSession, destroySession, ArgusSession } from "@/argus/session"
import { Trash2, FileText, CheckCircle2, ShieldCheck, Network, PlayCircle, ScanSearch, Coins, AlertTriangle, XCircle, Download, Gift, Maximize2 } from "lucide-react"
import { useGovernance, TOKEN_COSTS } from "@/argus/hooks/useGovernance"
import { KnowledgeGraph } from "@/components/KnowledgeGraph"
import { generateManuscriptPDF } from "@/argus/pdfGenerator"
import { generateCertificate } from "@/lib/certificate-generator"
import { CreditCounter } from "@/components/CreditCounter"
import { OnboardingFlow } from "@/components/OnboardingFlow"
import { LoadingState, ThinkingIndicator, ProgressBar } from "@/components/LoadingStates"
import Link from "next/link"
import { saveAs } from "file-saver"

export default function ArgusDashboard() {
    const [session, setSession] = useState<ArgusSession | null>(null)
    const [certificate, setCertificate] = useState<string | null>(null)
    const [paperInput, setPaperInput] = useState("")
    const [paperImages, setPaperImages] = useState<string[]>([])
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isTrialEligible, setIsTrialEligible] = useState(false) // New State
    const [isTrialProcessing, setIsTrialProcessing] = useState(false) // New State
    const [availableCredits, setAvailableCredits] = useState(0) // Total credits available
    const [usedCredits, setUsedCredits] = useState(0) // Credits already used

    // De-coupled Governance Hooks
    const {
        logs,
        isProcessing,
        setIsProcessing, // NOW AVAILABLE
        currentStep,
        setCurrentStep, // NOW AVAILABLE
        tokenUsage,
        extractClaims,
        runAdversaryOnClaim
    } = useGovernance();

    const [isPreviewOpen, setIsPreviewOpen] = useState(false); // Modal for Review
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // State for Lightbox
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [showOnboarding, setShowOnboarding] = useState(false); // Onboarding state
    const supabase = createClient()

    // [NEW] PERSISTENCE SYNC HELPER
    const syncSession = async (newSession: ArgusSession) => {
        // Optimistic Update
        setSession(newSession);

        // Background Save (Debounced in real app, atomic here for safety)
        if (userId) { // Ensure user is logged in
            const { error } = await supabase.from('sessions').upsert({
                id: newSession.id,
                user_id: userId,
                data: newSession,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

            if (error) console.error("Sync Failed", error);
        }
    };
    useEffect(() => {
        // 1. Check Auth (Redundant backup to middleware)
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                setUserEmail(user.email || "Research Account")

                // 1b. BACKEND ACCESS CHECK (Consumable Credits)
                // Credits: Number of successful payments (Individual)
                const { count: individualCredits } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('status', 'success')
                    .not('metadata->>target', 'eq', 'ORG'); // Exclude Org purchases

                // Usage: Total number of 'THESIS_CONSTRUCTOR' (Extraction) events.
                const { count: usage } = await supabase
                    .from('audit_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('action', 'THESIS_CONSTRUCTOR');

                // 2. CHECK ORGANIZATION & TRIAL STATUS
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_trial_used, org_id')
                    .eq('id', user.id)
                    .single();

                let orgCredits = 0;
                if (profile?.org_id) {
                    const { data: org } = await supabase.from('organizations').select('credits_balance').eq('id', profile.org_id).single();
                    if (org) orgCredits = org.credits_balance || 0;
                }

                // Total Available = Individual + Org
                const totalCredits = (individualCredits || 0) + orgCredits;

                // If profile exists and trial NOT used, they are eligible
                if (profile && !profile.is_trial_used) {
                    setIsTrialEligible(true);
                }

                const hasRemainingCredits = totalCredits > (usage || 0);

                // Update credits display
                setAvailableCredits(totalCredits);
                setUsedCredits(usage || 0);

                // [NEW] PERSISTENCE LOGIC
                // 1. Try to load *ACTIVE* session from DB first
                const { data: dbSessions } = await supabase
                    .from('sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(1);

                if (dbSessions && dbSessions.length > 0) {
                    // RESUME EXISTING SESSION
                    console.log("Resuming session:", dbSessions[0].id);
                    const resumedSession = dbSessions[0].data as ArgusSession;

                    // [FIX] If user has credits, mark session as PAID and UPDATE in database
                    if (hasRemainingCredits && resumedSession.paymentStatus !== 'PAID') {
                        resumedSession.paymentStatus = 'PAID';

                        // Update session in database
                        await supabase
                            .from('sessions')
                            .update({ data: resumedSession, updated_at: new Date().toISOString() })
                            .eq('id', dbSessions[0].id);

                        console.log('[CREDIT FIX] Updated session paymentStatus to PAID');
                    }

                    setSession(resumedSession);
                } else if (hasRemainingCredits) {
                    // CREATE NEW SESSION (and save it immediately)
                    const newKey = createSession();
                    const newSession = { ...newKey, paymentStatus: 'PAID' as const };

                    // SAVE TO DB
                    await supabase.from('sessions').insert({
                        id: newSession.id,
                        user_id: user.id,
                        org_id: profile?.org_id,
                        data: newSession
                    });

                    setSession(newSession);
                }
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
            extractClaims(paperInput, paperImages, session, (newData: any) => syncSession({ ...session, data: newData }));
        }
    }

    const handleAudit = (claimId: string) => {
        if (session) {
            runAdversaryOnClaim(claimId, session, (newData: any) => syncSession({ ...session, data: newData }));
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
                            <img src="/logo.jpg?v=2" alt="ARGUS-Thesis" className="h-10 w-auto" />
                        </div>
                    </Link>
                    <span className="text-zinc-300 mx-2">/</span>
                    <div className="flex flex-col">
                        <span className="text-sm font-sans text-zinc-500 uppercase tracking-wider">Methodological Validator</span>
                        {userEmail && <span className="text-xs text-zinc-400 font-mono lowercase">{userEmail}</span>}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Credit Counter - NEW COMPONENT */}
                    {userId && <CreditCounter userId={userId} />}

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
                        saveAs(blob, `argus_session_${session.id}.json`);
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
                                {/* [NEW] METADATA CONTEXT FORM */}
                                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Institutional Context</h3>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono">PRO FEATURE</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase text-zinc-500 font-bold">Candidate / Author</label>
                                            <input
                                                className="w-full text-sm p-2 border border-zinc-200 rounded font-mono focus:outline-none focus:border-zinc-400"
                                                placeholder="e.g. Jane Doe"
                                                value={session.data.context?.candidateName || ''}
                                                onChange={(e) => setSession({
                                                    ...session,
                                                    data: { ...session.data, context: { ...session.data.context, candidateName: e.target.value } }
                                                })}
                                                disabled={session.data.claims.length > 0}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase text-zinc-500 font-bold">Degree / Dept</label>
                                            <input
                                                className="w-full text-sm p-2 border border-zinc-200 rounded font-mono focus:outline-none focus:border-zinc-400"
                                                placeholder="e.g. PhD Computer Science"
                                                value={session.data.context?.degree || ''}
                                                onChange={(e) => setSession({
                                                    ...session,
                                                    data: { ...session.data, context: { ...session.data.context, degree: e.target.value } }
                                                })}
                                                disabled={session.data.claims.length > 0}
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-xs uppercase text-zinc-500 font-bold">Target Journal</label>
                                            <input
                                                className="w-full text-sm p-2 border border-zinc-200 rounded font-mono focus:outline-none focus:border-zinc-400"
                                                placeholder="e.g. Nature, NeurIPS, CVPR"
                                                value={session.data.context?.targetJournal || ''}
                                                onChange={(e) => syncSession({
                                                    ...session,
                                                    data: { ...session.data, context: { ...session.data.context, targetJournal: e.target.value } }
                                                })}
                                                disabled={session.data.claims.length > 0}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* PDF PARSER */}
                                    <div className="p-4 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 hover:bg-zinc-50 transition-colors text-center">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            id="pdf-upload"
                                            disabled={session.data.claims.length > 0 || isProcessing}
                                            onChange={async (e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];

                                                    // 1. Client Size Validation
                                                    if (file.size > 10 * 1024 * 1024) { // 10MB Limit for PDFs
                                                        alert("PDF is too large. Max 10MB.");
                                                        return;
                                                    }

                                                    setIsProcessing(true);
                                                    setCurrentStep('PARSING_PDF');

                                                    try {
                                                        const formData = new FormData();
                                                        formData.append('file', file);

                                                        const res = await fetch('/api/parse-pdf', {
                                                            method: 'POST',
                                                            body: formData
                                                        });

                                                        if (!res.ok) {
                                                            const errData = await res.json().catch(() => ({}));
                                                            throw new Error(errData.error || `Upload failed with status ${res.status}`);
                                                        }

                                                        const data = await res.json();
                                                        setPaperInput(data.text); // Auto-fill textarea

                                                        // [NEW] Visual Essence
                                                        if (data.images && data.images.length > 0) {
                                                            setPaperImages(data.images);
                                                        }

                                                        // [NEW] Capture Filename for Audit
                                                        syncSession({
                                                            ...session!, // Session definitely exists here if we are uploading
                                                            data: {
                                                                ...session!.data,
                                                                context: {
                                                                    ...session!.data.context,
                                                                    originalFilename: file.name
                                                                }
                                                            }
                                                        });

                                                        alert(`PDF Parsed Successfully! extracted ${data.text.length} characters.`);

                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Failed to parse PDF. Please copy-paste text manually.");
                                                    } finally {
                                                        setIsProcessing(false);
                                                        setCurrentStep('IDLE');
                                                        // Reset input
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                            {isProcessing && currentStep === 'PARSING_PDF' ? (
                                                <>
                                                    <ScanSearch className="h-8 w-8 text-zinc-400 animate-pulse" />
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">Constructing V-Thesis...</span>
                                                        <span className="text-[10px] text-zinc-400 font-mono mt-1 anim-fade-in">Scanning for visual evidence (10 pages)</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="h-8 w-8 text-zinc-300" />
                                                    <span className="text-sm font-bold text-zinc-600">Upload Manuscript (PDF)</span>
                                                    <span className="text-xs text-zinc-500 font-mono">Max 10MB. Text-selectable PDFs only.</span>
                                                </>
                                            )}
                                        </label>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-zinc-200" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-zinc-400 font-mono">Or Paste Text</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-zinc-50 p-2 rounded-t-lg border border-zinc-200 border-b-0">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Editor</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-[10px] text-zinc-500 hover:text-zinc-800"
                                            onClick={() => setIsPreviewOpen(true)}
                                        >
                                            <ScanSearch className="h-3 w-3 mr-1" /> Fullscreen Review
                                        </Button>
                                    </div>
                                    <Textarea
                                        placeholder="Paste your abstract or hypothesis here..."
                                        className="min-h-[300px] max-h-[600px] font-serif text-base resize-y bg-white border-zinc-200 focus-visible:ring-zinc-400 placeholder:text-zinc-400 overflow-y-auto overflow-x-auto whitespace-pre rounded-t-none"
                                        value={paperInput}
                                        onChange={(e) => setPaperInput(e.target.value)}
                                        disabled={session?.data.claims.length > 0} // Lock input after scan
                                    />
                                </div>

                                {/* FULLSCREEN REVIEW MODAL */}
                                {isPreviewOpen && (
                                    <div className="fixed inset-0 z-[100] bg-white flex flex-col p-4 md:p-10 animate-in fade-in zoom-in duration-200">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-zinc-900 text-white p-2 rounded">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold tracking-tight text-zinc-900">Manuscript Review</h2>
                                                    <p className="text-xs text-zinc-500 font-mono">Detailed inspection & manual correction mode</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                                                <XCircle className="h-4 w-4 mr-2" /> Save & Close
                                            </Button>
                                        </div>

                                        <div className="flex-1 overflow-hidden flex flex-col bg-zinc-50 rounded-xl border border-zinc-200 shadow-inner">
                                            <div className="bg-white border-b border-zinc-200 p-2 px-4 flex justify-between items-center">
                                                <div className="flex gap-4 text-[10px] font-mono text-zinc-400 uppercase">
                                                    <span>Characters: {paperInput.length}</span>
                                                    <span>Lines: {paperInput.split('\n').length}</span>
                                                </div>
                                                <span className="text-[10px] text-zinc-300 italic">Auto-focus enabled</span>
                                            </div>
                                            <textarea
                                                className="flex-1 p-6 md:p-10 font-serif text-lg md:text-xl leading-relaxed bg-transparent focus:outline-none resize-none overflow-y-auto overflow-x-auto whitespace-pre w-full max-w-4xl mx-auto selection:bg-zinc-200"
                                                value={paperInput}
                                                onChange={(e) => setPaperInput(e.target.value)}
                                                autoFocus
                                            />
                                        </div>

                                        <div className="mt-6 flex justify-between items-center">
                                            <p className="text-[10px] text-zinc-400 max-w-xs">
                                                Tip: Ensure all technical symbols and causal claims are clearly legible for the AR-AUDIT persona.
                                            </p>
                                            <Button className="bg-zinc-900 hover:bg-black text-white px-8" onClick={() => setIsPreviewOpen(false)}>
                                                Review Complete
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* MULTIMODAL INPUT */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-3 w-3" /> Visual Evidence
                                        </div>
                                        {paperImages.length > 0 && (
                                            <Badge variant="outline" className="text-[9px] h-4 bg-zinc-100 border-zinc-300 text-zinc-600 font-mono">
                                                {paperImages.length} ELEMENTS DETECTED
                                            </Badge>
                                        )}
                                    </label>
                                    <span className="text-xs text-zinc-500 block mb-2 font-mono">
                                        Supported: JPG, PNG, WEBP (Max 4MB per file).
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp"
                                        multiple
                                        className="block w-full text-xs text-zinc-600 font-mono file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                const files = Array.from(e.target.files);

                                                // VALIDATION LOGIC
                                                const MAX_SIZE = 4 * 1024 * 1024; // 4MB
                                                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

                                                files.forEach(file => {
                                                    // 1. Size Check
                                                    if (file.size > MAX_SIZE) {
                                                        alert(`File ${file.name} exceeds 4MB limit.`);
                                                        return;
                                                    }
                                                    // 2. Type Check
                                                    if (!validTypes.includes(file.type)) {
                                                        alert(`File ${file.name} is not a valid format. Use JPG, PNG, or WEBP.`);
                                                        return;
                                                    }

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
                                                <div key={i} className="relative w-24 h-24 border border-zinc-200 rounded overflow-hidden group shadow-sm">
                                                    <img src={img} className="w-full h-full object-cover cursor-zoom-in" alt="Upload preview" onClick={() => setSelectedImage(img)} />
                                                    <button
                                                        onClick={() => setPaperImages(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Remove Image"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* IMAGE LIGHTBOX */}
                                    {selectedImage && (
                                        <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
                                            <div className="flex justify-end p-2">
                                                <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setSelectedImage(null)}>
                                                    <XCircle className="h-6 w-6" /> Close
                                                </Button>
                                            </div>
                                            <div className="flex-1 flex items-center justify-center p-4">
                                                <img src={selectedImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300" alt="Large preview" />
                                            </div>
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
                                            disabled={(!paperInput && paperImages.length === 0) || isProcessing}

                                        >
                                            <ScanSearch className="h-4 w-4 mr-2" />
                                            {session.paymentStatus === 'UNPAID' ? "Unlock Audit (Start)" : `Extract Claims (Compute Active)`}
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

                                                    {/* FREE TRIAL OPTION */}
                                                    {isTrialEligible && (
                                                        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg animate-in slide-in-from-top-2">
                                                            <div className="flex items-center gap-2 mb-2 text-indigo-800 font-bold font-serif">
                                                                <Gift className="h-5 w-5" />
                                                                <span>One-Time Free Trial</span>
                                                            </div>
                                                            <p className="text-xs text-indigo-600 mb-4 leading-relaxed">
                                                                Experience the full adversarial capabilities of ARGUS-Thesis on your first manuscript without charge.
                                                            </p>
                                                            <Button
                                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                                                disabled={isTrialProcessing}
                                                                onClick={async () => {
                                                                    setIsTrialProcessing(true);
                                                                    try {
                                                                        const res = await fetch("/api/start-trial", { method: "POST" });
                                                                        const data = await res.json();

                                                                        if (res.ok && data.success) {
                                                                            // Unlock Session
                                                                            setSession({ ...session, paymentStatus: 'PAID' });
                                                                            setIsPaymentModalOpen(false);
                                                                            setIsTrialEligible(false); // No longer eligible
                                                                            alert("Free Trial Activated! Engine Unlocked.");
                                                                        } else {
                                                                            alert("Trial Activation Failed: " + (data.error || "Unknown error"));
                                                                        }
                                                                    } catch (e) {
                                                                        console.error(e);
                                                                        alert("Network error activating trial.");
                                                                    } finally {
                                                                        setIsTrialProcessing(false);
                                                                    }
                                                                }}
                                                            >
                                                                {isTrialProcessing ? (
                                                                    <>
                                                                        <PlayCircle className="h-4 w-4 animate-spin mr-2" />
                                                                        Activating...
                                                                    </>
                                                                ) : "Start Free Trial (One-Time)"}
                                                            </Button>

                                                            <div className="mt-4 flex items-center gap-2">
                                                                <div className="h-px bg-indigo-200 flex-1"></div>
                                                                <span className="text-xs text-indigo-500 font-mono uppercase">OR PAY</span>
                                                                <div className="h-px bg-indigo-200 flex-1"></div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Dynamic Pricing Logic */}
                                                    {(() => {
                                                        const price = "$24.99";
                                                        const label = "Full Adversarial Audit";

                                                        return (
                                                            <>
                                                                <div className="p-4 rounded mb-6 border bg-zinc-50 border-zinc-100">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="text-sm font-sans text-zinc-600">{label}</span>
                                                                        <span className="font-bold text-lg">{price}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-sm text-zinc-600">
                                                                        <span>Compute: Included (Multi-Pass)</span>
                                                                        <span>GST Incl.</span>
                                                                    </div>
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
                                                                        // Fixed Price: $24.99
                                                                        const amount = 24.99;

                                                                        const orderRes = await fetch("/api/create-order", {
                                                                            method: "POST",
                                                                            headers: { "Content-Type": "application/json" },
                                                                            body: JSON.stringify({ amount: Math.round(amount * 100) }), // in paise
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
                                                                            name: "ARGUS-Thesis Governance",
                                                                            description: "Full Adversarial Audit",
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
                        {/* 1. GOVERNANCE REPORT (NEW) */}
                        {session.data.report && (
                            <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden mb-6 animate-in slide-in-from-bottom-2">
                                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            Decision Matrix
                                        </CardTitle>
                                        <Badge variant={session.data.report.readinessScore > 80 ? 'default' : 'secondary'} className="font-mono">
                                            {session.data.report.verdict}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-8 items-center">
                                        {/* GAUGE */}
                                        <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="64" cy="64" r="56" stroke="gray" strokeWidth="8" fill="transparent" className="text-zinc-100" />
                                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
                                                    strokeDasharray={351}
                                                    strokeDashoffset={351 - (351 * session.data.report.readinessScore) / 100}
                                                    className={session.data.report.readinessScore > 80 ? "text-green-500" : session.data.report.readinessScore > 50 ? "text-yellow-500" : "text-red-500"}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute flex flex-col items-center">
                                                <span className="text-3xl font-bold font-sans">{session.data.report.readinessScore}</span>
                                                <span className="text-[10px] text-zinc-400 font-mono">SCORE</span>
                                            </div>
                                        </div>

                                        {/* EXECUTIVE SUMMARY */}
                                        <div className="flex-1 space-y-4">
                                            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Editor's Summary</h4>
                                                <p className="text-sm italic text-zinc-700 font-serif leading-relaxed">
                                                    "{session.data.report.executiveSummary}"
                                                </p>
                                            </div>

                                            {/* ACTION ITEMS PREVIEW */}
                                            {session.data.report.actionItems && session.data.report.actionItems.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-2">
                                                        <AlertTriangle className="h-3 w-3" /> Critical Remediation Required
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {session.data.report.actionItems.slice(0, 2).map((item: any, i: number) => (
                                                            <div key={i} className="flex gap-3 items-start text-xs border-l-2 border-red-300 pl-3">
                                                                <span className="font-mono font-bold text-red-600 bg-red-50 px-1 rounded">{item.layer?.toUpperCase()}</span>
                                                                <span className="text-zinc-600">{item.suggestion}</span>
                                                            </div>
                                                        ))}
                                                        {session.data.report.actionItems.length > 2 && (
                                                            <p className="text-[10px] text-zinc-400 pl-3">
                                                                + {session.data.report.actionItems.length - 2} more issues in full report.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-zinc-50 p-3 border-t border-zinc-100 flex flex-col gap-2">
                                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => generateManuscriptPDF(session)}>
                                        <Download className="h-3 w-3 mr-2" /> Download Consultant Report
                                    </Button>

                                    {/* VIRAL CERTIFICATE - Only for High Scores */}
                                    {(session.data.report?.readinessScore || 0) >= 80 && (
                                        <Button
                                            size="sm"
                                            className="w-full text-xs bg-green-600 hover:bg-green-700 text-white font-bold border border-green-700 shadow-sm"
                                            onClick={() => generateCertificate({
                                                id: session.id,
                                                score: session.data.report?.readinessScore || 0,
                                                claim: session.data.claims[0]?.statement || "Analysis",
                                                date: new Date().toISOString()
                                            }, "Researcher")}
                                        >
                                            <ShieldCheck className="h-3 w-3 mr-2" /> Download Verified Certificate
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )}

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

                                                        {/* [NEW] Visual Evidence Attachments */}
                                                        {claim.visualEvidence && claim.visualEvidence.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                {claim.visualEvidence.map((img: string, idx: number) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="w-20 h-20 rounded border border-zinc-200 overflow-hidden cursor-zoom-in hover:border-zinc-400 transition-all shadow-sm group relative"
                                                                        onClick={() => setSelectedImage(img)}
                                                                    >
                                                                        <img src={img} alt="Evidence" className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                                                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <Maximize2 className="h-4 w-4 text-white drop-shadow" />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
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
            </main >
        </div >
    )
}
