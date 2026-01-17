import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // In a real product, fetch this from DB or a CMS.
    // For V1.0 Hardening, we serve it from API to decouple frontend build.
    const SCENARIOS = {
        ROOT: {
            id: 'ROOT',
            text: "Hello! I'm the Argus Support Assistant. I can help with general questions. How can I assist you today?",
            options: [
                { label: "Pricing & Plans", nextId: 'PRICING' },
                { label: "Data Privacy", nextId: 'PRIVACY' },
                { label: "Refunds", nextId: 'REFUNDS' },
                { label: "Enterprise / Labs", nextId: 'ENTERPRISE' },
                { label: "Ask a Specific Question", nextId: 'QA_MODE' },
            ]
        },
        PRICING: {
            id: 'PRICING',
            text: "We offer one simple model: $14.99 per Full Audit. Includes Multi-Agent Protocol and PDF Report.",
            options: [
                { label: "Back to Menu", nextId: 'ROOT' }
            ]
        },
        PRIVACY: {
            id: 'PRIVACY',
            text: "Security is our First Law. Your manuscript data is processed in ephemeral RAM only. We strictly DO NOT train models on your data.",
            options: [
                { label: "Back to Menu", nextId: 'ROOT' }
            ]
        },
        REFUNDS: {
            id: 'REFUNDS',
            text: "If the system failed due to a technical error, we issue full refunds. Email help@argus-thesis.com with your Session ID.",
            options: [
                { label: "Back to Menu", nextId: 'ROOT' }
            ]
        },
        ENTERPRISE: {
            id: 'ENTERPRISE',
            text: "For University Departments and Labs, we offer bulk licensing. Contact help@argus-thesis.com.",
            options: [
                { label: "Back to Menu", nextId: 'ROOT' }
            ]
        }
    };

    return NextResponse.json(SCENARIOS);
}
