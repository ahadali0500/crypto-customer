// app/components/Sections/Hero.jsx
'use client'

import React from 'react'
import { ArrowRight, Shield, Users, Globe, Zap, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { BsGraphUp } from 'react-icons/bs'
import Link from 'next/link'
const Hero = () => {
    const router = useRouter()

    const handleGetStarted = () => {
        router.push('/sign-up')
    }

    const handleViewPrices = () => {
        router.push('/markets')
    }

    const cryptoData = [
        {
            name: 'Bitcoin',
            symbol: 'BTC',
            price: '$91,889',
            change: '+1.50%',
            trend: 'up',
            icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
        },
        {
            name: 'Ethereum',
            symbol: 'ETH',
            price: '$3,135.96',
            change: '+1.03%',
            trend: 'up',
            icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
        },
        {
            name: 'Tether',
            symbol: 'USDT',
            price: '$0.999',
            change: '+0.02%',
            trend: 'up',
            icon: 'https://assets.coingecko.com/coins/images/325/large/Tether.png'
        },
        {
            name: 'XRP',
            symbol: 'XRP',
            price: '$2.07',
            change: '+0.80%',
            trend: 'up',
            icon: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png'
        }
    ]


    const stats = [
        { value: '500K+', label: 'Active Users', icon: Users },
        { value: '$2.5B+', label: 'Trading Volume', icon: Globe },
        { value: '180+', label: 'Countries', icon: Globe },
        { value: '99.9%', label: 'Uptime', icon: Zap }
    ]

    return (
        <section className="relative  overflow-hidden">
            {/* Subtle Grid / Texture */}


            {/* Content Container */}
            <div className='bg-gradient-to-b from-[#0f1a2b] via-[#0f1a2b] to-slate-800 pt-35 pb-46'>
                <div className="max-w-7xl mx-auto w-full relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* Left Content */}
                        <div className="space-y-8">
                            {/* Trust Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 shadow-sm">
                                <Users className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-blue-400">
                                    Trusted by 500K+ users worldwide
                                </span>
                            </div>

                            {/* Main Headline */}
                            <div className="space-y-6">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-none tracking-tight">
                                    <span className=" text-slate-50">
                                        Buy &amp; Sell
                                    </span>

                                    <span className="text-transparent ml-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text">
                                        Crypto
                                    </span>
                                    <span className="text-slate-50"> in Minutes</span>

                                </h1>
                                <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl">
                                   A secure cryptocurrency platform focused on usability and security
                                </p>
                            </div>
                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/sign-in"
                                    className="group flex items-center justify-center gap-3
               px-8 py-2
               rounded-lg
               font-semibold text-white
               bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]
               shadow-md
               hover:shadow-lg
               hover:brightness-110
               transition-all duration-300"
                                >
                                    <span className="flex items-center gap-3">
                                        Create a Free Account
                                        <ArrowRight
                                            size={18}
                                            className="transition-transform duration-300 group-hover:translate-x-1"
                                        />
                                    </span>
                                </Link>

                                <button
                                    onClick={handleViewPrices}
                                    className="px-8 py-2 rounded-lg font-semibold
               border border-slate-600/80 text-slate-100
               hover:border-slate-400 hover:bg-slate-700
               transition-all duration-300 shadow-sm
               text-sm md:text-base"
                                >
                                    View Prices
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-200">
                                        Secure & Regulated
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-200">
                                        24/7 Support
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Visual - Live Market Preview */}
                        <div className="relative">
                            {/* Main Market Preview Card */}
                            <div className="relative bg-[oklch(0.24_0.03_260.32)] z-10 rounded-2xl p-6 shadow-2xl border border-white/5">
                                {/* Card Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-50">
                                            Live Market Preview
                                        </h3>
                                        <p className="text-sm text-slate-400">Real-time cryptocurrency prices</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-xs font-medium text-emerald-400">Live</span>
                                    </div>
                                </div>

                                {/* Cryptocurrency List */}
                                <div className="space-y-4 mb-8">
                                    {cryptoData.map((crypto, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white/2 hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <img
                                                        src={crypto.icon}
                                                        alt={crypto.name}
                                                        className="w-8 h-8 object-contain"
                                                    />
                                                </div>

                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        {crypto.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {crypto.symbol}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-slate-50 text-lg">
                                                    {crypto.price}
                                                </div>
                                                <div className={`text-sm font-semibold ${crypto.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {crypto.change}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href="/sign-in"
                                    className="group inline-flex items-center justify-center gap-3
             px-6 py-2
             w-full
             rounded-lg
             text-sm font-semibold text-white
             bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]
             shadow-md
             hover:shadow-lg
             hover:brightness-110
             transition-all duration-300"
                                >
                                    Start Trading
                                </Link>

                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* <div className="bg-[#1f2937] py-18">
                <div className="max-w-7xl mx-auto w-full relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                        <div className="flex flex-col items-center text-center">
                            <Users className="mb-2 text-blue-500" size={30} />
                            <div className="text-white font-bold text-2xl">500K+</div>
                            <div className="text-gray-400 text-sm">Active Users</div>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <BsGraphUp className="mb-2 text-green-400" size={30} />
                            <div className="text-white font-bold text-2xl">$2.5B+</div>
                            <div className="text-gray-400 text-sm">Trading Volume</div>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <Globe className="mb-2 text-purple-500" size={30} />
                            <div className="text-white font-bold text-2xl">180+</div>
                            <div className="text-gray-400 text-sm">Countries</div>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <Zap className="mb-2 text-yellow-500" size={30} />
                            <div className="text-white font-bold text-2xl">99.9%</div>
                            <div className="text-gray-400 text-sm">Uptime</div>
                        </div>

                    </div>
                </div>

            </div> */}


        </section>
    )
}

export default Hero