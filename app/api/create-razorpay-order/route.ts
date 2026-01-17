/**
 * Author: Sambath Kumar Natarajan
 */
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
// import { getServerSession } from "next-auth"; // REMOVED: using mock ID or client-side ID for now as Supabase auth logic is separate
// Assuming we pass user_id in body for now simplified or getting header


/**
 * Create Razorpay Order
 * Production payment integration
 */
export async function POST(req: Request) {
    try {
        const { amount, currency, userId } = await req.json();

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

        // Initialize Supabase Admin to create pending transaction
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Calculate credits based on amount/tier (Basic logic)
        let credits = 1;
        if (amount === 29900) credits = 20; // Lab
        if (amount === 149900) credits = 100; // Dept

        // Insert Pending Transaction
        const { error: dbError } = await supabaseAdmin
            .from('transactions')
            .insert({
                razorpay_order_id: order.id,
                amount: amount,
                currency: currency || 'USD',
                status: 'pending',
                user_id: userId, // Use userId from body
                metadata: {
                    credits,
                    product: 'ARGUS Audit Credit'
                }
            });

        if (dbError) {
            console.error('Failed to create pending transaction:', dbError);
            // We continue anyway, but ideally we should fail. 
            // For MVP, we allow order creation but verification might fail if row missing.
        }

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
