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
        const { email, orgId, inviterId } = await req.json()

        if (!email || !orgId) {
            return NextResponse.json({ error: "Missing Email or OrgID" }, { status: 400 })
        }

        // Check if inviter is Admin (Optional security check)
        // ...

        // 1. Find User by Email (Admin API)
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) throw listError

        // Manual filter because listUsers doesn't support eq email easily in all versions? 
        // actually getUserById is better, but strictly we don't have ID.
        // listUsers is fine for small scale. 
        // Better: supabaseAdmin.rpc? No.

        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!user) {
            return NextResponse.json({ error: "User not found. Ask them to sign up first as Individual." }, { status: 404 })
        }

        // 2. Link User to Org
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                org_id: orgId,
                role: 'ORG_MEMBER'
            })
            .eq('id', user.id)

        if (profileError) throw profileError

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email } })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
