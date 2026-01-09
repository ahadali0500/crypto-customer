'use client'

import React from 'react'
import { ArrowRight, Shield, Lock, Users, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const Hero = () => {
    const router = useRouter()

    const handlePushLogin = () => {
        router.push('/sign-in')
    }

    const features = [
        { icon: Shield, text: 'Military-Grade Encryption', color: 'text-primary-600 dark:text-primary-400' },
        { icon: Users, text: '24/7 Agent Support', color: 'text-secondary-600 dark:text-secondary-400' },
        { icon: Lock, text: 'Secure Wallet Storage', color: 'text-green-600 dark:text-green-400' },
        { icon: CheckCircle, text: 'Transparent Fees', color: 'text-accent-600 dark:text-accent-400' }
    ]

    const exchangePairs = [
        { from: 'BTC', to: 'USD', rate: '$42,850.12', change: '+2.4%' },
        { from: 'ETH', to: 'EUR', rate: '€2,850.75', change: '+1.2%' }
    ]

    const stats = [
        { value: '99.9%', label: 'Success Rate', color: 'text-primary-600 dark:text-primary-400' },
        { value: '10K+', label: 'Transactions', color: 'text-secondary-600 dark:text-secondary-400' },
        { value: '24/7', label: 'Support', color: 'text-accent-600 dark:text-accent-400' }
    ]

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden py-20 px-4">
            {/* Enhanced Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/40 via-white/90 to-secondary-50/40 dark:from-primary-950/30 dark:via-neutral-900 dark:to-secondary-950/30" />
            
            {/* Animated Orbs */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-primary-400/10 to-primary-600/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-br from-secondary-400/10 to-secondary-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
            
            {/* Subtle Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1)_0px,transparent_1px)] bg-[size:40px_40px]" />
            
            {/* Content Container */}
            <div className="max-w-7xl mx-auto w-full relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    
                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Trust Badge */}
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/30 backdrop-blur-sm">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                                Enterprise-Grade Security Certified
                            </span>
                        </div>

                        {/* Headline */}
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                <span className="text-neutral-900 dark:text-white block">
                                    Secure & Reliable
                                </span>
                                <span className="text-transparent bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#c026d3] bg-clip-text">
                                    Money Exchange
                                </span>
                            </h1>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                                Exchange crypto and fiat currencies with confidence. Dedicated agent support, secure wallets, and transparent transactions.
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-800/50">
                                    <div className={`p-2 rounded-lg bg-white dark:bg-neutral-800 shadow-sm ${feature.color}`}>
                                        <feature.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-neutral-700 dark:text-neutral-300 font-medium text-sm">
                                        {feature.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <button
                                onClick={handlePushLogin}
                                className="group relative px-8 py-3.5 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {/* Gradient Background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 group-hover:from-primary-700 group-hover:to-primary-600 transition-all duration-300" />
                                
                                {/* Shine Effect */}
                                <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                
                                {/* Content */}
                                <div className="relative flex items-center justify-center gap-2">
                                    Sign In
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>

                            <button className="px-8 py-3.5 rounded-xl font-semibold border border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                                Learn More
                            </button>
                        </div>

                        {/* Verification Note */}
                        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500 pt-4">
                            <Lock className="w-4 h-4 flex-shrink-0" />
                            <span>Accounts are created and verified by administrators</span>
                            <span className="inline-flex h-2 w-2 rounded-full bg-green-500 ml-2 animate-pulse" />
                        </div>
                    </div>

                    {/* Right Visual */}
                    <div className="relative">
                        {/* Main Dashboard Card */}
                        <div className="relative z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-neutral-200/50 dark:border-neutral-800/50">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                                        <span className="text-white font-bold text-lg">$</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 dark:text-white">Exchange Dashboard</h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Real-time rates</p>
                                    </div>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                {/* Chart */}
                                <div className="h-32 bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-4">
                                    <div className="flex items-end h-16 gap-1.5">
                                        {[40, 60, 45, 70, 50, 80, 65].map((height, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 rounded-t-lg transition-all duration-300 hover:opacity-80 ${i === 3
                                                    ? 'bg-gradient-to-t from-primary-500 to-primary-400'
                                                    : 'bg-gradient-to-t from-neutral-300 to-neutral-200 dark:from-neutral-700 dark:to-neutral-600'
                                                    }`}
                                                style={{ height: `${height}%` }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Exchange Pairs */}
                                <div className="grid grid-cols-2 gap-3">
                                    {exchangePairs.map((pair, i) => (
                                        <div key={i} className="bg-neutral-50/50 dark:bg-neutral-800/50 rounded-xl p-4 backdrop-blur-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-neutral-900 dark:text-white">{pair.from}/{pair.to}</span>
                                                <span className={`text-sm font-semibold ${pair.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {pair.change}
                                                </span>
                                            </div>
                                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                                                {pair.rate}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Security Status */}
                                <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-800 dark:text-green-300 text-sm">Secure Transaction</p>
                                            <p className="text-xs text-green-600 dark:text-green-400">Verified & Encrypted</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Cards */}
                        <div className="absolute -bottom-4 -left-4 w-56 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900/30 dark:to-secondary-800/30 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-900 dark:text-white text-sm">256-bit SSL</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Active Protection</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -top-4 -right-4 w-56 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/30 dark:to-accent-800/30 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-900 dark:text-white text-sm">Live Support</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Agent Available</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="mt-16 pt-8 border-t border-neutral-200/50 dark:border-neutral-800/50">
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                                    {stat.value}
                                </div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero