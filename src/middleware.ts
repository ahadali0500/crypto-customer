import { auth } from '@/auth'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'

// Define your protected routes
const protectedRoutes = [
    '/create-ticket',
    '/dashboard', 
    '/deposit',
    '/exchange',
    '/home',
    '/invoice',
    '/transactions',
    '/view-ticket',
    '/withdrawal'
]


// Define public routes (accessible without login)
const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms-and-conditions',
    '/pricing',
    '/faqs',
    // Add your public routes here
]

// Define auth routes (sign-in, sign-up, etc.)
const authRoutes = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password'
]

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth

    const pathname = nextUrl.pathname

    // Check route types
    const isApiAuthRoute = pathname.startsWith('/api/auth')
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
    const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
    const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))


    // Don't run middleware on API auth routes
    if (isApiAuthRoute) {
      
        return
    }

    // If user is logged in and tries to access auth routes (sign-in, sign-up)
    if (isAuthRoute && isLoggedIn) {
      
        return Response.redirect(new URL(appConfig.authenticatedEntryPath, nextUrl))
    }

    // If accessing protected route without NextAuth session
    // Note: We allow the request through and let AuthGuard handle client-side token checks
    // This supports both NextAuth sessions and custom token-based auth (localStorage)
    if (isProtectedRoute && !isLoggedIn) {
       
        // AuthGuard will check for localStorage token and redirect if needed
        return
    }

    // Allow access to public routes
    if (isPublicRoute) {
        
        return
    }

    // Allow access to auth routes when not logged in
    if (isAuthRoute && !isLoggedIn) {
       
        return
    }

    // Allow access to protected routes when logged in
    if (isProtectedRoute && isLoggedIn) {
        
        return
    }

    
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}