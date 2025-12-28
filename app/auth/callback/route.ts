import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // The `/auth/callback` route is required for the server-side auth flow to work properly.
    // The code exchange happens here, exchanging the auth code for a session.
    // https://supabase.com/docs/guides/auth/server-side/nextjs

    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient(); // Use the server client

        // Exchange the code for a session. 
        // This authenticates the user within the Next.js middleware/server context.
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Forward to the intended destination (or dashboard)
            return NextResponse.redirect(`${requestUrl.origin}${next}`);
        }
    }

    // Return the user to an error page with instructions if handling fails
    return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_code_error`);
}
