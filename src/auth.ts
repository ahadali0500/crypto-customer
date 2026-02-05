import NextAuth from 'next-auth'
import appConfig from '@/configs/app.config'
import authConfig from '@/configs/auth.config'
export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: appConfig.unAuthenticatedEntryPath, // ✅ Correct: /sign-in
        error: appConfig.unAuthenticatedEntryPath,  // ✅ Correct: /sign-in
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
            
            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }
            return true
        },
    },
    ...authConfig,
})