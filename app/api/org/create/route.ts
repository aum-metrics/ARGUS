import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Service Role Client for Admin Ops
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function POST(req: Request) {
    try {
        const { orgName, userId } = await req.json()

        if (!orgName || !userId) {
            return NextResponse.json({ error: "Missing Name or UserID" }, { status: 400 })
        }

        // 1. Create Organization
        const { data: org, error: orgError } = await supabaseAdmin
            .from('organizations')
            .insert({
                name: orgName,
                credits_balance: 5, // Default Start credits
                credits_total: 5,
                owner_id: userId
            })
            .select()
            .single()

        if (orgError) throw orgError

        // 2. Link User to Org as Admin
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                org_id: org.id,
                role: 'ORG_ADMIN' // Set role
            })
            .eq('id', userId)

        if (profileError) {
            // Rollback org creation? technically yes, but for now just error
            console.error("Profile Link Error", profileError)
            return NextResponse.json({ error: "Failed to link profile" }, { status: 500 })
        }

        return NextResponse.json({ success: true, org })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
