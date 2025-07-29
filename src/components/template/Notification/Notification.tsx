'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import classNames from 'classnames'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Dropdown from '@/components/ui/Dropdown'
import ScrollBar from '@/components/ui/ScrollBar'
import Spinner from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import NotificationAvatar from './NotificationAvatar'
import NotificationToggle from './NotificationToggle'
import { HiOutlineMailOpen } from 'react-icons/hi'
import isLastChild from '@/utils/isLastChild'
import useResponsive from '@/utils/hooks/useResponsive'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import type { DropdownRef } from '@/components/ui/Dropdown'
import { initnotificationSocket } from '@/configs/socket'
import { useSessionContext } from '@/components/auth/AuthProvider/SessionContext'

type NotificationList = {
    id: string
    message: string
    createdAt: string
    seen: string
    type: string
    adminId: string | null
    customerId: string | null
    readed: boolean
}

const notificationHeight = 'h-[280px]'

const _Notification = ({ className }: { className?: string }) => {
    const { session } = useSessionContext()
    const [notificationList, setNotificationList] = useState<NotificationList[]>([])
    const [unreadNotification, setUnreadNotification] = useState(false)
    const [noResult, setNoResult] = useState(false)
    const [loading, setLoading] = useState(false)
    const [notificationCount, setNotificationCount] = useState(0)

    const { larger } = useResponsive()
    const router = useRouter()
    const notificationDropdownRef = useRef<DropdownRef>(null)
    const socketRef = useRef<any>(null)

    const getNotificationList = useCallback(async () => {
        try {
            setLoading(true)
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
            const resp = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/notification/fetch`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = resp.data?.data || []
            const mappedData = data.map((item: any) => ({
                id: item.id.toString(),
                message: item.message,
                createdAt: item.createdAt,
                seen: item.seen,
                type: item.type,
                adminId: item.adminId,
                customerId: item.customerId,
                readed: item.seen === 'yes'
            }))
            
            setNotificationList(mappedData)
            setUnreadNotification(mappedData.some(item => !item.readed))
            setNoResult(mappedData.length === 0)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching notification list:', error)
            setNotificationList([])
            setNoResult(true)
            setLoading(false)
        }
    }, [])

    const markNotificationAsRead = async (id: string) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
            const formData = new FormData()
            formData.append('id', id)

            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/notification`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            setNotificationList(prevList => 
                prevList.map(item => 
                    item.id === id ? { ...item, readed: true } : item
                )
            )

            // Update unread count and badge
            const stillUnread = notificationList.some(item => !item.readed && item.id !== id)
            if (!stillUnread) {
                setUnreadNotification(false)
                setNotificationCount(0)
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const markAllNotificationsAsRead = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
            const unreadIds = notificationList.filter(item => !item.readed).map(item => item.id)

            if (unreadIds.length === 0) return

            await Promise.all(unreadIds.map(id => {
                const formData = new FormData()
                formData.append('id', id)
                return axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/notification`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                })
            }))

            setNotificationList(prevList => 
                prevList.map(item => ({ ...item, readed: true }))
            )
            setUnreadNotification(false)
            setNotificationCount(0)
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
        }
    }

    useEffect(() => {
        if (session?.user?.id) {
            const socket = initnotificationSocket(session.user.id)
            socketRef.current = socket

            const handleNewNotification = (data: any) => {
                // console.log('🔔 New notification received:', data)
                setNotificationCount(prev => prev + 1)
                setUnreadNotification(true)
                setNoResult(false)

                const newNotification: NotificationList = {
                    id: data.id.toString(),
                    message: data.message,
                    createdAt: data.createdAt,
                    seen: 'no',
                    type: data.type,
                    adminId: data.adminId,
                    customerId: data.customerId,
                    readed: false
                }
                
                setNotificationList(prev => [newNotification, ...prev])
            }

            const handleConnect = () => console.log('🔌 Connected to notification socket')
            const handleDisconnect = () => console.log('❌ Disconnected from notification socket')

            socket.on('new_notification', handleNewNotification)
            socket.on('connect', handleConnect)
            socket.on('disconnect', handleDisconnect)

            return () => {
                socket.off('new_notification', handleNewNotification)
                socket.off('connect', handleConnect)
                socket.off('disconnect', handleDisconnect)
                socket.disconnect()
            }
        }
    }, [session?.user?.id])

    useEffect(() => {
        getNotificationList()
    }, [getNotificationList])

    const onNotificationOpen = async () => {
        if (notificationList.length === 0) {
            await getNotificationList()
        }
    }

    const handleViewAllActivity = useCallback(() => {
        router.push('/concepts/account/activity-log')
        notificationDropdownRef.current?.handleDropdownClose()
    }, [router])

    return (
        <div className="relative">
            <Dropdown
                ref={notificationDropdownRef}
                renderTitle={
                    <NotificationToggle
                        dot={unreadNotification || notificationCount > 0}
                        className={className}
                    />
                }
                menuClass={`
                    min-w-[280px] 
                    md:min-w-[340px]
                    absolute right-0
                    transform -translate-x-0
                    max-w-[calc(100vw-2rem)]
                    bg-white dark:bg-gray-800
                    rounded-md shadow-lg
                    p-2
                `}
                placement={larger.md ? 'bottom-end' : 'bottom'}
                onOpen={onNotificationOpen}
                menuStyle={{
                    right: '0',
                    left: 'auto',
                    transformOrigin: 'right top'
                }}
            >
                <Dropdown.Item variant="header">
                    <div className="dark:border-gray-700 px-2 flex items-center justify-between mb-1">
                        <h6>Notifications {notificationCount > 0 && `(${notificationCount})`}</h6>
                        <Tooltip title="Mark all as read">
                            <Button
                                variant="plain"
                                shape="circle"
                                size="sm"
                                icon={<HiOutlineMailOpen className="text-xl" />}
                                disabled={!unreadNotification && notificationCount === 0}
                                onClick={markAllNotificationsAsRead}
                            />
                        </Tooltip>
                    </div>
                </Dropdown.Item>
                
                <ScrollBar className={classNames('overflow-y-auto', notificationHeight)}>
                    {loading ? (
                        <div className={classNames('flex items-center justify-center', notificationHeight)}>
                            <Spinner size={40} />
                        </div>
                    ) : notificationList.length > 0 ? (
                        notificationList.map((item, index) => (
                            <div key={item.id}>
                                <div
                                    className={`relative rounded-xl flex px-4 py-3 cursor-pointer hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-gray-700 ${
                                        !item.readed ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                                    onClick={() => markNotificationAsRead(item.id)}
                                >
                                    {/* <div>
                                        <NotificationAvatar notification={item} />
                                    </div> */}
                                    <div className="mx-3 flex-1">
                                        <div className="flex flex-col">
                                            <span className={!item.readed ? 'font-medium' : ''}>
                                                {item.message}
                                            </span>
                                            <span className="text-xs opacity-70 mt-1">
                                                {new Date(item.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    {!item.readed && (
                                        <Badge
                                            className="absolute top-4 ltr:right-4 rtl:left-4 mt-1.5"
                                            innerClass="bg-primary"
                                        />
                                    )}
                                </div>
                                {!isLastChild(notificationList, index) && (
                                    <div className="border-b border-gray-200 dark:border-gray-700 my-2" />
                                )}
                            </div>
                        ))
                    ) : noResult ? (
                        <div className={classNames('flex items-center justify-center', notificationHeight)}>
                            <div className="text-center">
                                <h6 className="font-semibold">No notifications!</h6>
                                <p className="mt-1">Please try again later</p>
                            </div>
                        </div>
                    ) : null}
                </ScrollBar>
                
                {/* <Dropdown.Item variant="header">
                    <div className="pt-4">
                        <Button
                            block
                            size='sm'
                            className='rounded-lg'
                            variant="solid"
                            onClick={handleViewAllActivity}
                        >
                            View All Activity
                        </Button>
                    </div>
                </Dropdown.Item> */}
            </Dropdown>
        </div>
    )
}

const Notification = withHeaderItem(_Notification)

export default Notification