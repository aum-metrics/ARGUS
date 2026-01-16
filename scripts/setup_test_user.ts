/**
 * Author: Sambath Kumar Natarajan
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

console.log('Key Preview (Service):', supabaseServiceKey.substring(0, 15) + '...')
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (anonKey) {
    console.log('Key Preview (Anon):   ', anonKey.substring(0, 15) + '...')
    if (anonKey === supabaseServiceKey) {
        console.error('CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is STILL identical to NEXT_PUBLIC_SUPABASE_ANON_KEY!')
    }
}

async function setup() {
    const email = 'sambath@me.com'
    const password = 'testpassword123'
    const orgName = 'Validation Research Org'
    const credits = 10

    console.log(`Setting up test user: ${email}...`)

    // 1. Create or Get User
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Sambath Test', institution: 'Research Lab' }
    })

    let userId: string
    if (userError) {
        console.log('User creation error:', userError.code, userError.message)
        if (userError.code === 'email_exists' || userError.message.includes('already registered') || userError.message.includes('already exists')) {
            console.log('User already exists, fetching ID using admin.listUsers()...')
            const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

            if (listError) {
                console.error('Failed to list users (check if your service role key is correct):', listError)
                throw listError
            }

            const user = existingUsers.users.find(u => u.email === email)
            if (!user) throw new Error('Could not find existing user')
            userId = user.id
            console.log('Found existing user ID:', userId)

            // Force update password to ensure it matches testpassword123
            console.log('Updating password for existing user...')
            const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { password })
            if (updateError) throw updateError
        } else {
            throw userError
        }
    } else {
        userId = userData.user.id
        console.log('Created new user ID:', userId)
    }

    // 2. Create or Get Org
    console.log(`Setting up organization: ${orgName}...`)

    // Check if org exists
    const { data: existingOrg, error: fetchOrgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('name', orgName)
        .maybeSingle()

    if (fetchOrgError) throw fetchOrgError

    let orgData: any
    if (existingOrg) {
        console.log('Organization already exists, updating credits...')
        const { data: updatedOrg, error: updateOrgError } = await supabase
            .from('organizations')
            .update({ credits_balance: credits, credits_total: credits })
            .eq('id', existingOrg.id)
            .select()
            .single()

        if (updateOrgError) throw updateOrgError
        orgData = updatedOrg
    } else {
        console.log('Creating new organization...')
        const { data: newOrg, error: insertOrgError } = await supabase
            .from('organizations')
            .insert({ name: orgName, credits_balance: credits, credits_total: credits })
            .select()
            .single()

        if (insertOrgError) throw insertOrgError
        orgData = newOrg
    }

    // 3. Create or Update Profile
    console.log('Upserting profile and linking to org...')
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            org_id: orgData.id,
            role: 'ORG_USER',
            email: email // Ensure email is set
        })

    if (profileError) throw profileError

    console.log('--- SETUP COMPLETE ---')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`Org: ${orgName}`)
    console.log(`Credits: ${credits}`)
}

setup().catch(err => {
    console.error('Setup failed:', err)
    process.exit(1)
})
