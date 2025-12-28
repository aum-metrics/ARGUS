import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    try {
        // Create an authenticated Supabase client in Middleware
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                        response = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Refresh session if expired - required for Server Components
        // We explicitly catch errors here to prevent 500 crashes
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
            console.error("Middleware Auth Verification Error:", error.message)
            // If auth verification fails, treat as unauthenticated
        }

        // ROUTE PROTECTION LOGIC
        // If user is NOT logged in and trying to access /dashboard
        if ((!user || error) && request.nextUrl.pathname.startsWith('/dashboard')) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // If user IS logged in and trying to access /login
        if (user && !error && request.nextUrl.pathname.startsWith('/login')) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }

        return response

    } catch (e) {
        console.error("Critical Middleware Exception:", e)
        // Fail Safe: If something breaks, prevent access to dashboard or allow?
        // Secure Default: Block Access -> Redirect to Login
        if (request.nextUrl.pathname.startsWith('/dashboard')) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // For other routes, let them pass if middleware crashes (to avoid breaking static assets if matcher overlaps)
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        })
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
