'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import axios from 'axios'
import Dropdown from '@/components/ui/Dropdown'
import ScrollBar from '@/components/ui/ScrollBar'
import Spinner from '@/components/ui/Spinner'
import Tooltip from '@/components/ui/Tooltip'
import Button from '@/components/ui/Button'
import { HiOutlineCurrencyDollar } from 'react-icons/hi'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import Image from 'next/image'

type Balance = {
  id: number
  customerId: number
  currencyId: number
  availableBalance: string
  lockedBalance: string
  createdAt: string
  updatedAt: string
  currency: {
    id: number
    shortName: string
    fullName: string
    icon: string
    type: string
    createdAt: string
    updatedAt: string
  }
}

const dropdownHeight = 'h-[250px]'

const _Currency = ({ className }: { className?: string }) => {
  const [balanceData, setBalanceData] = useState<Balance[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'available' | 'locked'>('available')

  const dropdownRef = useRef<any>(null)

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data?.data) {
        setBalanceData(res.data.data)
      } else {
        setBalanceData([])
        toast.error('Invalid balance data')
      }
    } catch (error: any) {
      console.error('❌ Balance fetch error:', error)
      toast.error(error?.response?.data?.message || 'Error fetching balance data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalance()
  }, [])

  return (
    <div className="relative">
      <Dropdown
        ref={dropdownRef}
        renderTitle={
          <Tooltip title="View Balances">
            <Button
              variant="plain"
              shape="circle"
              size="sm"
              icon={<HiOutlineCurrencyDollar className="text-xl" />}
              className={className}
            />
          </Tooltip>
        }
        menuClass={`
          min-w-[260px] 
          md:min-w-[320px]
          absolute right-0
          transform -translate-x-0
          max-w-[calc(100vw-2rem)]
          
          rounded-md shadow-lg
          p-2
        `}
        placement="bottom-end"
        onOpen={fetchBalance}
        menuStyle={{
          right: '0',
          left: 'auto',
          transformOrigin: 'right top',
        }}
      >
        <Dropdown.Item variant="header">
          <div className="dark:border-gray-700 px-2 mb-2">
            <h6 className="font-semibold">Balance</h6>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => setActiveTab('available')}
                className={classNames(
                  'text-xs font-medium px-3 py-1 rounded-md',
                  activeTab === 'available' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
                )}
              >
                Available
              </button>
              <button
                onClick={() => setActiveTab('locked')}
                className={classNames(
                  'text-xs font-medium px-3 py-1 rounded-md',
                  activeTab === 'locked' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
                )}
              >
                Locked
              </button>
            </div>
          </div>
        </Dropdown.Item>

        <ScrollBar className={classNames('overflow-y-auto dark:bg-gray-800 rounded-lg p-1', dropdownHeight)}>
          {loading ? (
            <div className={classNames('flex items-center justify-center', dropdownHeight)}>
              <Spinner size={40} />
            </div>
          ) : balanceData.length > 0 ? (
            balanceData.map((item) => {
              const balance = activeTab === 'available' ? item.availableBalance : item.lockedBalance
              const balanceUSD =
                activeTab === 'available'
                  ? item['availableBalanceUSD'] || ''
                  : item['lockedBalanceUSD'] || ''
              // if (parseFloat(balance) <= 0) return null

              return (
                <div
                  key={`${item.id}-${activeTab}`}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={`https://server.bexchange.io/uploads/currency/${item.currency.icon}`}
                      alt={item.currency.shortName || 'Currency'}
                      className="rounded-full w-[24px] h-[24px]"
                    />
                    <div>
                      <div className="font-medium">{item.currency.shortName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.currency.fullName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm  text-gray-500">{parseFloat(balance).toFixed(5)}</div>
                    {balanceUSD && <div className="text-xs text-green-600">${balanceUSD}</div>}
                  </div>
                </div>
              )
            })
          ) : (
            <div className={classNames('flex items-center justify-center', dropdownHeight)}>
              <div className="text-center">
                <h6 className="font-semibold">No balances!</h6>
                <p className="mt-1 text-sm">Please try again later</p>
              </div>
            </div>
          )}
        </ScrollBar>
      </Dropdown>
    </div>
  )
}

const Currency = withHeaderItem(_Currency)

export default Currency
