'use server'

// OAuth disabled - using custom backend auth only
// Re-add NextAuth if you need Google/GitHub login
const handleOauthSignIn = async (_signInMethod: string, _callbackUrl?: string) => {
    throw new Error('OAuth is not configured. Use email/password sign-in.')
}

export default handleOauthSignIn
