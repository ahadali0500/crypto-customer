'use client'

import dynamic from 'next/dynamic'
import { ApexOptions } from 'apexcharts'
import { useState } from 'react'
import classNames from 'classnames'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface BalanceItem {
  id: number
  customerId: number
  currencyId: number
  availableBalance: string
  lockedBalance: string
  availableBalanceUSD: string
  lockedBalanceUSD: string
  currency: {
    id: number
    shortName: string
    fullName: string
    icon: string
    type: string
  }
}

interface CardData {
  totalBalanceUSD: string
  lockedBalanceUSD: string
  availableBalanceUSD: string
  data: BalanceItem[]
}

const BalanceCard = ({ cardData }: { cardData: CardData }) => {
  const [activeBalanceTab, setActiveBalanceTab] = useState<'available' | 'locked'>('locked')

  const colorsBase = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#F97316',
    '#06B6D4',
  ]

  const getChartData = () => {
    if (!cardData?.data?.length) return { series: [] as number[], labels: [] as string[], colors: [] as string[] }

    const filteredData = cardData.data.filter((item) => {
      const balance = activeBalanceTab === 'available'
        ? parseFloat(item.availableBalance || '0')
        : parseFloat(item.lockedBalance || '0')
      return balance > 0
    })

    const series = filteredData.map((item) => {
      const usdStr = activeBalanceTab === 'available' ? item.availableBalanceUSD : item.lockedBalanceUSD
      return Number(usdStr || '0')
    })

    const labels = filteredData.map((item) => item.currency.shortName)

    return {
      series,
      labels,
      colors: colorsBase.slice(0, series.length),
    }
  }

  const { series, labels, colors } = getChartData()

  const currencyChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 300,
      width: 150,
    },
    colors,
    labels,
    legend: {
      position: 'bottom',
      labels: { colors: '#6B7280' },
      fontSize: '12px',
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: activeBalanceTab === 'available' ? 'Available' : 'Locked',
              color: '#6B7280',
              fontSize: '14px',
              formatter: () => {
                const totalStr =
                  activeBalanceTab === 'available'
                    ? cardData?.availableBalanceUSD || '0'
                    : cardData?.lockedBalanceUSD || '0'

                // already formatted string like "12.34" -> display directly
                return `$${totalStr}`
              },
            },
          },
        },
      },
    },
    stroke: {
      show: false,
      width: 0,
    },
    tooltip: {
      y: {
        formatter: (val) => `$${Number(val).toFixed(2)}`,
      },
    },
  }

  return (
    <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3">Balance</h3>

        <div className="flex space-x-2">
          <button
            onClick={() => setActiveBalanceTab('locked')}
            className={classNames(
              'text-xs font-medium px-3 py-2 rounded-md transition-colors',
              activeBalanceTab === 'locked'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
            )}
          >
            Locked
          </button>

          <button
            onClick={() => setActiveBalanceTab('available')}
            className={classNames(
              'text-xs font-medium px-3 py-2 rounded-md transition-colors',
              activeBalanceTab === 'available'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
            )}
          >
            Available
          </button>
        </div>
      </div>

      <div className="relative">
        {series.length > 0 ? (
          <Chart
            key={activeBalanceTab}
            options={currencyChartOptions}
            series={series}
            type="donut"
            height={250}
          />
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <p className="text-lg font-medium">No {activeBalanceTab} balance</p>
              <p className="text-sm">No currencies have {activeBalanceTab} balance</p>
            </div>
          </div>
        )}
      </div>

      {series.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="max-h-32 overflow-y-auto scrollbar-thumb-gray-500 scrollbar-track-gray-700 scrollbar-thin">
            {cardData.data.map((item, index) => {
              const balance =
                activeBalanceTab === 'available'
                  ? parseFloat(item.availableBalance || '0')
                  : parseFloat(item.lockedBalance || '0')

              const balanceUSDStr =
                activeBalanceTab === 'available'
                  ? item.availableBalanceUSD
                  : item.lockedBalanceUSD

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colorsBase[index] || '#888' }}
                    />
                    <img
                      src={item.currency.icon}
                      alt={item.currency.shortName}
                      className="w-4 h-4 rounded-full"
                    />
                    <span className="text-sm font-medium">{item.currency.shortName}</span>
                  </div>

                  <div className="text-right">
                    <div className={classNames('text-sm', { 'text-red-500': balance < 0 })}>
                      {balance.toFixed(6)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${balanceUSDStr || '0.00'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default BalanceCard
