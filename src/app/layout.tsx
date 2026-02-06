import AuthProvider from '@/components/auth/AuthProvider'
import ThemeProvider from '@/components/template/Theme/ThemeProvider'
import pageMetaConfig from '@/configs/page-meta.config'
import NavigationProvider from '@/components/template/Navigation/NavigationProvider'
import { getNavigation } from '@/server/actions/navigation/getNavigation'
import { getTheme } from '@/server/actions/theme'
import type { ReactNode } from 'react'
import '@/assets/styles/app.css'
import { ToastContainer } from 'react-toastify'
import HolyLoader from 'holy-loader'

export const metadata = {
    ...pageMetaConfig,
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: ReactNode
}>) {
    const navigationTree = await getNavigation()
    const theme = await getTheme()

    return (
        <>
            <AuthProvider>
                <html
                    className={theme.mode === 'dark' ? 'dark' : 'light'}
                    dir={theme.direction}
                    suppressHydrationWarning
                >
                    <HolyLoader />
                    <body suppressHydrationWarning>
                        <ThemeProvider theme={theme}>
                            <NavigationProvider navigationTree={navigationTree}>
                                {children}
                            </NavigationProvider>
                        </ThemeProvider>
                    </body>
                </html>
            </AuthProvider>
            <ToastContainer />
        </>
    )
}
