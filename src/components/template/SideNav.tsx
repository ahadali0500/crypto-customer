'use client'

import classNames from '@/utils/classNames'
import ScrollBar from '@/components/ui/ScrollBar'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import useTheme from '@/utils/hooks/useTheme'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import useNavigation from '@/utils/hooks/useNavigation'
import queryRoute from '@/utils/queryRoute'
import appConfig from '@/configs/app.config'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
    HEADER_HEIGHT,
} from '@/constants/theme.constant'

import type { Mode } from '@/@types/theme'

type SideNavProps = {
    translationSetup?: boolean
    background?: boolean
    className?: string
    contentClass?: string
    currentRouteKey?: string
    mode?: Mode
}

const sideNavStyle = {
    width: SIDE_NAV_WIDTH,
    minWidth: SIDE_NAV_WIDTH,
}

const sideNavCollapseStyle = {
    width: SIDE_NAV_COLLAPSED_WIDTH,
    minWidth: SIDE_NAV_COLLAPSED_WIDTH,
}

const SideNav = ({
    translationSetup = appConfig.activeNavTranslation,
    background = true,
    className,
    contentClass,
}: SideNavProps) => {
    const pathname = usePathname()
    const route = queryRoute(pathname)

    const { navigationTree } = useNavigation()
    const { session } = useCurrentSession()

    const direction = useTheme((state) => state.direction)
    const sideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)

    const currentRouteKey = route?.key || ''

    return (
        <div
            style={sideNavCollapse ? sideNavCollapseStyle : sideNavStyle}
            className={classNames(
                'side-nav hidden lg:block transition-all duration-300',
                background && 'side-nav-bg',
                !sideNavCollapse && 'side-nav-expand',
                className,
            )}
        >
            {/* Logo Section */}
            <Link
                href={appConfig.authenticatedEntryPath}
                className="side-nav-header flex items-center"
                style={{ height: HEADER_HEIGHT }}
            >
                <div
                    className={classNames(
                        'flex items-center w-full h-full',
                        sideNavCollapse
                            ? 'justify-center'
                            : 'px-4 gap-3'
                    )}
                >
                    <div className="relative w-8 h-8">
                        <Image
                            src="/img/logo/logo.png"
                            alt="logo"
                            fill
                            priority
                        />
                    </div>

                    {!sideNavCollapse && (
                        <p className="text-lg font-semibold whitespace-nowrap">
                            bexchange.io
                        </p>
                    )}
                </div>
            </Link>

            {/* Navigation Section */}
            <div className={classNames('side-nav-content', contentClass)}>
                <ScrollBar style={{ height: '100%' }} direction={direction}>
                    <VerticalMenuContent
                        collapsed={sideNavCollapse}
                        navigationTree={navigationTree}
                        routeKey={currentRouteKey}
                        direction={direction}
                        translationSetup={translationSetup}
                        userAuthority={session?.user?.authroity || []}
                    />
                </ScrollBar>
            </div>
        </div>
    )
}

export default SideNav