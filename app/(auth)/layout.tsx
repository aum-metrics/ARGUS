/**
 * Author: Sambath Kumar Natarajan
 */

// Force dynamic rendering for auth pages to avoid build-time Supabase errors
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md p-4">
                {children}
            </div>
        </div>
    )
}
