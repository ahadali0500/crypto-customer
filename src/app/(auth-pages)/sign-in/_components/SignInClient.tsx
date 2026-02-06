'use client'

import SignIn from '@/components/auth/SignIn'

// Custom backend auth - SignInForm handles login via axios directly
// No NextAuth handlers needed
const SignInClient = () => {
    return <SignIn />
}

export default SignInClient
