import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Custom backend auth - all route protection is handled client-side by AuthGuard (checks localStorage token)
// Middleware just passes through - no server-side session with custom auth
export function middleware(_request: NextRequest) {
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
        '/(api|trpc)(.*)',
    ],
}
