'use client'

import { createContext, useContext } from 'react'

type User = {
    id?: string
    name?: string
    email?: string
    image?: string
    token?: string
    [key: string]: any
}

export type Session = {
    user?: User
    expires?: string
} | null

interface SessionContextType {
    session: Session
    setSession: (session: Session) => void
}

const SessionContext = createContext<SessionContextType>({
    session: null,
    setSession: () => {},
})

export const useSessionContext = () => useContext(SessionContext)

export default SessionContext
