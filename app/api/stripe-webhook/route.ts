/**
 * Author: Sambath Kumar Natarajan
 * Stripe Webhook Handler
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature')!;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Handle checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            // Admin client for RLS bypass
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // Update transaction status
            const { data: transactionData, error: transactionError } = await supabaseAdmin
                .from('transactions')
                .update({
                    status: 'success',
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_session_id', session.id)
                .select()
                .single();

            if (transactionError || !transactionData) {
                console.error('Failed to update transaction:', transactionError);
                return NextResponse.json({ error: 'Transaction update failed' }, { status: 500 });
            }

            // Route credits to organization or personal account
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('role, org_id')
                .eq('id', transactionData.user_id)
                .single();

            let metadataUpdate = {};

            if (profile?.role === 'ORG_ADMIN' && profile?.org_id) {
                // Route to organization
                const { data: org } = await supabaseAdmin
                    .from('organizations')
                    .select('credits_balance')
                    .eq('id', profile.org_id)
                    .single();

                if (org) {
                    await supabaseAdmin
                        .from('organizations')
                        .update({
                            credits_balance: (org.credits_balance || 0) + (transactionData.metadata?.credits || 1)
                        })
                        .eq('id', profile.org_id);

                    metadataUpdate = { target: 'ORG', org_id: profile.org_id };
                    console.log(`[STRIPE] Routed ${transactionData.metadata?.credits} credits to Org ${profile.org_id}`);
                }
            } else {
                metadataUpdate = { target: 'PERSONAL' };
            }

            // Update transaction metadata
            await supabaseAdmin
                .from('transactions')
                .update({
                    metadata: { ...transactionData.metadata, ...metadataUpdate }
                })
                .eq('id', transactionData.id);

            // Create audit log
            await supabaseAdmin.from('audit_logs').insert({
                user_id: transactionData.user_id,
                session_id: session.id,
                action: 'PAYMENT_UNLOCK',
                metadata: {
                    amount: transactionData.amount,
                    currency: transactionData.currency,
                    method: 'STRIPE',
                    credit_target: metadataUpdate
                }
            });

            console.log(`[STRIPE] Payment successful: ${session.id}`);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Stripe Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Disable body parsing for webhook signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};
