import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, currency = "INR" } = body;

        // Initialize Razorpay
        // NOTE: These MUST be in process.env or it will fail
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const options = {
            amount: amount, // amount in smallest currency unit (paise)
            currency: currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // PRODUCTION LOGGING: Track Attempt
        try {
            // Use standard server client (relies on user's cookies)
            // Ideally, we'd use a service role if we wanted to log *anonymous* attempts, 
            // but for "Account Aware" flow, we link to the user.
            const { createClient } = await import("@/lib/supabase/server");
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                await supabase.from("transactions").insert({
                    user_id: user.id,
                    razorpay_order_id: order.id,
                    amount: options.amount,
                    currency: options.currency,
                    status: "pending"
                });
            }
        } catch (logError) {
            console.error("Failed to log transaction attempt:", logError);
            // Non-blocking: Don't fail the user's payment flow just because logging failed
        }

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
