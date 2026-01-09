// app/components/Sections/HowItWorks.jsx
'use client'

import React, { useState } from 'react'
import {
  UserCheck,
  Users,
  Wallet,
  RefreshCw,
  ArrowRight,
  Shield,
  CheckCircle,
  Clock,
  Zap,
  ChevronRight,
  Lock
} from 'lucide-react'

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      number: "01",
      title: "Account Setup by Admin",
      description: "Your account is securely created and verified by our admin team with full KYC/AML compliance.",
      icon: UserCheck,
      color: "primary",
      details: [
        "Complete identity verification",
        "Secure account creation",
        "KYC/AML compliance check",
        "Initial security setup"
      ],
      estimatedTime: "24-48 hours"
    },
    {
      number: "02",
      title: "Agent Assignment",
      description: "A dedicated agent is assigned to assist with your transactions and provide personalized support.",
      icon: Users,
      color: "secondary",
      details: [
        "Personal account manager",
        "Direct communication channel",
        "24/7 availability",
        "Transaction guidance"
      ],
      estimatedTime: "Immediate"
    },
    {
      number: "03",
      title: "Wallet Access",
      description: "View wallet addresses and QR codes for all supported currencies in your secure dashboard.",
      icon: Wallet,
      color: "accent",
      details: [
        "Multi-currency wallet addresses",
        "Secure QR codes",
        "Balance tracking",
        "Deposit monitoring"
      ],
      estimatedTime: "Instant"
    },
    {
      number: "04",
      title: "Exchange & Track",
      description: "Complete transactions and track status in real-time with full transparency and updates.",
      icon: RefreshCw,
      color: "green",
      details: [
        "Real-time exchange execution",
        "Live status tracking",
        "Transaction history",
        "Export reports"
      ],
      estimatedTime: "2-30 minutes"
    }
  ]

  const stats = [
    { icon: Zap, value: '< 5 min', label: 'Average Setup Time', color: 'text-primary-600 dark:text-primary-400' },
    { icon: Shield, value: '100%', label: 'Secure Verification', color: 'text-secondary-600 dark:text-secondary-400' },
    { icon: Clock, value: '24/7', label: 'Transaction Monitoring', color: 'text-accent-600 dark:text-accent-400' },
    { icon: Lock, value: '256-bit', label: 'SSL Encryption', color: 'text-green-600 dark:text-green-400' }
  ]

  const colorMap = {
    primary: {
      bg: 'bg-gradient-to-br from-primary-500 to-primary-600',
      bgLight: 'bg-primary-50 dark:bg-primary-900/20',
      text: 'text-primary-600 dark:text-primary-400',
      border: 'border-primary-200 dark:border-primary-800'
    },
    secondary: {
      bg: 'bg-gradient-to-br from-secondary-500 to-secondary-600',
      bgLight: 'bg-secondary-50 dark:bg-secondary-900/20',
      text: 'text-secondary-600 dark:text-secondary-400',
      border: 'border-secondary-200 dark:border-secondary-800'
    },
    accent: {
      bg: 'bg-gradient-to-br from-accent-500 to-accent-600',
      bgLight: 'bg-accent-50 dark:bg-accent-900/20',
      text: 'text-accent-600 dark:text-accent-400',
      border: 'border-accent-200 dark:border-accent-800'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      bgLight: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800'
    }
  }

  const activeStepData = steps[activeStep]
  const activeColor = colorMap[activeStepData.color]

  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-neutral-50/40 to-primary-50/20 dark:from-neutral-900 dark:via-neutral-900/50 dark:to-primary-950/10" />

      {/* Animated Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-primary-300/5 to-secondary-300/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-secondary-300/5 to-accent-300/5 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.05)_0px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200 dark:border-primary-800/30 mb-4">
            <Zap className="w-4 h-4 text-accent-600 dark:text-accent-400" />
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
              Simple & Secure Process
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-neutral-900 dark:text-white">How the Platform's</span>{' '}
            <span className="text-transparent bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#c026d3] bg-clip-text">
              Exchange Process Works
            </span>
          </h2>

          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            A streamlined four-step process designed for maximum efficiency and transparency
          </p>
        </div>

        {/* Steps Container */}
        <div className="space-y-8">
          {/* Steps Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((step, index) => {
              const color = colorMap[step.color]
              const isActive = index === activeStep

              return (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  onMouseEnter={() => setActiveStep(index)}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${isActive
                      ? `${color.bgLight} border ${color.border} shadow-md`
                      : 'bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-800'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? color.bg : color.bgLight
                    }`}>
                    <step.icon className={`w-5 h-5 ${isActive ? 'text-white' : color.text}`} />
                  </div>
                  <div className="text-left">
                    <div className={`font-semibold text-sm ${isActive ? 'text-neutral-900 dark:text-white' : color.text
                      }`}>
                      {step.title}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                      <Clock className="w-3 h-3" />
                      {step.estimatedTime}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active Step Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Step Details */}
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-neutral-200/50 dark:border-neutral-800/50">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`text-3xl font-bold ${activeColor.text}`}>
                    {activeStepData.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {activeStepData.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${activeColor.text} ${activeColor.bgLight}`}>
                        {activeStepData.estimatedTime}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                {activeStepData.description}
              </p>

              <div className="space-y-3">
                {activeStepData.details.map((detail, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {detail}
                    </span>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${activeStep === 0
                      ? 'opacity-50 cursor-not-allowed text-neutral-400'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Previous
                </button>

                <div className="flex items-center gap-1.5">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${index === activeStep
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 w-6'
                          : 'bg-neutral-300 dark:bg-neutral-700'
                        }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                  disabled={activeStep === steps.length - 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${activeStep === steps.length - 1
                      ? 'opacity-50 cursor-not-allowed text-neutral-400'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Steps Overview */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const color = colorMap[step.color]
                const isActive = index === activeStep

                return (
                  <div
                    key={step.number}
                    onClick={() => setActiveStep(index)}
                    onMouseEnter={() => setActiveStep(index)}
                    className={`group relative p-5 rounded-xl cursor-pointer transition-all duration-300 ${isActive
                        ? `${color.bgLight} border ${color.border} shadow-md`
                        : 'bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-800'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? color.bg : color.bgLight
                        }`}>
                        <step.icon className={`w-6 h-6 ${isActive ? 'text-white' : color.text}`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-bold ${isActive ? 'text-neutral-900 dark:text-white' : color.text}`}>
                            {step.title}
                          </h4>
                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {step.description}
                        </p>
                      </div>

                      <ChevronRight className={`w-5 h-5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        } ${color.text}`} />
                    </div>
                  </div>
                )
              })}

              {/* Security Note */}
              <div className="bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/10 dark:to-secondary-900/10 rounded-xl p-5 border border-primary-200 dark:border-primary-800">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">
                      Security First Design
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Every step includes security checks and compliance verification to ensure your assets remain safe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 pt-8 border-t border-neutral-200/50 dark:border-neutral-800/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/50 dark:bg-neutral-900/50 rounded-xl p-5 text-center backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-800/50"
              >
                <div className="flex justify-center mb-3">
                  <div className={`p-2.5 rounded-lg ${stat.color.replace('text', 'bg').replace('600', '100').replace('dark:', 'dark:bg-').replace('400', '900/20')}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div className={`text-xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
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

export default HowItWorks