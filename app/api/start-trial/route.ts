/**
 * Author: Sambath Kumar Natarajan
 */
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // 1. Verify Auth (User Context)
        const supabaseUser = await createServerClient();
        const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Admin Client for Privileged Operations (Bypass RLS)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );


        // 3. Check Eligibility (Admin)
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('is_trial_used')
            .eq('id', user.id)
            .single();

        if (profileError) {
            return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
        }

        if (profile.is_trial_used) {
            return NextResponse.json({ error: "Trial already claimed" }, { status: 403 });
        }

        // 4. Activate Trial (Atomic Update via Admin)
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ is_trial_used: true })
            .eq('id', user.id);

        if (updateError) {
            return NextResponse.json({ error: "Failed to activate trial" }, { status: 500 });
        }

        // 5. Grant Credit (Insert Virtual Transaction)
        // This ensures checkUser() sees 1 Credit vs 0 Usage, allowing access even after refresh.
        const { error: txError } = await supabaseAdmin.from('transactions').insert({
            user_id: user.id,
            amount: 0,
            currency: 'INR',
            status: 'success',
            razorpay_order_id: 'TRIAL_GRANT',
            razorpay_payment_id: `TRIAL_${Date.now()}`
        });

        if (txError) {
            console.error("Failed to grant trial credit:", txError);
            // We don't rollback profile update as it's not critical, but meaningful to log
        }

        // 6. Log Audit Event
        await supabaseAdmin.from('audit_logs').insert({
            user_id: user.id,
            session_id: "TRIAL-ACTIVATION",
            action: 'TRIAL_ACTIVATED',
            metadata: {
                method: 'FREE_TRIAL'
            },
            claim_count: 0,
            tier: "trial"
        });

        return NextResponse.json({ success: true, message: "Trial activated" });

    } catch (error: any) {
        console.error("Trial activation failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
