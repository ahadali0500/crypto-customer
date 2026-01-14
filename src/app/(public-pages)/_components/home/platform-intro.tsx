// app/components/Sections/PlatformIntro.jsx
'use client'

import React from 'react'
import { Shield, Zap, BarChart3, Database, Users, Globe, CheckCircle } from 'lucide-react'

const PlatformIntro = () => {
    const features = [
        {
            icon: Shield,
            title: "Bank-Grade Security",
            description: "Military-grade encryption and multi-factor authentication protect your assets 24/7. Your security is our top priority.",
            gradient: "bg-blue-500/40"
        },
        {
            icon: Zap,
            title: "Instant Transactions",
            description: "Lightning-fast deposits and withdrawals with real-time processing. Trade at the speed of light.",
            gradient: "bg-green-400/40"
        },
        {
            icon: BarChart3,
            title: "Live Market Data",
            description: "Real-time cryptocurrency prices and advanced portfolio analytics to make informed decisions.",
            gradient: "bg-fuchsia-400/40"
        },
        {
            icon: Database,
            title: "Cold Storage",
            description: "95% of assets secured in offline cold wallets with multi-signature technology for maximum protection.",
            gradient: "bg-yellow-500/60"
        },
        {
            icon: Users,
            title: "24/7 Support",
            description: "Round-the-clock customer support via live chat and email. We're always here to help you.",
            gradient: "from-indigo-500 to-blue-500"
        },
        {
            icon: Globe,
            title: "Global Access",
            description: "Trade from anywhere with support for multiple currencies and languages. Truly global platform.",
            gradient: "from-cyan-500 to-teal-500"
        }
    ]

    return (
        <section className="relative py-20 md:py-28 px-4 overflow-hidden bg-slate-900">


            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                        Why Choose Bexchange?
                    </h1>

                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                        Industry-leading security, instant transactions, and 24/7 support make us the preferred choice for traders worldwide.
                    </p>

                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-[#1f2937] rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl"
                        >
                            {/* Feature Icon */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>

                            {/* Feature Title */}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                {feature.title}
                            </h3>

                            {/* Feature Description */}
                            <p className="text-gray-600 dark:text-gray-400">
                                {feature.description}
                            </p>

                            {/* Separator */}
                            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r ${feature.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}

export default PlatformIntro