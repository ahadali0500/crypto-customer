'use client'

import { createContext, useContext, useState } from 'react'
import type { User } from 'next-auth'

type Session = {
    user?: User & Record<string, any>
    expires: string
}

interface SessionContextType {
    session: Session | null
    setSession: (session: Session | null) => void
}

const SessionContext = createContext<SessionContextType>({
    session: null,
    setSession: () => {},
})

export const useSessionContext = () => useContext(SessionContext)

export default SessionContext
