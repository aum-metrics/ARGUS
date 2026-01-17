/**
 * Author: Sambath Kumar Natarajan
 * Admin API: Create University Pilot Program
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { universityName, contactEmail, contactName, credits = 10, durationDays = 90 } = body;

        // Auth check
        const { createClient: createServerClient } = await import("@/lib/supabase/server");
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (!user || authError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Admin client for role check and operations
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify SUPER_ADMIN role
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'SUPER_ADMIN') {
            console.warn(`[SECURITY] Unauthorized pilot creation attempt by ${user.id}`);
            return NextResponse.json({ error: 'Forbidden: Super Admin Access Required' }, { status: 403 });
        }

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        // Create pilot organization
        const { data: org, error: orgError } = await supabaseAdmin
            .from('organizations')
            .insert({
                name: universityName,
                tier: 'PILOT',
                credits_balance: credits,
                pilot_expires_at: expiresAt.toISOString()
            })
            .select()
            .single();

        if (orgError || !org) {
            console.error('Failed to create pilot org:', orgError);
            return NextResponse.json({ error: 'Failed to create pilot organization' }, { status: 500 });
        }

        // Create audit log
        await supabaseAdmin.from('audit_logs').insert({
            user_id: user.id,
            session_id: org.id,
            action: 'PILOT_CREATED',
            metadata: {
                org_name: universityName,
                contact_email: contactEmail,
                contact_name: contactName,
                credits_granted: credits,
                expires_at: expiresAt.toISOString()
            }
        });

        console.log(`[PILOT] Created pilot for ${universityName} (${credits} credits, expires ${expiresAt.toISOString()})`);

        return NextResponse.json({
            success: true,
            organization: {
                id: org.id,
                name: org.name,
                credits: org.credits_balance,
                expiresAt: org.pilot_expires_at
            }
        });

    } catch (error: any) {
        console.error('Pilot Creation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
