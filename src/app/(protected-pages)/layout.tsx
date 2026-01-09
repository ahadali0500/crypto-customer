import React from 'react'
import PostLoginLayout from '@/components/layouts/PostLoginLayout'
import { ReactNode } from 'react'
import AuthGuard from './_components/AuthGuard'

const Layout = async ({ children }: { children: ReactNode }) => {
    // Note: Server-side session check is handled by middleware
    // AuthGuard will handle client-side checks for both NextAuth session and localStorage token
    return (
        <AuthGuard>
            <PostLoginLayout>{children}</PostLoginLayout>
        </AuthGuard>
    )
}

export default Layout
