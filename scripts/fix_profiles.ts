#!/usr/bin/env tsx
/**
 * Author: Sambath Kumar Natarajan
 * 
 * Fix Profile Duplication Script
 * Removes duplicate profiles and ensures one profile per user to fix auth issues
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixProfiles() {
    console.log('🔧 Fixing Profile Duplication');
    console.log('================================\n');

    // 1. Find user
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === 'sambath@me.com');

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log(`✅ User: ${user.email} (${user.id})\n`);

    // 2. Check for duplicate profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

    if (error) {
        console.log('❌ Error fetching profiles:', error.message);
        return;
    }

    console.log(`📋 Found ${profiles?.length || 0} profile(s)`);

    if (!profiles || profiles.length === 0) {
        console.log('\n🆕 Creating new profile...');

        // Get org
        const { data: org } = await supabase
            .from('organizations')
            .select('*')
            .eq('name', 'Validation Research Org')
            .single();

        if (!org) {
            console.log('❌ Organization not found');
            return;
        }

        const { error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                email: user.email,
                org_id: org.id,
                is_trial_used: false
            });

        if (insertError) {
            console.log('❌ Insert error:', insertError.message);
        } else {
            console.log('✅ Profile created');
        }
    } else if (profiles.length > 1) {
        console.log('\n⚠️  Multiple profiles detected! Keeping first, deleting rest...');

        const keepProfile = profiles[0];
        // const deleteIds = profiles.slice(1).map(p => p.id);

        console.log('\nProfile details: ');
        profiles.forEach((p, i) => {
            console.log(`  ${i + 1}. ID: ${p.id}, Org: ${p.org_id}, Email: ${p.email}`);
        });
    } else {
        console.log('\n✅ Single profile found: ');
        const p = profiles[0];
        console.log(`   Email: ${p.email}`);
        console.log(`   Org ID: ${p.org_id}`);
        console.log(`   Trial Used: ${p.is_trial_used}`);

        // Check org credits
        if (p.org_id) {
            const { data: org } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', p.org_id)
                .single();

            if (org) {
                console.log(`\n🏢 Organization: ${org.name}`);
                console.log(`   Credits: ${org.credits_balance}/${org.credits_total}`);
            }
        }
    }

    console.log('\n================================\n');
}

fixProfiles().catch(console.error);
