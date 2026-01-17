
import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";


export async function GET(req: Request) {
    try {
        // Create admin client inside request handler to avoid build-time errors
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. AUTH CHECK (User Context)
        const { createClient: createReqClient } = await import("@/lib/supabase/server");
        const supabase = await createReqClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (!user || authError) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. ROLE CHECK (Strict)
        // We use the Admin client to check the profile role trustworthily
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'SUPER_ADMIN') {
            console.warn(`[SECURITY] Unauthorized Admin Access Attempt by ${user.id} (${user.email})`);
            return NextResponse.json({ error: "Forbidden: Super Admin Access Required" }, { status: 403 });
        }

        // 3. FETCH GLOBAL STATS (Parallel)
        const [
            { count: totalUsers },
            { count: totalOrgs },
            { count: totalAudits },
            { data: recentAudits },
            { data: organizations },
            { data: users }
        ] = await Promise.all([
            // A. Count Users
            supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
            // B. Count Orgs
            supabaseAdmin.from('organizations').select('*', { count: 'exact', head: true }),
            // C. Count Audits
            supabaseAdmin.from('audit_logs').select('*', { count: 'exact', head: true }),
            // D. Recent Activity (Metadata encoded) - Limit 10
            supabaseAdmin.from('audit_logs')
                .select('id, user_id, action, created_at, metadata, org_id')
                .order('created_at', { ascending: false })
                .limit(20),
            // E. Org Details (For Table)
            supabaseAdmin.from('organizations').select('*').order('created_at', { ascending: false }),
            // F. User Details (Limit 50 for now)
            supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false }).limit(50)
        ]);

        return NextResponse.json({
            metrics: {
                totalUsers: totalUsers || 0,
                totalOrgs: totalOrgs || 0,
                totalAudits: totalAudits || 0,
                systemHealth: "OPTIMAL" // Mock, could hook into infra later
            },
            feed: recentAudits || [],
            data: {
                organizations: organizations || [],
                users: users || []
            }
        });

    } catch (e: any) {
        console.error("Admin API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
