/**
 * Reset trial status for a user
 * Usage: npx ts-node scripts/reset_trial.ts <email>
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetTrial(email: string) {
    console.log(`\n🔄 Resetting trial for: ${email}\n`);

    // Get user
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
        console.error('❌ User not found:', email);
        return;
    }

    console.log('✅ Found user:', profile.email);
    console.log('   Current trial status:', profile.is_trial_used ? 'USED ❌' : 'AVAILABLE ✅');

    // Reset trial
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_trial_used: false })
        .eq('email', email);

    if (updateError) {
        console.error('❌ Failed to reset trial:', updateError.message);
        return;
    }

    console.log('\n✅ Trial reset successfully!');
    console.log('   User can now use free trial again\n');
}

const email = process.argv[2];

if (!email) {
    console.error('Usage: npx ts-node scripts/reset_trial.ts <email>');
    process.exit(1);
}

resetTrial(email).then(() => process.exit(0));
