
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

async function setupOrgTest() {
    const orgName = "Aum Corp";
    const adminEmail = "admin@org-test.com";
    const memberEmail = "member@org-test.com";
    const password = "password123";

    console.log(`\n--- SETUP: ${orgName} ---`);

    // 1. Create/Get Organization
    let orgId;
    const { data: existingOrg } = await supabase.from('organizations').select('*').eq('name', orgName).maybeSingle();

    if (existingOrg) {
        console.log(`✅ Org exists: ${existingOrg.id}`);
        orgId = existingOrg.id;
    } else {
        const { data: newOrg, error } = await supabase.from('organizations').insert({
            name: orgName,
            credits_balance: 50,
            tier: 'ENTERPRISE'
        }).select().single();

        if (error) throw error;
        console.log(`✅ Created Org: ${newOrg.id}`);
        orgId = newOrg.id;
    }

    // 2. Setup Admin User
    const adminId = await ensureUser(adminEmail, password, "Org Admin");
    await linkProfile(adminId, orgId, 'ORG_ADMIN');
    console.log(`✅ Admin Ready: ${adminEmail}`);

    // 3. Setup Member User
    const memberId = await ensureUser(memberEmail, password, "Org Member");
    await linkProfile(memberId, orgId, 'RESEARCHER');
    console.log(`✅ Member Ready: ${memberEmail}`);

    console.log("\n--- CREDENTIALS ---");
    console.log(`Admin:  ${adminEmail} / ${password}`);
    console.log(`Member: ${memberEmail} / ${password}`);
}

async function ensureUser(email: string, password: string, fullName: string) {
    let userId;
    // Try creating
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
    });

    if (error) {
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
            const { data: users } = await supabase.auth.admin.listUsers();
            const u = users.users.find((x: any) => x.email === email);
            if (!u) throw new Error(`User ${email} exists but not found in list?`);
            userId = u.id;
            // Reset password just in case
            await supabase.auth.admin.updateUserById(userId, { password });
        } else {
            throw error;
        }
    } else {
        userId = data.user.id;
    }
    return userId;
}

async function linkProfile(userId: string, orgId: string, role: string) {
    const { error } = await supabase.from('profiles').upsert({
        id: userId,
        org_id: orgId,
        role: role,
        email: 'placeholder', // will be ignored if exists or we need to fetch real one, but usually profile triggers handle this. 
        // Actually, manual upsert might need valid email if row missing.
        // Let's rely on trigger ideally, but upsert is safer.
    });

    // Explicit update to ensure role/org match
    await supabase.from('profiles').update({
        org_id: orgId,
        role: role
    }).eq('id', userId);
}

setupOrgTest().catch(console.error);
