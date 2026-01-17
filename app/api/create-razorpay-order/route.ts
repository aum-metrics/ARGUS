/**
 * Author: Sambath Kumar Natarajan
 */
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * Create Razorpay Order
 * Production payment integration
 */
export async function POST(req: Request) {
    try {
        const { amount, currency } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({
                error: 'Invalid amount'
            }, { status: 400 });
        }

        // Initialize Razorpay instance
        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!
        });

        // Create order
        const order = await razorpay.orders.create({
            amount: amount, // Amount in paise
            currency: currency || 'USD',
            receipt: `receipt_${Date.now()}`,
            notes: {
                product: 'ARGUS Audit Credit'
            }
        });

        return NextResponse.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency
        });

    } catch (error: any) {
        console.error('[API/create-razorpay-order] Error:', error);
        return NextResponse.json({
            error: 'Failed to create order',
            message: error.message
        }, { status: 500 });
    }
}
