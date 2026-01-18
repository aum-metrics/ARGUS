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

        // 3. Find OR CREATE Target User
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) throw listError

        let targetUser = users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
        let createdNew = false;
        const tempPassword = "TempPassword123!"

        if (!targetUser) {
            // Auto-provision logic requested by user
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: tempPassword,
                email_confirm: true, // Auto-confirm for enterprise speed
                user_metadata: { source: 'org_invite', org_id: orgId }
            })

            if (createError) throw createError
            targetUser = newUser.user
            createdNew = true
        }

        if (!targetUser) throw new Error("Failed to find or create user")

        // 4. Link User to Org
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                org_id: orgId,
                role: 'ORG_MEMBER'
            })
            .eq('id', targetUser.id)

        if (profileError) throw profileError

        return NextResponse.json({
            success: true,
            user: { id: targetUser.id, email: targetUser.email },
            created: createdNew,
            tempPassword: createdNew ? tempPassword : null
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
