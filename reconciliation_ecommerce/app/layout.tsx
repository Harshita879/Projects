import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Stripe Reconciliation',
    description: 'E-commerce payment reconciliation tool',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
