'use client'
import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import classNames from 'classnames'
import { TrendingDown, TrendingUp } from 'lucide-react' // Added Lucide Icons

interface SystemCurrency {
    id: number
    shortName: string
    fullName: string
    icon: string
    type: string
}

const MarketTrends = () => {
    const [trendingData, setTrendingData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchMarketTrends = useCallback(async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
            
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/fetch?type=Crypto`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const systemCurrencies: SystemCurrency[] = response.data.data

            const coinIds = systemCurrencies.map(c => c.shortName.toLowerCase()).join(',')

            const marketRes = await axios.get(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`
            )
            const marketData = marketRes.data

            const merged = systemCurrencies.map(sys => {
                const market = marketData.find((m: any) => m.id === sys.shortName.toLowerCase())
                return {
                    ...sys,
                    current_price: market?.current_price || 0,
                    price_change: market?.price_change_percentage_24h || 0,
                    sparkline: market?.sparkline_in_7d?.price || []
                }
            })

            setTrendingData(merged)
        } catch (error) {
            console.error("Error fetching market trends:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMarketTrends()
        const interval = setInterval(fetchMarketTrends, 60000)
        return () => clearInterval(interval)
    }, [fetchMarketTrends])

    if (loading) return <div className="p-4 text-center text-gray-500 text-xs">Loading Markets...</div>

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-white bg-blue-600 rounded-md p-1 shadow-sm">
                   <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-gray-900 dark:text-white">Market Trends</h3>
            </div>

            {/* Header */}
            <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-gray-400 mb-4 px-1">
                <div className="col-span-5">Name</div>
                <div className="col-span-3 text-right">Price</div>
                <div className="col-span-2 text-right text-nowrap pl-2">24h %</div>
                <div className="col-span-2 text-right">Chart</div>
            </div>

            <div className="space-y-6">
                {trendingData.map((coin) => {
                    const isPositive = coin.price_change >= 0;
                    
                    return (
                        <div key={coin.id} className="grid grid-cols-12 items-center group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-1 rounded-lg transition-colors">
                            {/* Name Column */}
                            <div className="col-span-5 flex items-center gap-3 overflow-hidden">
                                <img src={coin.icon} className="w-7 h-7 rounded-full shadow-sm" alt="" />
                                <div className="flex flex-col truncate">
                                    <span className="text-[12px] font-bold dark:text-white truncate capitalize">{coin.fullName}</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-300 font-medium uppercase">{coin.shortName}</span>
                                </div>
                            </div>

                            {/* Price Column */}
                            <div className="col-span-3 text-right">
                                <span className="text-[12px] font-bold dark:text-gray-100">
                                    ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* 24h Change Column with Professional Icons */}
                            <div className="col-span-2 text-right pl-2">
                                <span className={classNames(
                                    "text-[10px] font-bold flex items-center justify-end gap-1",
                                    isPositive ? "text-green-500" : "text-red-500"
                                )}>
                                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {Math.abs(coin.price_change).toFixed(2)}%
                                </span>
                            </div>

                            {/* Sparkline Column */}
                            <div className="col-span-2 flex justify-end pr-1">
                                <div className="w-12 h-6">
                                    <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                                        <path 
                                            d="M0 25 Q 25 35, 50 20 T 100 25" 
                                            fill="none" 
                                            stroke={isPositive ? "#10B981" : "#EF4444"} 
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default MarketTrends