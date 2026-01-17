// Force dynamic rendering to avoid build-time Supabase errors
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
