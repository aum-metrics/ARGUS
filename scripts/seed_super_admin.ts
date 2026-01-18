
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load Env
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) process.env[k] = envConfig[k];

// Service Role Key is required for Admin actions (User Creation + RLS Bypass)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = 'admin@argus-thesis.com';
const ADMIN_PASSWORD = 'super_secret_admin_argus_2026!'; // Strong password

async function seedSuperAdmin() {
    console.log("🚀 Seeding Super Admin...");

    try {
        // 1. Check if user exists
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        let userId = users.find((u: any) => u.email === ADMIN_EMAIL)?.id;

        if (userId) {
            console.log(`ℹ️  User ${ADMIN_EMAIL} already exists. Updating password...`);
            const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
                password: ADMIN_PASSWORD,
                user_metadata: { full_name: 'System Super Admin' }
            });
            if (updateError) throw updateError;
        } else {
            console.log(`🆕 Creating new Super Admin user...`);
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                email_confirm: true,
                user_metadata: { full_name: 'System Super Admin' }
            });
            if (createError) throw createError;
            userId = newUser.user.id;
        }

        // 2. Assign SUPER_ADMIN role
        if (!userId) throw new Error("User ID is missing.");

        // Check if profile exists, if not create it (Trigger usually does this, but we ensure it)
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();

        if (profile) {
            console.log(`ℹ️  Updating Profile Role to SUPER_ADMIN...`);
            const { error: profileError } = await supabase.from('profiles').update({
                role: 'SUPER_ADMIN',
                updated_at: new Date().toISOString()
            }).eq('id', userId);
            if (profileError) throw profileError;
        } else {
            console.log(`🆕 Inserting Profile with SUPER_ADMIN role...`);
            const { error: profileError } = await supabase.from('profiles').insert({
                id: userId,
                role: 'SUPER_ADMIN',
                email: ADMIN_EMAIL, // Some schemas duplicate email for ease
                full_name: 'System Super Admin'
            });
            // Don't fail if duplicate (race condition with trigger)
            if (profileError && !profileError.message.includes('duplicate')) throw profileError;
        }

        console.log("\n✅ SUPER ADMIN CREATED SUCCESSFULLY");
        console.log("------------------------------------------------");
        console.log(`📧 Email:    ${ADMIN_EMAIL}`);
        console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
        console.log("------------------------------------------------");
        console.log("NOTE: Use this account to log in. You have db-level 'SUPER_ADMIN' role.");

    } catch (e) {
        console.error("❌ Seed Failed:", e);
        process.exit(1);
    }
}

seedSuperAdmin();
