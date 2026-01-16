/**
 * Author: Sambath Kumar Natarajan
 */
#!/usr/bin/env tsx

/**
 * Production Verification Script
 * Verifies all production features are working correctly
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyProduction() {
    console.log('🔍 ARGUS Production Verification');
    console.log('================================
');

    let allPassed = true;

    // 1. Check metadata_logs table exists
    console.log('1. Checking metadata_logs table...');
    const { data: metadataLogs, error: metadataError } = await supabase
        .from('metadata_logs')
        .select('*')
        .limit(1);

    if (metadataError) {
        console.log('   ❌ metadata_logs table not found');
        console.log('   → Run migration: 002_metadata_logs.sql');
        allPassed = false;
    } else {
        console.log('   ✅ metadata_logs table exists');
    }

    // 2. Check api_keys table exists
    console.log('
2. Checking api_keys table...');
    const { data: apiKeys, error: apiKeysError } = await supabase
        .from('api_keys')
        .select('*')
        .limit(1);

    if (apiKeysError) {
        console.log('   ❌ api_keys table not found');
        console.log('   → Run migration: 003_api_integration.sql');
        allPassed = false;
    } else {
        console.log('   ✅ api_keys table exists');
    }

    // 3. Check api_audits table exists
    console.log('
3. Checking api_audits table...');
    const { data: apiAudits, error: apiAuditsError } = await supabase
        .from('api_audits')
        .select('*')
        .limit(1);

    if (apiAuditsError) {
        console.log('   ❌ api_audits table not found');
        console.log('   → Run migration: 003_api_integration.sql');
        allPassed = false;
    } else {
        console.log('   ✅ api_audits table exists');
    }

    // 4. Check environment variables
    console.log('
4. Checking environment variables...');
    const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'GEMINI_API_KEY',
        'NEXT_PUBLIC_RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET'
    ];

    for (const envVar of requiredEnvVars) {
        if (process.env[envVar]) {
            console.log(`   ✅ ${envVar} set`);
        } else {
            console.log(`   ❌ ${envVar} missing`);
            allPassed = false;
        }
    }

    // 5. Check test user exists
    console.log('
5. Checking test user (sambath@me.com)...');
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('email', 'sambath@me.com')
        .single();

    if (profileError || !profile) {
        console.log('   ⚠️  Test user not found');
        console.log('   → Run: npm run setup-test-user');
    } else {
        console.log(`   ✅ Test user exists`);
        if (profile.organizations) {
            console.log(`   ✅ Linked to org: ${profile.organizations.name}`);
            console.log(`   ✅ Credits: ${profile.organizations.credits_remaining}`);
        }
    }

    console.log('
================================');
    if (allPassed) {
        console.log('✅ All checks passed! System is production-ready.');
    } else {
        console.log('❌ Some checks failed. Please address the issues above.');
    }
    console.log('================================
');

    process.exit(allPassed ? 0 : 1);
}

verifyProduction().catch(console.error);
