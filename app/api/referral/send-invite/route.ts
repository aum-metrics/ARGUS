/**
 * Author: Sambath Kumar Natarajan
 * Referral System: Send Invite
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { refereeEmail } = body;

        // Auth check
        const { createClient: createServerClient } = await import("@/lib/supabase/server");
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (!user || authError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get referrer's referral code
        const { data: profile } = await supabase
            .from('profiles')
            .select('referral_code')
            .eq('id', user.id)
            .single();

        if (!profile?.referral_code) {
            return NextResponse.json({ error: 'Referral code not found' }, { status: 404 });
        }

        // Create referral record
        const { data: referral, error: referralError } = await supabase
            .from('referrals')
            .insert({
                referrer_id: user.id,
                referee_email: refereeEmail,
                status: 'pending'
            })
            .select()
            .single();

        if (referralError) {
            console.error('Referral creation error:', referralError);
            return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
        }

        // Generate referral link
        const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login?ref=${profile.referral_code}`;

        // TODO: Send email via SendGrid/Resend
        // For now, just return the link for manual sharing
        console.log(`[REFERRAL] Invite sent to ${refereeEmail} from ${user.id}`);

        return NextResponse.json({
            success: true,
            referralLink,
            message: 'Referral created. Share this link with your colleague.'
        });

    } catch (error: any) {
        console.error('Referral Invite Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
