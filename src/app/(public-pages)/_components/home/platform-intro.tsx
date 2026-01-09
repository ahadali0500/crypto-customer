// app/components/Sections/PlatformIntro.jsx
'use client'

import React from 'react'
import { Shield, Zap, Eye, Users, Globe, CheckCircle } from 'lucide-react'

const PlatformIntro = () => {
    const features = [
        {
            icon: Shield,
            title: "Military-Grade Security",
            description: "Bank-level encryption, multi-signature wallets, and cold storage for maximum protection of your assets.",
            gradient: "from-primary-500 to-primary-600"
        },
        {
            icon: Zap,
            title: "Lightning-Fast Transactions",
            description: "Process exchanges in minutes, not days. Real-time settlement with instant confirmation.",
            gradient: "from-secondary-500 to-secondary-600"
        },
        {
            icon: Globe,
            title: "Global Compliance",
            description: "Fully compliant with international regulations. KYC/AML verified for safe, legal transactions.",
            gradient: "from-accent-500 to-accent-600"
        }
    ]

    const stats = [
        {
            value: "100K+",
            label: "Verified Users",
            icon: Users,
            color: "text-primary-600 dark:text-primary-400",
            bg: "bg-primary-50 dark:bg-primary-900/20"
        },
        {
            value: "$10B+",
            label: "Total Volume",
            icon: Zap,
            color: "text-secondary-600 dark:text-secondary-400",
            bg: "bg-secondary-50 dark:bg-secondary-900/20"
        },
        {
            value: "150+",
            label: "Countries Served",
            icon: Globe,
            color: "text-accent-600 dark:text-accent-400",
            bg: "bg-accent-50 dark:bg-accent-900/20"
        },
        {
            value: "24/7",
            label: "Agent Support",
            icon: Shield,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-50 dark:bg-green-900/20"
        }
    ]

    const trustPoints = [
        "Professional Supervision",
        "Transparent Pricing",
        "Regulatory Compliance"
    ]

    return (
        <section className="relative py-20 md:py-28 px-4 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-primary-50/10 to-secondary-50/10 dark:from-neutral-900 dark:via-primary-950/5 dark:to-secondary-950/5" />
            
            {/* Animated Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-300/5 to-secondary-300/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-secondary-300/5 to-accent-300/5 rounded-full blur-3xl animate-pulse delay-1000" />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.05)_0px,transparent_1px)] bg-[size:60px_60px]" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border border-primary-200 dark:border-primary-800/30 mb-4">
                        <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                            Enterprise Platform
                        </span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        <span className="text-neutral-900 dark:text-white">Built for</span>{' '}
                        <span className="text-transparent bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#c026d3] bg-clip-text">
                            Secure Currency Exchange
                        </span>
                    </h2>
                    
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Our platform is designed for verified customers who need a safe, efficient, and transparent way 
                        to exchange crypto and fiat currencies under professional supervision.
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
                    {/* Left Column - Visual */}
                    <div className="relative">
                        {/* Main Card */}
                        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-neutral-200/50 dark:border-neutral-800/50">
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 dark:text-white">Exchange Platform</h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Live Dashboard</p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse delay-500" />
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse delay-1000" />
                                </div>
                            </div>

                            {/* Exchange Interface */}
                            <div className="space-y-4">
                                {/* Currency Selector */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-neutral-100/50 dark:bg-neutral-800/50 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-neutral-500 dark:text-neutral-400">From</span>
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 flex items-center justify-center">
                                                <span className="text-xs font-bold text-white">$</span>
                                            </div>
                                        </div>
                                        <div className="text-xl font-bold text-neutral-900 dark:text-white">10,000</div>
                                        <div className="text-sm text-neutral-500 dark:text-neutral-400">USD</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-4 border border-primary-200/50 dark:border-primary-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-primary-600 dark:text-primary-400">To</span>
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-secondary-400 to-secondary-500 flex items-center justify-center">
                                                <span className="text-xs font-bold text-white">₿</span>
                                            </div>
                                        </div>
                                        <div className="text-xl font-bold text-primary-700 dark:text-primary-300">0.233</div>
                                        <div className="text-sm text-primary-600 dark:text-primary-400">BTC</div>
                                    </div>
                                </div>

                                {/* Exchange Rate */}
                                <div className="bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/10 dark:to-secondary-900/10 rounded-xl p-3 border border-primary-200/50 dark:border-primary-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-primary-600 dark:text-primary-400">Exchange Rate</div>
                                            <div className="font-bold text-neutral-900 dark:text-white">1 BTC = $42,850.12</div>
                                        </div>
                                        <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">+2.4%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Status */}
                                <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-green-800 dark:text-green-300 text-sm">Secure Transaction Ready</div>
                                            <div className="text-xs text-green-600 dark:text-green-400">256-bit SSL • 2FA Enabled</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Cards */}
                        {/* <div className="absolute -top-4 -right-3 w-48 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl p-3 shadow-md border border-neutral-200/50 dark:border-neutral-800/50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent-100 to-accent-200 dark:from-accent-900/20 dark:to-accent-800/20 flex items-center justify-center">
                                    <Eye className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-neutral-900 dark:text-white text-sm">Real-time</div>
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Market Tracking</div>
                                </div>
                            </div>
                        </div> */}

                        <div className="absolute -bottom-6 -left-3 w-48 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl p-3 shadow-md border border-neutral-200/50 dark:border-neutral-800/50">
                            <div className="flex items-center gap-2">
                                {/* <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-secondary-100 to-secondary-200 dark:from-secondary-900/20 dark:to-secondary-800/20 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-neutral-900 dark:text-white text-sm">24/7</div>
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Agent Support</div>
                                </div> */}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Features */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-900/20 dark:to-primary-900/20 border border-secondary-200 dark:border-secondary-800/30">
                            <Eye className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                            <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                                Designed for Verified Customers
                            </span>
                        </div>

                        <div className="space-y-6">
                            {features.map((feature, index) => (
                                <div 
                                    key={index}
                                    className="group p-5 rounded-xl bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                            <feature.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900 dark:text-white mb-1">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {stats.map((stat, index) => (
                        <div 
                            key={index} 
                            className={`${stat.bg} rounded-xl p-4 text-center border border-neutral-200/50 dark:border-neutral-800/50`}
                        >
                            <div className="flex justify-center mb-2">
                                <div className={`p-2 rounded-lg ${stat.bg.replace('50', '100').replace('900/20', '800/20')}`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                            <div className={`text-xl font-bold ${stat.color} mb-0.5`}>
                                {stat.value}
                            </div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Statement */}
                <div className="text-center">
                    <div className="inline-flex flex-wrap items-center justify-center gap-4 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/10 dark:to-secondary-900/10 border border-primary-200/50 dark:border-primary-800/50 backdrop-blur-sm">
                        {trustPoints.map((point, index) => (
                            <React.Fragment key={index}>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        {point}
                                    </span>
                                </div>
                                {index < trustPoints.length - 1 && (
                                    <div className="h-3 w-px bg-neutral-300 dark:bg-neutral-700" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PlatformIntro