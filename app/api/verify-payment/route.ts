import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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
            const { createClient } = await import("@/lib/supabase/server");
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // 1. Update Transaction Status
                await supabase.from("transactions")
                    .update({
                        status: "success",
                        razorpay_payment_id: razorpayPaymentId,
                        updated_at: new Date().toISOString()
                    })
                    .eq("razorpay_order_id", orderCreationId);

                // 2. Create Audit Log Entry (Business Value)
                // We assume this payment unlocks a standard session
                await supabase.from("audit_logs").insert({
                    user_id: user.id,
                    session_id: orderCreationId, // Using Order ID as proxy for session ref for now
                    claim_count: 0, // Initial unlock
                    tier: "standard",
                    token_usage_estimate: 0 // Will increment later via client update if we sync logs
                });
            }
        } catch (logError) {
            console.error("Failed to log payment success:", logError);
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
