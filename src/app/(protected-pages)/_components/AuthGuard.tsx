'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'

interface AuthGuardProps {
    children: React.ReactNode
}

/**
 * Client-side authentication guard for custom backend auth
 * Checks for authToken in localStorage and redirects to login if not found
 */
const AuthGuard = ({ children }: AuthGuardProps) => {
    const router = useRouter()
    const pathname = usePathname()
    const [isChecking, setIsChecking] = useState(true)
    const hasRedirected = useRef(false)

    useEffect(() => {
        if (hasRedirected.current) return

        const token =
            typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

        if (!token) {
            hasRedirected.current = true
            router.replace(
                `${appConfig.unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${encodeURIComponent(pathname || '/dashboard')}`
            )
            return
        }

        setIsChecking(false)
    }, [router, pathname])

    if (isChecking) {
        return null
    }

    return <>{children}</>
}

export default AuthGuard
