'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { X, Bell, Mail, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import * as Switch from '@radix-ui/react-switch' 

interface Currency {
    id: number
    shortName: string
    fullName: string
    icon: string
}

const CreatePriceAlertModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [currencies, setCurrencies] = useState<Currency[]>([])
    const [loading, setLoading] = useState(true)
    
    // Form States
    const [selectedCoin, setSelectedCoin] = useState<string>('')
    const [condition, setCondition] = useState('above')
    const [targetPrice, setTargetPrice] = useState('')
    const [emailNotify, setEmailNotify] = useState(true)
    const [appNotify, setAppNotify] = useState(true)

    useEffect(() => {
        if (isOpen) {
            const fetchCoins = async () => {
                try {
                    const token = localStorage.getItem('authToken')
                    const res = await axios.get(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/fetch?type=Crypto`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                    setCurrencies(res.data.data)
                    if (res.data.data.length > 0) setSelectedCoin(res.data.data[0].shortName)
                } catch (err) {
                    console.error("Error loading currencies for alert", err)
                } finally {
                    setLoading(false)
                }
            }
            fetchCoins()
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#1F2937] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-bold text-white">Create Price Alert</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Cryptocurrency Dropdown */}
                  <div className="p-6 space-y-6">
                    {/* Cryptocurrency Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cryptocurrency</label>
                        <div className="relative">
                            <select 
                                value={selectedCoin}
                                onChange={(e) => setSelectedCoin(e.target.value)}
                                className="w-full bg-[#2C3644] border border-gray-700 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                            >
                                {currencies.map(coin => (
                                    <option key={coin.id} value={coin.shortName} className="bg-[#2C3644]">
                                        {coin.fullName} ({coin.shortName.toUpperCase()})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Condition Selection with Dynamic Icon */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Condition</label>
                        <div className="relative">
                            {/* Dynamic Icon Container */}
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                {condition === 'above' ? (
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                            </div>

                            <select 
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className="w-full bg-[#2C3644] border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                            >
                                <option value="above">Price goes above</option>
                                <option value="below">Price goes down</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    </div>

                    {/* Target Price Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Price (USD)</label>
                        <input 
                            type="number" 
                            placeholder="Enter target price"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            className="w-full bg-[#2C3644] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none placeholder:dark:text-white"
                        />
                    </div>

                 {/* Notification Methods with Modern Switches */}
                    <div className="bg-[#111827]/50 rounded-xl p-4 space-y-5 border border-gray-800/50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notification Methods</p>
                        
                        {/* Email Switch */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-200">Email notification</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={emailNotify} onChange={() => setEmailNotify(!emailNotify)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {/* In-App Switch */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-200">In-app notification</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={appNotify} onChange={() => setAppNotify(!appNotify)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button className="w-full bg-orange-400 hover:bg-orange-500 active:scale-[0.98] text-white font-bold py-2 rounded-xl shadow-lg shadow-orange-500/20 transition-all">
                        Create Alert
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreatePriceAlertModal