'use client'

import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Link from 'next/link'
import signOut from '@/server/actions/auth/handleSignOut'
import { PiUserDuotone, PiSignOutDuotone } from 'react-icons/pi'
import { CiSettings } from "react-icons/ci"
import type { JSX } from 'react'
import { useSessionContext } from '../auth/AuthProvider/SessionContext'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const dropdownItemList: DropdownList[] = []

const _UserDropdown = () => {
    const { session, setSession } = useSessionContext()
    const router = useRouter()

    const handleSignOut = async () => {
        try {
            localStorage.removeItem('authToken')
            setSession(null)
            await signOut()
            toast.success('Logged out successfully!')
            router.push('/');
        } catch (error) {
            console.log('Logout error:', error)
            toast.error('Error while logging out.')
        }
    }

    const avatarProps = {
        ...(session?.user?.image
            ? { src: session?.user?.image }
            : { icon: <PiUserDuotone /> }),
    }

    return (
        <div className="relative">
            <Dropdown
                className="flex"
                toggleClassName="flex items-center"
                menuClass={`
                    min-w-[220px] 
                    text-left 
                    bg-white dark:bg-gray-800 
                    rounded-md shadow-lg py-1
                    absolute right-0
                    transform -translate-x-0
                    max-w-[calc(100vw-2rem)]
                `}
                renderTitle={
                    <div className="cursor-pointer flex items-center">
                        <Avatar size={32} {...avatarProps} />
                    </div>
                }
                placement="bottom-end"
                menuStyle={{
                    right: '0',
                    left: 'auto',
                    transformOrigin: 'right top'
                }}
            >
                <Dropdown.Item variant="header" className="!text-left hover:bg-transparent">
                    <div className="py-2 px-3 flex items-center gap-3">
                        <Avatar {...avatarProps} />
                        <div className="truncate">
                            <div className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                {session?.user?.name || 'Anonymous'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {session?.user?.email || 'No email available'}
                            </div>
                        </div>
                    </div>
                </Dropdown.Item>
                
                <Dropdown.Item variant="divider" />
                
                {dropdownItemList.map((item) => (
                    <Dropdown.Item
                        key={item.label}
                        eventKey={item.label}
                        className="px-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Link 
                            className="flex h-full w-full px-4 py-2" 
                            href={item.path}
                        >
                            <span className="flex gap-2 items-center w-full">
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </span>
                        </Link>
                    </Dropdown.Item>
                ))}
                
                <Dropdown.Item
                    eventKey="user settings"
                    className="gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => router.push('/user-settings')}
                >
                    <span className="text-xl">
                        <CiSettings />
                    </span>
                    <span>User Settings</span>
                </Dropdown.Item>
                
                <Dropdown.Item
                    eventKey="Sign Out"
                    className="gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleSignOut}
                >
                    <span className="text-xl">
                        <PiSignOutDuotone />
                    </span>
                    <span>Sign Out</span>
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown