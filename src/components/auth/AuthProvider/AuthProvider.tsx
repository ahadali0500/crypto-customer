'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import SessionContext from './SessionContext'
import { useState } from 'react'
import type { Session as NextAuthSession } from 'next-auth'

type Session = NextAuthSession | null

type AuthProviderProps = {
    session: Session | null
    children: React.ReactNode
}

const AuthProvider = (props: AuthProviderProps) => {
    const { session: initialSession, children } = props
    const [session, setSession] = useState(initialSession)

    return (
        <NextAuthSessionProvider session={session} refetchOnWindowFocus={false}>
            <SessionContext.Provider value={{ session, setSession }}>
                {children}
            </SessionContext.Provider>
        </NextAuthSessionProvider>
    )
}

export default AuthProvider
