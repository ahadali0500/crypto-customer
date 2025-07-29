import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import Image from 'next/image'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number
    logoHeight?: number
}

const LOGO_SRC_PATH = '/img/logo/'

const Logo = (props: LogoProps) => {
    const {
        type = 'full',
        mode = 'light',
        className,
        imgClass,
        style,
        logoWidth,
        logoHeight,
    } = props

    // Fixed width and height calculations to maintain proper aspect ratio
    const width = logoWidth || (type === 'full' ? 150 : 60)
    const height = logoHeight || (type === 'full' ? 150 : 60)

    return (
        <div className={classNames('logo', className)} style={style}>
            {mode === 'light' && (
                <>
                    <Image
                        className={classNames(
                            '',
                            type === 'full' ? '' : 'hidden',
                            imgClass,
                        )}
                        src={`${LOGO_SRC_PATH}logo.png`}
                        alt={`${APP_NAME} logo`}
                        width={width}
                        height={height}
                        priority
                    />
                    <Image
                        className={classNames(
                            '',
                            type === 'streamline' ? '' : 'hidden',
                            imgClass,
                        )}
                        src={`${LOGO_SRC_PATH}logo.png`}
                        alt={`${APP_NAME} logo`}
                        width={width}
                        height={height}
                        priority
                    />
                </>
            )}
            {mode === 'dark' && (
                <>
                    <Image
                        className={classNames(
                            type === 'full' ? '' : 'hidden',
                            imgClass,
                        )}
                        src={`${LOGO_SRC_PATH}logo.png`}
                        alt={`${APP_NAME} logo`}
                        width={width}
                        height={height}
                        priority
                    />
                    <Image
                        className={classNames(
                            type === 'streamline' ? '' : 'hidden',
                            imgClass,
                        )}
                        src={`${LOGO_SRC_PATH}logo.png`}
                        alt={`${APP_NAME} logo`}
                        width={width}
                        height={height}
                        priority
                    />
                </>
            )}
        </div>
    )
}

export default Logo