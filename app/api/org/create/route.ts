import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        // Create admin client inside request handler to avoid build-time errors
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        const { orgName } = await req.json()

        // 1. Authenticate User
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!orgName) {
            return NextResponse.json({ error: "Missing Name" }, { status: 400 })
        }

        // 2. Create Organization
        const { data: org, error: orgError } = await supabaseAdmin
            .from('organizations')
            .insert({
                name: orgName,
                credits_balance: 5, // Default Start credits
                credits_total: 5,
                owner_id: user.id
            })
            .select()
            .single()

        if (orgError) throw orgError

        // 3. Link User to Org as Admin
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                org_id: org.id,
                role: 'ORG_ADMIN' // Set role
            })
            .eq('id', user.id)

        if (profileError) {
            console.error("Profile Link Error", profileError)
            return NextResponse.json({ error: "Failed to link profile" }, { status: 500 })
        }

        return NextResponse.json({ success: true, org })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
