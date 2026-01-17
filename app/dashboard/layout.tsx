/**
 * Author: Sambath Kumar Natarajan
 */

// Force dynamic rendering for dashboard pages to avoid build-time Supabase errors
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
        </>
    )
}
