'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import appConfig from '@/configs/app.config'

interface AuthGuardProps {
    children: React.ReactNode
}

/**
 * Client-side authentication guard
 * Checks for NextAuth session OR authToken in localStorage
 * and redirects to login if neither is found
 */
const AuthGuard = ({ children }: AuthGuardProps) => {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        // Wait for session check to complete
        if (status === 'loading') {
            return
        }

        // Check if NextAuth session exists
        if (session?.user) {
            setIsChecking(false)
            return
        }

        // If no NextAuth session, check for token in localStorage (custom auth)
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

        if (!token) {
            // No session and no token found, redirect to login
            router.push(appConfig.unAuthenticatedEntryPath)
            return
        }

        // Token exists, allow access
        setIsChecking(false)
    }, [session, status, router])

    // Show nothing while checking (prevents flash of content)
    if (isChecking || status === 'loading') {
        return null
    }

    return <>{children}</>
}

export default AuthGuard

