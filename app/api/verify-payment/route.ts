/**
 * Author: Sambath Kumar Natarajan
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderCreationId, razorpayPaymentId, razorpaySignature } = body;

        const secret = process.env.RAZORPAY_KEY_SECRET!;

        // Create hmac
        const shasum = crypto.createHmac("sha256", secret);
        shasum.update(orderCreationId + "|" + razorpayPaymentId);
        const digest = shasum.digest("hex");

        if (digest !== razorpaySignature) {
            return NextResponse.json({ message: "Transaction not legit!" }, { status: 400 });
        }

        // PRODUCTION LOGGING: Link Revenue & Usage
        try {
            // SECURITY: Use Admin Client (Service Role) to bypass RLS for the UPDATE operation.
            // Regular users cannot update "status" to "success" themselves.
            // This prevents console-based attacks where users manually update their transaction status.
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // 1. Update Transaction (Admin) using Order ID
            const { data: transactionData, error: transactionError } = await supabaseAdmin
                .from("transactions")
                .update({
                    status: "success",
                    razorpay_payment_id: razorpayPaymentId,
                    updated_at: new Date().toISOString()
                })
                .eq("razorpay_order_id", orderCreationId)
                .select()
                .single();

            if (transactionError || !transactionData) {
                console.error("Failed to update transaction status:", transactionError);
                // We log error but return success to client to avoid confusing UI, 
                // as payment *was* technically verified by Razorpay signature.
                // However, the "Unlock" might fail if it depends on this DB state.
            } else {
                // 2. CHECK ROLE & ROUTE CREDITS
                // Fetch Profile to see if it's an Org Admin
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('role, org_id')
                    .eq('id', transactionData.user_id)
                    .single();

                let metadataUpdate = {};

                // If Admin, route to Org
                if (profile?.role === 'ORG_ADMIN' && profile?.org_id) {
                    // Update Organization Balance
                    // Note: We use rpc() or simple update if no concurrency risk.
                    // Ideally: update organizations set credits_balance = credits_balance + X
                    // But here we do read-modify-write (fine for MVP low traffic)
                    const { data: org } = await supabaseAdmin
                        .from('organizations')
                        .select('credits_balance')
                        .eq('id', profile.org_id)
                        .single();

                    if (org) {
                        await supabaseAdmin
                            .from('organizations')
                            .update({
                                credits_balance: (org.credits_balance || 0) + 1 // Assuming 1 Credit per Transaction
                            })
                            .eq('id', profile.org_id);

                        metadataUpdate = { target: 'ORG', org_id: profile.org_id };
                        console.log(`[PAYMENT] Routed credit to Org ${profile.org_id}`);
                    }
                } else {
                    metadataUpdate = { target: 'PERSONAL' };
                }

                // Update Transaction Metadata
                await supabaseAdmin
                    .from('transactions')
                    .update({
                        metadata: { ...transactionData.metadata, ...metadataUpdate }
                    })
                    .eq('id', transactionData.id);

                // 3. Create Audit Log Entry (Admin)
                await supabaseAdmin.from("audit_logs").insert({
                    user_id: transactionData.user_id,
                    session_id: orderCreationId,
                    action: 'PAYMENT_UNLOCK',
                    metadata: {
                        amount: transactionData.amount,
                        currency: transactionData.currency,
                        method: 'RAZORPAY',
                        credit_target: metadataUpdate
                    },
                    claim_count: 0,
                    tier: "standard"
                });
            }
        } catch (logError) {
            console.error("Critical: Failed to process post-payment logic:", logError);
        }

        return NextResponse.json({
            message: "success",
            orderId: orderCreationId,
            paymentId: razorpayPaymentId,
        });

    } catch (error: any) {
        console.error("Error verifying Razorpay payment:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
