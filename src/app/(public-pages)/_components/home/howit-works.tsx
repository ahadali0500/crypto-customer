'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      title: 'Receive your login credentials',
      description:
        "After approval, our team securely provides login credentials and access instructions.",
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      number: '2',
      title: 'Synchronize your personal wallets and complete KYC',
      description:
        'Connect personal wallets and complete identity verification for compliant access.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      number: '3',
      title: 'Access and use our services',
      description:
        'Once setup is complete, securely access platform features with full support.',
      gradient: 'from-purple-500 to-pink-500',
    },
  ]

  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden bg-[oklch(0.24_0.03_260.32)]">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05)_0px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
            Get Started in 3 Easy Steps
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start trading cryptocurrency in minutes
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-12 text-center">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Step Number */}
              <div
                className={`w-20 h-20 rounded-full bg-gradient-to-r ${step.gradient}
                flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg`}
              >
                {step.number}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3">
                {step.title}
              </h3>

              <p className="text-gray-400 max-w-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/sign-in"
            className="group inline-flex items-center justify-center gap-3
                       px-6 py-3.5
                       rounded-lg
                       font-semibold text-white
                       bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]
                       shadow-md
                       hover:shadow-lg
                       hover:brightness-110
                       transition-all duration-300"
          >
            Create Free Account
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
