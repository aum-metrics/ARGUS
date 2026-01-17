import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Service Role Client for Admin Ops
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

export async function POST(req: Request) {
    try {
        const { email, orgId } = await req.json()

        // 1. Authenticate User
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!email || !orgId) {
            return NextResponse.json({ error: "Missing Email or OrgID" }, { status: 400 })
        }

        // 2. Verify Authorization (Must be ORG_ADMIN of this Org)
        // Check Profile
        const { data: requesterProfile } = await supabase
            .from('profiles')
            .select('role, org_id')
            .eq('id', user.id)
            .single()

        if (requesterProfile?.org_id !== orgId || requesterProfile?.role !== 'ORG_ADMIN') {
            return NextResponse.json({ error: "Forbidden: You are not an Admin of this organization" }, { status: 403 })
        }

        // 3. Find Target User by Email (Admin API)
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) throw listError

        const targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!targetUser) {
            return NextResponse.json({ error: "User not found. Ask them to sign up first as Individual." }, { status: 404 })
        }

        // 4. Link User to Org
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                org_id: orgId,
                role: 'ORG_MEMBER'
            })
            .eq('id', targetUser.id)

        if (profileError) throw profileError

        return NextResponse.json({ success: true, user: { id: targetUser.id, email: targetUser.email } })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
