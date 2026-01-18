/**
 * Create Super Admin Account in Production
 * Run this ONCE to create admin@argus-thesis.com in production Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Use production Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ADMIN_EMAIL = 'admin@argus-thesis.com';
const ADMIN_PASSWORD = 'super_secret_admin_argus_2026!'; // Change this!

async function createSuperAdmin() {
    console.log('🔧 Creating Super Admin Account...\n');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('❌ Missing environment variables!');
        console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    try {
        // 1. Check if admin already exists
        console.log('1️⃣  Checking if admin exists...');
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const adminExists = existingUsers?.users.find(u => u.email === ADMIN_EMAIL);

        if (adminExists) {
            console.log('✅ Admin user already exists:', adminExists.id);
            console.log('   Email:', adminExists.email);

            // Update profile to ensure SUPER_ADMIN role
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: 'SUPER_ADMIN' })
                .eq('id', adminExists.id);

            if (updateError) {
                console.error('⚠️  Could not update profile role:', updateError.message);
            } else {
                console.log('✅ Profile role updated to SUPER_ADMIN');
            }

            console.log('\n✅ Super admin is ready!');
            console.log('   Email:', ADMIN_EMAIL);
            console.log('   Password: (use your existing password)');
            return;
        }

        // 2. Create admin user
        console.log('2️⃣  Creating admin user...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            email_confirm: true, // Auto-confirm
            user_metadata: {
                full_name: 'ARGUS Super Admin',
                role: 'SUPER_ADMIN'
            }
        });

        if (createError) {
            console.error('❌ Failed to create user:', createError.message);
            process.exit(1);
        }

        console.log('✅ User created:', newUser.user.id);

        // 3. Create profile
        console.log('3️⃣  Creating profile...');
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: newUser.user.id,
                email: ADMIN_EMAIL,
                full_name: 'ARGUS Super Admin',
                role: 'SUPER_ADMIN',
                is_trial_used: true // Admin doesn't need trial
            });

        if (profileError) {
            console.error('❌ Failed to create profile:', profileError.message);
            process.exit(1);
        }

        console.log('✅ Profile created with SUPER_ADMIN role');

        // 4. Success!
        console.log('\n🎉 Super Admin Created Successfully!\n');
        console.log('Login credentials:');
        console.log('   Email:', ADMIN_EMAIL);
        console.log('   Password:', ADMIN_PASSWORD);
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');
        console.log('   Go to: https://www.argus-thesis.com/login');

    } catch (error: any) {
        console.error('❌ Unexpected error:', error.message);
        process.exit(1);
    }
}

createSuperAdmin();
