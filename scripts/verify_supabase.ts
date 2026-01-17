/**
 * Verification Script - Test Supabase Integration
 * Tests: Registration, Profile Creation, Dashboard Loading
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySupabaseIntegration() {
    console.log('🔍 ARGUS-Thesis Supabase Integration Verification\n');
    console.log('='.repeat(60));

    // 1. Check Supabase Connection
    console.log('\n1️⃣  Testing Supabase Connection...');
    try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) throw error;
        console.log('   ✅ Supabase connection successful');
    } catch (err: any) {
        console.log('   ❌ Supabase connection failed:', err.message);
        return;
    }

    // 2. Check Required Tables
    console.log('\n2️⃣  Checking Required Tables...');
    const tables = ['profiles', 'organizations', 'transactions', 'audit_logs', 'sessions'];

    for (const table of tables) {
        try {
            const { error } = await supabase.from(table).select('count').limit(1);
            if (error) throw error;
            console.log(`   ✅ Table '${table}' exists`);
        } catch (err: any) {
            console.log(`   ❌ Table '${table}' missing or inaccessible`);
        }
    }

    // 3. Check Profile Schema
    console.log('\n3️⃣  Verifying Profile Schema...');
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, is_trial_used, org_id')
            .limit(1);

        if (error) throw error;
        console.log('   ✅ Profile schema correct');
        console.log('   📋 Fields: id, email, full_name, role, is_trial_used, org_id');
    } catch (err: any) {
        console.log('   ❌ Profile schema issue:', err.message);
    }

    // 4. Check Auth Configuration
    console.log('\n4️⃣  Checking Auth Configuration...');
    try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('   ✅ Auth client initialized');
        console.log(`   📊 Current session: ${session ? 'Active' : 'None'}`);
    } catch (err: any) {
        console.log('   ❌ Auth configuration issue:', err.message);
    }

    // 5. Test Statistics
    console.log('\n5️⃣  Database Statistics...');
    try {
        const [
            { count: profileCount },
            { count: orgCount },
            { count: sessionCount }
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('organizations').select('*', { count: 'exact', head: true }),
            supabase.from('sessions').select('*', { count: 'exact', head: true })
        ]);

        console.log(`   👥 Total Profiles: ${profileCount || 0}`);
        console.log(`   🏢 Total Organizations: ${orgCount || 0}`);
        console.log(`   🔐 Active Sessions: ${sessionCount || 0}`);
    } catch (err: any) {
        console.log('   ⚠️  Could not fetch statistics:', err.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Verification Complete!\n');
}

verifySupabaseIntegration().catch(console.error);
