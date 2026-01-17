/**
 * Author: Sambath Kumar Natarajan
 * Stripe Checkout Session Creation
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tier, orgName, contactEmail, contactName } = body;

        // Pricing (mirrors Razorpay tiers)
        const PRICING = {
            'LAB_STARTER': { amount: 49900, credits: 20, name: 'Lab Starter Pack' }, // $499
            'DEPARTMENT': { amount: 99900, credits: 100, name: 'Department Scale' } // $999
        };

        const tierConfig = PRICING[tier as keyof typeof PRICING];
        if (!tierConfig) {
            return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
        }

        // Get authenticated user
        const { createClient: createServerClient } = await import("@/lib/supabase/server");
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (!user || authError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: tierConfig.name,
                            description: `${tierConfig.credits} audit credits for ${orgName}`,
                        },
                        unit_amount: tierConfig.amount, // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/register/organization?payment=cancelled`,
            customer_email: contactEmail,
            metadata: {
                userId: user.id,
                tier,
                orgName,
                contactName,
                credits: tierConfig.credits.toString()
            }
        });

        // Create pending transaction in Supabase (Admin Client)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        await supabaseAdmin.from('transactions').insert({
            user_id: user.id,
            stripe_session_id: session.id,
            amount: tierConfig.amount,
            currency: 'USD',
            status: 'pending',
            payment_gateway: 'stripe',
            metadata: {
                tier,
                orgName,
                contactEmail,
                contactName,
                credits: tierConfig.credits
            }
        });

        return NextResponse.json({
            sessionId: session.id,
            url: session.url
        });

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
