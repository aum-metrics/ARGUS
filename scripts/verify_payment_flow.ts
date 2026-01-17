
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const razorpaySecret = process.env.RAZORPAY_KEY_SECRET!;

const supabase = createClient(supabaseUrl, serviceKey);

async function verifyPaymentFlow() {
    console.log("Starting Payment Flow Verification...");

    // 1. Create a Test User
    const email = `test_pay_${Date.now()}@example.com`;
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: 'password123',
        email_confirm: true
    });

    if (userError) throw userError;
    const userId = user.user.id;
    console.log(`Created Test User: ${userId}`);

    // 2. Create a Pending Transaction (Simulating the UI)
    const orderId = `order_${Date.now()}`;
    const { data: transaction, error: txError } = await supabase.from('transactions').insert({
        user_id: userId,
        razorpay_order_id: orderId,
        amount: 500,
        currency: 'INR',
        status: 'pending',
        credits_purchased: 1
    }).select().single();

    if (txError) throw txError;
    console.log(`Created Pending Transaction: ${transaction.id}`);

    // 3. Simulate Razorpay Signature
    const paymentId = `pay_${Date.now()}`;
    const shasum = crypto.createHmac("sha256", razorpaySecret);
    shasum.update(orderId + "|" + paymentId);
    const signature = shasum.digest("hex");

    // 4. Call the Verification Endpoint (Simulated)
    // We can't call the API route directly effectively without running server, 
    // so we will execute the logic equivalent here to verify the DATABASE constraints/triggers.
    // OR we can fetch against localhost:3000 if running. Let's try fetch.

    try {
        const res = await fetch('http://localhost:3001/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderCreationId: orderId,
                razorpayPaymentId: paymentId,
                razorpaySignature: signature
            })
        });

        const data = await res.json();
        console.log("API Response:", data);

        if (res.status !== 200) throw new Error(data.message || "API Failed");

    } catch (e) {
        console.error("API Call Failed (Server likely not running or unreachable). verifying logic manually...");
        // Fallback: Run the logic manually? No, we should assume server is running on 3001 as per logs.
    }

    // 5. Verify the Result in DB
    const { data: updatedTx } = await supabase.from('transactions').select('*').eq('id', transaction.id).single();
    if (updatedTx.status === 'success') {
        console.log("✅ Transaction successfully marked as SUCCESS");
    } else {
        console.error("❌ Transaction still PENDING/FAILED");
    }

    // 6. Cleanup
    await supabase.auth.admin.deleteUser(userId);
    console.log("Test User Deleted.");
}

verifyPaymentFlow().catch(console.error);
