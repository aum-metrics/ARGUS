
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

async function createSuperAdmin() {
    const email = "help@argus-thesis.com"; // CANONICAL SUPER ADMIN
    const password = "super_secure_admin_password_2026"; // CHANGE THIS

    console.log(`Creating Super Admin: ${email}`);

    // 1. Create User
    let userId;
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "ARGUS SUPER ADMIN" }
    });

    if (createError) {
        // If exists, fetch ID
        if (createError.message.includes("already registered")) {
            console.log("User exists. Fetching...");
            // We can't easily fetch by email with admin api without listUsers
            const { data: users } = await supabase.auth.admin.listUsers();
            userId = users.users.find(u => u.email === email)?.id;
        } else {
            throw createError;
        }
    } else {
        userId = newUser.user.id;
    }

    if (!userId) throw new Error("Could not determine User ID");

    console.log(`User ID: ${userId}`);

    // 2. Force Profile Role to SUPER_ADMIN (New Role)
    // We update the profile or insert if missing
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            email: email,
            role: 'SUPER_ADMIN', // NEW ROLE
            org_id: null,
            full_name: "System Governor"
        });

    if (profileError) throw profileError;

    console.log("✅ Super Admin Privileges Granted.");
    console.log(`Credentials:\nEmail: ${email}\nPassword: ${password}`);
}

createSuperAdmin().catch(console.error);
