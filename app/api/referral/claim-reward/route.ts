/**
 * Author: Sambath Kumar Natarajan
 * Referral System: Claim Reward
 * 
 * This endpoint is called automatically when a referee completes their first paid audit.
 * It grants 1 credit to the referrer.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { refereeUserId } = body;

        // Admin client for RLS bypass
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Find pending referral for this referee
        const { data: referral, error: referralError } = await supabaseAdmin
            .from('referrals')
            .select('*')
            .eq('referee_id', refereeUserId)
            .eq('status', 'completed')
            .single();

        if (referralError || !referral) {
            // No referral found or already rewarded
            return NextResponse.json({ message: 'No pending referral reward' }, { status: 200 });
        }

        // Check if referee has completed at least one paid audit
        const { count: auditCount } = await supabaseAdmin
            .from('audit_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', refereeUserId)
            .eq('action', 'THESIS_CONSTRUCTOR');

        if (!auditCount || auditCount < 1) {
            return NextResponse.json({ message: 'Referee has not completed an audit yet' }, { status: 200 });
        }

        // Grant 1 credit to referrer (create a transaction record)
        const { error: transactionError } = await supabaseAdmin
            .from('transactions')
            .insert({
                user_id: referral.referrer_id,
                razorpay_order_id: `referral_${referral.id}`,
                amount: 0, // Free credit
                currency: 'USD',
                status: 'success',
                payment_gateway: 'referral',
                metadata: {
                    type: 'REFERRAL_REWARD',
                    referee_id: refereeUserId,
                    referee_email: referral.referee_email
                }
            });

        if (transactionError) {
            console.error('Failed to grant referral credit:', transactionError);
            return NextResponse.json({ error: 'Failed to grant reward' }, { status: 500 });
        }

        // Update referral status
        await supabaseAdmin
            .from('referrals')
            .update({ status: 'rewarded' })
            .eq('id', referral.id);

        console.log(`[REFERRAL] Rewarded ${referral.referrer_id} for referring ${refereeUserId}`);

        return NextResponse.json({
            success: true,
            message: 'Referral reward granted'
        });

    } catch (error: any) {
        console.error('Referral Reward Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
