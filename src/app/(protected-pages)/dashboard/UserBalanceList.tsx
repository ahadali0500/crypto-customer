'use client'
import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import classNames from 'classnames'
import { TrendingDown, TrendingUp, Lock, Unlock, WalletMinimal } from 'lucide-react'

interface BalanceItem {
    id: number
    availableBalance: string
    lockedBalance: string
    currency: {
        shortName: string
        fullName: string
        icon: string
    }
}

const UserBalanceList = ({ data }: { data: BalanceItem[] }) => {
    const [enrichedData, setEnrichedData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchMarketData = useCallback(async () => {
        if (!data || data.length === 0) return
        try {
            const coinIds = data.map(item => item.currency.shortName.toLowerCase()).join(',')

            const marketRes = await axios.get(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`
            )
            const marketData = marketRes.data

            const merged = data.map(item => {
                const market = marketData.find((m: any) => m.id === item.currency.shortName.toLowerCase())
                return {
                    ...item,
                    currentPrice: market?.current_price || 0,
                    priceChange24h: market?.price_change_percentage_24h || 0,
                }
            })

            setEnrichedData(merged)
        } catch (error) {
            console.error("Error fetching balance market data:", error)
            setEnrichedData(data)
        } finally {
            setLoading(false)
        }
    }, [data])

    useEffect(() => {
        fetchMarketData()
        const interval = setInterval(fetchMarketData, 60000)
        return () => clearInterval(interval)
    }, [fetchMarketData])

    // Check if user has no balances or all balances are zero
    const hasNoBalance =
        !data ||
        data.length === 0 ||
        data.every(
            item =>
                parseFloat(item.availableBalance || '0') === 0 &&
                parseFloat(item.lockedBalance || '0') === 0
        )

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Balances</h3>
            </div>

            {hasNoBalance ? (
                <div className="bg-white dark:bg-[#1F2937] border border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#1B2539] flex items-center justify-center">
                        <WalletMinimal size={24} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No Balances Yet</p>
                        <p className="text-xs mt-1">
                            You don't have any funds in your wallet. Deposit or trade to get started.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {enrichedData.map((item) => {
                        const isPositive = item.priceChange24h >= 0

                        return (
                            <div 
                                key={item.id}
                                className="bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#1B2539] transition-all"
                            >
                                {/* Column 1: Coin Info */}
                                <div className="flex items-center gap-3 w-[25%]">
                                    <img src={item.currency.icon} alt="" className="w-9 h-9 rounded-full shadow-sm" />
                                    <div className="truncate">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize truncate">
                                            {item.currency.fullName}
                                        </h4>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">
                                            {item.currency.shortName}
                                        </p>
                                    </div>
                                </div>

                                {/* Column 2: Available Balance */}
                                <div className="flex flex-col items-center w-[15%] text-center">
                                    <span className="text-[9px] text-gray-400 uppercase font-bold mb-1 flex items-center gap-1">
                                        <Unlock size={10} /> Available
                                    </span>
                                    <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200">
                                        {parseFloat(item.availableBalance || '0').toFixed(6)}
                                    </span>
                                </div>

                                {/* Column 3: Locked Balance */}
                                <div className="flex flex-col items-center w-[15%] text-center border-l border-gray-100 dark:border-gray-700">
                                    <span className="text-[9px] text-gray-400 uppercase font-bold mb-1 flex items-center gap-1">
                                        <Lock size={10} /> Locked
                                    </span>
                                    <span className="text-xs font-mono font-bold text-gray-400 dark:text-gray-200">
                                        {parseFloat(item.lockedBalance || '0').toFixed(6)}
                                    </span>
                                </div>

                                {/* Column 4: Price */}
                                <div className="flex flex-col items-center w-[15%] text-center">
                                    <span className="text-[9px] text-gray-400 uppercase font-bold mb-1">Price</span>
                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                        ${item.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {/* Column 5: 24h & Sparkline */}
                                <div className="flex items-center justify-end gap-5 w-[30%]">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[9px] text-gray-400 uppercase font-bold mb-1 text-center">24h Change</p>
                                        <div className={classNames(
                                            "flex items-center justify-center gap-1 text-xs font-bold",
                                            isPositive ? "text-green-500" : "text-red-500"
                                        )}>
                                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            {Math.abs(item.priceChange24h || 0).toFixed(2)}%
                                        </div>
                                    </div>

                                    <div className="w-14 h-7">
                                        <svg viewBox="0 0 100 40" className="w-full h-full">
                                            <path 
                                                d="M0 25 Q 25 35, 50 20 T 100 25" 
                                                fill="none" 
                                                stroke={isPositive ? "#10B981" : "#EF4444"} 
                                                strokeWidth="4" 
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default UserBalanceList