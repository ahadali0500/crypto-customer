'use client'

import SessionContext from './SessionContext'
import { useState, useEffect } from 'react'

type User = {
    id?: string
    name?: string
    email?: string
    image?: string
    token?: string
    [key: string]: any
}

type Session = {
    user?: User
    expires?: string
} | null

type AuthProviderProps = {
    children: React.ReactNode
}

// Hydrate session from localStorage on mount (for page refresh)
function getStoredSession(): Session | null {
    if (typeof window === 'undefined') return null
    const token = localStorage.getItem('authToken')
    const name = localStorage.getItem('userName')
    const email = localStorage.getItem('userEmail')
    if (!token) return null
    return {
        user: { name: name || undefined, email: email || undefined, token },
        expires: '',
    }
}

const AuthProvider = (props: AuthProviderProps) => {
    const { children } = props
    const [session, setSession] = useState<Session>(null)

    useEffect(() => {
        setSession(getStoredSession())
    }, [])

    return (
        <SessionContext.Provider value={{ session, setSession }}>
            {children}
        </SessionContext.Provider>
    )
}

export default AuthProvider
