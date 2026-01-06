'use client'

import classNames from '@/utils/classNames'
import ScrollBar from '@/components/ui/ScrollBar'
import Logo from '@/components/template/Logo'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import useTheme from '@/utils/hooks/useTheme'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import useNavigation from '@/utils/hooks/useNavigation'
import queryRoute from '@/utils/queryRoute'
import appConfig from '@/configs/app.config'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
    SIDE_NAV_CONTENT_GUTTER,
    HEADER_HEIGHT,
    LOGO_X_GUTTER,
} from '@/constants/theme.constant'
import type { Mode } from '@/@types/theme'
import Image from 'next/image'

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
    mode,
}: SideNavProps) => {
    const pathname = usePathname()

    const route = queryRoute(pathname)

    const { navigationTree } = useNavigation()

    const defaultMode = useTheme((state) => state.mode)
    const direction = useTheme((state) => state.direction)
    const sideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)

    const currentRouteKey = route?.key || ''
    const { session } = useCurrentSession()

    return (
        <div
            style={sideNavCollapse ? sideNavCollapseStyle : sideNavStyle}
            className={classNames(
                'side-nav hidden lg:block',
                background && 'side-nav-bg',
                !sideNavCollapse && 'side-nav-expand',
                className,
            )}
        >
            <Link
                href={appConfig.authenticatedEntryPath}
                className="side-nav-header flex flex-col justify-center"
                style={{ height: HEADER_HEIGHT }}
            >
                {/* <div className='text-center text-2xl font-semibold italic text-primary tracking-widest'>Cryptovia</div> */}
                <div className="relative flex items-center w-full h-18 m-1 ml-2 mx-auto gap-2">
                <div
                        className={classNames(
                            'relative w-8 h-8',
                            !sideNavCollapse && 'ml-3',
                        )}
                    >
                        <Image
                            src="/img/logo/logo.png"
                            alt="logo"
                            fill
                            priority
                        />
                    </div>

                    {!sideNavCollapse && (
                        <p className="text-lg font-semibold">bexchange.io</p>
                    )}
                </div>
            </Link>
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
