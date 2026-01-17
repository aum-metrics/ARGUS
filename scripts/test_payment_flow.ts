
import fetch from 'node-fetch';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET;
if (!RAZORPAY_SECRET) {
    console.error("❌ ERROR: RAZORPAY_KEY_SECRET not found in .env.local");
    process.exit(1);
}

const orderId = "order_mock_" + Date.now();
const paymentId = "pay_mock_" + Date.now();

// Generate Signature
const text = orderId + "|" + paymentId;
const signature = crypto
    .createHmac("sha256", RAZORPAY_SECRET)
    .update(text)
    .digest("hex");

async function testVerification() {
    console.log("Simulating Razorpay Payment Verification...");
    console.log({ orderCreationId: orderId, razorpayPaymentId: paymentId, razorpaySignature: signature });

    try {
        const response = await fetch('http://localhost:3000/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderCreationId: orderId,
                razorpayPaymentId: paymentId,
                razorpaySignature: signature,
            })
        });

        const data = await response.json() as { success?: boolean, message?: string, error?: string };
        console.log("Response Status:", response.status);
        console.log("Response Data:", data);

        if (response.status === 200 && (data.success || data.message === "success")) {
            console.log("✅ SUCCESS: Payment verified and DB updated (simulated).");
        } else {
            console.error("❌ FAILURE: Verification failed.");
        }

    } catch (error) {
        console.error("❌ ERROR: Request failed", error);
    }
}

testVerification();
