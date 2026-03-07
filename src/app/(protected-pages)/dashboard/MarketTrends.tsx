'use client'
import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import classNames from 'classnames'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface MarketCoin {
    id: number | string
    shortName: string
    fullName: string
    icon: string
    type: string
    current_price: number
    price_change: number
    sparkline: number[]
}

const MarketTrends = () => {
    const [trendingData, setTrendingData] = useState<MarketCoin[]>([])
    const [loading, setLoading] = useState(true)

    const fetchMarketTrends = useCallback(async () => {
        try {
            setLoading(true)

            const token =
                typeof window !== 'undefined'
                    ? localStorage.getItem('authToken')
                    : null

            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/markets`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const marketRows = res.data?.data || []

            const normalized: MarketCoin[] = marketRows.map((coin: any) => ({
                id: coin.id,
                shortName: coin.shortName || coin.symbol?.toUpperCase() || '',
                fullName: coin.fullName || coin.name || '',
                icon: coin.image || coin.icon || '',
                type: coin.type || 'Crypto',
                current_price: Number(coin.current_price || 0),
                price_change: Number(
                    coin.price_change_percentage_24h ??
                    coin.price_change ??
                    0
                ),
                sparkline:
                    coin.sparkline_in_7d?.price ||
                    coin.sparkline ||
                    [],
            }))

            setTrendingData(normalized)
        } catch (error) {
            console.error('Error fetching market trends:', error)
            setTrendingData([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMarketTrends()
        const interval = setInterval(fetchMarketTrends, 60000)
        return () => clearInterval(interval)
    }, [fetchMarketTrends])

    if (loading) {
        return <div className="p-4 text-center text-gray-500 text-xs">Loading Markets...</div>
    }

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-white bg-blue-600 rounded-md p-1 shadow-sm">
                    <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-gray-900 dark:text-white">Market Trends</h3>
            </div>

            <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-gray-400 mb-4 px-1">
                <div className="col-span-5">Name</div>
                <div className="col-span-3 text-right">Price</div>
                <div className="col-span-2 text-right text-nowrap pl-2">24h %</div>
                <div className="col-span-2 text-right">Chart</div>
            </div>

            <div className="space-y-6">
                {trendingData.map((coin) => {
                    const isPositive = coin.price_change >= 0

                    return (
                        <div
                            key={coin.id}
                            className="grid grid-cols-12 items-center group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-1 rounded-lg transition-colors"
                        >
                            <div className="col-span-5 flex items-center gap-3 overflow-hidden">
                                <img
                                    src={coin.icon}
                                    className="w-7 h-7 rounded-full shadow-sm"
                                    alt={coin.fullName}
                                />
                                <div className="flex flex-col truncate">
                                    <span className="text-[12px] font-bold dark:text-white truncate capitalize">
                                        {coin.fullName}
                                    </span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-300 font-medium uppercase">
                                        {coin.shortName}
                                    </span>
                                </div>
                            </div>

                            <div className="col-span-3 text-right">
                                <span className="text-[12px] font-bold dark:text-gray-100">
                                    ${coin.current_price.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>

                            <div className="col-span-2 text-right pl-2">
                                <span
                                    className={classNames(
                                        'text-[10px] font-bold flex items-center justify-end gap-1',
                                        isPositive ? 'text-green-500' : 'text-red-500'
                                    )}
                                >
                                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {Math.abs(coin.price_change).toFixed(2)}%
                                </span>
                            </div>

                            <div className="col-span-2 flex justify-end pr-1">
                                <div className="w-12 h-6">
                                    <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                                        <path
                                            d="M0 25 Q 25 35, 50 20 T 100 25"
                                            fill="none"
                                            stroke={isPositive ? '#10B981' : '#EF4444'}
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default MarketTrends