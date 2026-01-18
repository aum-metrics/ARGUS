/**
 * Reset Admin Password
 * Run this to reset the password for admin@argus-thesis.com
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

async function resetAdminPassword() {
    console.log('🔐 Admin Password Reset Tool\n');

    // Get credentials from environment or prompt
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || await question('Supabase URL: ');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || await question('Service Role Key: ');
    const adminEmail = 'admin@argus-thesis.com';
    const newPassword = await question('New password for admin@argus-thesis.com: ');

    if (!supabaseUrl || !serviceKey) {
        console.error('❌ Missing Supabase credentials');
        rl.close();
        process.exit(1);
    }

    if (newPassword.length < 8) {
        console.error('❌ Password must be at least 8 characters');
        rl.close();
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    try {
        // 1. Find the user
        console.log('\n1️⃣  Finding user...');
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const adminUser = users.find(u => u.email === adminEmail);

        if (!adminUser) {
            console.error(`❌ User ${adminEmail} not found`);
            rl.close();
            process.exit(1);
        }

        console.log(`✅ Found user: ${adminUser.id}`);

        // 2. Update password
        console.log('\n2️⃣  Updating password...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            adminUser.id,
            { password: newPassword }
        );

        if (updateError) {
            console.error('❌ Failed to update password:', updateError.message);
            rl.close();
            process.exit(1);
        }

        console.log('✅ Password updated successfully!');

        // 3. Verify profile exists with SUPER_ADMIN role
        console.log('\n3️⃣  Verifying profile...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', adminUser.id)
            .single();

        if (profileError || !profile) {
            console.log('⚠️  Profile not found, creating...');
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: adminUser.id,
                    email: adminEmail,
                    full_name: 'System Super Admin',
                    role: 'SUPER_ADMIN',
                    is_trial_used: true
                });

            if (insertError) {
                console.error('❌ Failed to create profile:', insertError.message);
            } else {
                console.log('✅ Profile created with SUPER_ADMIN role');
            }
        } else if (profile.role !== 'SUPER_ADMIN') {
            console.log('⚠️  Updating role to SUPER_ADMIN...');
            const { error: roleError } = await supabase
                .from('profiles')
                .update({ role: 'SUPER_ADMIN' })
                .eq('id', adminUser.id);

            if (roleError) {
                console.error('❌ Failed to update role:', roleError.message);
            } else {
                console.log('✅ Role updated to SUPER_ADMIN');
            }
        } else {
            console.log('✅ Profile exists with SUPER_ADMIN role');
        }

        console.log('\n🎉 Admin account is ready!\n');
        console.log('Login credentials:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${newPassword}`);
        console.log('\nYou can now login at: https://www.argus-thesis.com/login\n');

    } catch (error: any) {
        console.error('❌ Unexpected error:', error.message);
        rl.close();
        process.exit(1);
    }

    rl.close();
}

resetAdminPassword();
