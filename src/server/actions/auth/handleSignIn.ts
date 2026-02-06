'use server'

import type { SignInCredential } from '@/@types/auth'

// Custom backend auth - login is handled by SignInForm via axios
// This is kept for backwards compatibility if referenced elsewhere
export const onSignInWithCredentials = async (
    _credentials: SignInCredential,
    _callbackUrl?: string,
) => {
    return { error: 'Use custom sign-in form' }
}
