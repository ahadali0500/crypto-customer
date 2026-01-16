// app/components/Sections/WalletSystem.jsx
'use client'

import React from 'react'
import { Shield, CheckCircle } from 'lucide-react'

const WalletSystem = () => {
  const securityFeatures = [
    {
      icon: CheckCircle,
      title: "256-bit SSL Encryption",
      description: "All data transmission is encrypted with bank-level security.",
      iconColor: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
    },
    {
      icon: CheckCircle,
      title: "Two-Factor Authentication",
      description: "Add an extra layer of protection to your account.",
      iconColor: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
    },
    {
      icon: CheckCircle,
      title: "Cold Storage",
      description: "95% of funds stored offline in secure cold wallets.",
      iconColor: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
    },
    // {
    //   icon: CheckCircle,
    //   title: "Regular Audits",
    //   description: "Independent security audits and compliance checks.",
    //   iconColor: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
    // }
  ]

  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden bg-slate-900">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Your Security is Our Priority
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We employ industry-leading security measures to protect your assets and personal information.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left Content */}
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              Bank-Grade Protection
            </h2>

            <p className="text-gray-400 mt-4 text-lg">
              Our wallet system is built with multiple layers of advanced security.
            </p>

            <ul className="mt-8">
              {securityFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-4 mb-6">
                  <div
                    className={`w-12 h-12 rounded-lg ${feature.iconColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <feature.icon size={24} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Visual */}
          <div className="px-6 py-10 bg-[oklch(0.24_0.03_260.32)] rounded-xl shadow-lg flex justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-28 h-28 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                <Shield size={48} className="text-white" />
              </div>

              <h3 className="text-lg font-semibold text-white text-center">
                Protected & Insured
              </h3>
              <p className="text-gray-400 text-center text-lg leading-6">
                Your funds are protected by industry-leading security measures and insurance coverage.
              </p>
              <div className='flex gap-3'>
              <div className='bg-slate-700/20 text-center py-2 px-20 rounded-md'>
                <h4 className='text-green-400'>100%</h4>
                <p>Secure Storage</p>
              </div>
              <div className='bg-slate-700/20 text-center py-2 px-20 rounded-md'>
                <h4 className='text-blue-400'>24/7</h4>
                <p>Monitoring</p>
              </div>
            </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default WalletSystem
