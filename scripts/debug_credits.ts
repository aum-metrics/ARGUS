#!/usr/bin/env tsx

/**
 * Debug Credit System
 * Checks actual credit state for sambath@me.com
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugCredits() {
    console.log('🔍 Credit System Debug');
    console.log('================================\n');

    // 1. Find user
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === 'sambath@me.com');

    if (!user) {
        console.log('❌ User not found: sambath@me.com');
        return;
    }

    console.log(`✅ User found: ${user.id}`);
    console.log(`   Email: ${user.email}\n`);

    // 2. Check profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.log('❌ Profile error:', profileError.message);
    } else {
        console.log('📋 Profile:');
        console.log(`   Trial used: ${profile.is_trial_used}`);
        console.log(`   Org ID: ${profile.org_id || 'None'}\n`);
    }

    // 3. Check organization
    if (profile?.org_id) {
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', profile.org_id)
            .single();

        if (orgError) {
            console.log('❌ Org error:', orgError.message);
        } else {
            console.log('🏢 Organization:');
            console.log(`   Name: ${org.name}`);
            console.log(`   Credits Balance: ${org.credits_balance}`);
            console.log(`   Credits Total: ${org.credits_total}`);
            console.log(`   Status: ${org.subscription_status}\n`);
        }
    }

    // 4. Check individual transactions (credits)
    const { count: individualCredits } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'success');

    console.log(`💳 Individual Credits: ${individualCredits || 0}`);

    // 5. Check usage (audit logs)
    const { count: usage } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action', 'THESIS_CONSTRUCTOR');

    console.log(`📊 Usage (THESIS_CONSTRUCTOR calls): ${usage || 0}\n`);

    // 6. Calculate total
    let orgCredits = 0;
    if (profile?.org_id) {
        const { data: org } = await supabase
            .from('organizations')
            .select('credits_balance')
            .eq('id', profile.org_id)
            .single();

        if (org) orgCredits = org.credits_balance || 0;
    }

    const totalCredits = (individualCredits || 0) + orgCredits;
    const hasRemainingCredits = totalCredits > (usage || 0);

    console.log('================================');
    console.log('📊 CREDIT CALCULATION:');
    console.log(`   Individual: ${individualCredits || 0}`);
    console.log(`   Organization: ${orgCredits}`);
    console.log(`   Total: ${totalCredits}`);
    console.log(`   Used: ${usage || 0}`);
    console.log(`   Remaining: ${totalCredits - (usage || 0)}`);
    console.log(`   Has Credits: ${hasRemainingCredits ? '✅ YES' : '❌ NO'}`);
    console.log('================================\n');

    // 7. Check active session
    const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

    if (sessions && sessions.length > 0) {
        console.log('💾 Active Session:');
        console.log(`   ID: ${sessions[0].id}`);
        console.log(`   Payment Status: ${sessions[0].data.paymentStatus}`);
        console.log(`   Created: ${sessions[0].created_at}`);
        console.log(`   Updated: ${sessions[0].updated_at}\n`);
    } else {
        console.log('💾 No active sessions\n');
    }
}

debugCredits().catch(console.error);
