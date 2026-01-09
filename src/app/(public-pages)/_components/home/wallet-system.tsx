// app/components/Sections/WalletSystem.jsx
'use client'

import React, { useState } from 'react'
import { 
  Wallet, 
  QrCode, 
  Shield, 
  Lock, 
  Eye, 
  Copy,
  Check,
  Globe,
  DollarSign,
  CreditCard,
  Smartphone,
  RefreshCw,
  Download,
  Users,
  Bell
} from 'lucide-react'
// Note: Bitcoin and Ethereum might not be available in lucide-react
// Using alternative icons or custom components instead

// Custom icon components for crypto currencies
const BitcoinIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.88 15.76v1.69h-1.75v-1.69c-2.45-.31-3.69-1.5-3.69-3.21 0-1.68 1.21-2.9 3.69-3.21V6.5h1.75v4.34c2.45.31 3.69 1.5 3.69 3.21 0 1.68-1.21 2.9-3.69 3.21zm-1.75-7.89v3.03c-.74.19-1.21.67-1.21 1.39 0 .72.48 1.2 1.21 1.39v3.03c-1.29-.19-2.19-1.05-2.19-2.42 0-1.37.9-2.23 2.19-2.42zm1.75 7.89v3.03c1.29-.19 2.19-1.05 2.19-2.42 0-1.37-.9-2.23-2.19-2.42v3.03c.74.19 1.21.67 1.21 1.39 0 .72-.48 1.2-1.21 1.39z"/>
  </svg>
)

const EthereumIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
  </svg>
)

const WalletSystem = () => {
  const [copiedAddress, setCopiedAddress] = useState(null)
  const [activeWallet, setActiveWallet] = useState('BTC')
  const [showQR, setShowQR] = useState(false)

  const wallets = [
    {
      id: 'BTC',
      name: 'Bitcoin',
      icon: BitcoinIcon,
      address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
      balance: '2.541',
      currency: 'BTC',
      usdValue: '$108,742.85',
      color: 'from-orange-500 to-yellow-500',
      qrColor: 'bg-orange-50 dark:bg-orange-900/20',
      type: 'crypto'
    },
    {
      id: 'ETH',
      name: 'Ethereum',
      icon: EthereumIcon,
      address: '0x742d35Cc6634C0532925a3b844Bc9e1f0315aB46',
      balance: '15.82',
      currency: 'ETH',
      usdValue: '$45,128.40',
      color: 'from-purple-500 to-indigo-500',
      qrColor: 'bg-purple-50 dark:bg-purple-900/20',
      type: 'crypto'
    },
    {
      id: 'USD',
      name: 'US Dollar',
      icon: DollarSign,
      address: 'USD-ACC-789123456',
      balance: '25,000',
      currency: 'USD',
      usdValue: '$25,000.00',
      color: 'from-green-500 to-emerald-500',
      qrColor: 'bg-green-50 dark:bg-green-900/20',
      type: 'fiat'
    },
    {
      id: 'EUR',
      name: 'Euro',
      icon: CreditCard,
      address: 'EUR-ACC-987654321',
      balance: '18,500',
      currency: 'EUR',
      usdValue: '$20,150.00',
      color: 'from-blue-500 to-cyan-500',
      qrColor: 'bg-blue-50 dark:bg-blue-900/20',
      type: 'fiat'
    }
  ]

  const activeWalletData = wallets.find(w => w.id === activeWallet)

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(id)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  return (
    <section className="relative py-24 md:py-32 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/30 dark:from-neutral-900 dark:via-primary-950/10 dark:to-secondary-950/10" />
      
      {/* Animated Wallets */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-primary-300/10 to-secondary-300/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-r from-secondary-300/10 to-accent-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0f2fe_1px,transparent_1px),linear-gradient(to_bottom,#e0f2fe_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 dark:bg-[linear-gradient(to_right,#0c4a6e_1px,transparent_1px),linear-gradient(to_bottom,#0c4a6e_1px,transparent_1px)]" />
      
      {/* Wallet Shapes */}
      <div className="absolute top-1/4 right-20 w-32 h-48 bg-gradient-to-br from-primary-200/20 to-primary-400/20 rounded-2xl rotate-12 blur-xl" />
      <div className="absolute bottom-1/3 left-20 w-32 h-48 bg-gradient-to-br from-secondary-200/20 to-secondary-400/20 rounded-2xl -rotate-12 blur-xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200 dark:border-primary-800/30 mb-6">
            <Lock className="w-4 h-4 text-accent-600 dark:text-accent-400" />
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
              Enterprise-Grade Security
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-neutral-900 dark:text-white">Secure</span>{' '}
            <span className="text-transparent bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#c026d3] bg-clip-text">
              Multi-Currency Wallets
            </span>
          </h2>
          
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Advanced wallet system supporting both crypto and fiat currencies with enterprise-grade security
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-20">
          {/* Left Column - Wallet Preview */}
          <div className="space-y-8">
            {/* Active Wallet Card */}
            <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 rounded-3xl p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800">
              {/* Wallet Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${activeWalletData.color} flex items-center justify-center shadow-lg`}>
                    {React.createElement(activeWalletData.icon, { className: "w-7 h-7 text-white" })}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {activeWalletData.name} Wallet
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        activeWalletData.type === 'crypto' 
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {activeWalletData.type.toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400">Secured</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Active</span>
                </div>
              </div>

              {/* Balance Display */}
              <div className="mb-8">
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Current Balance</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold text-neutral-900 dark:text-white">
                    {activeWalletData.balance}
                  </div>
                  <div className="text-xl font-semibold text-neutral-600 dark:text-neutral-400">
                    {activeWalletData.currency}
                  </div>
                </div>
                <div className="text-lg text-neutral-500 dark:text-neutral-400 mt-2">
                  {activeWalletData.usdValue}
                </div>
              </div>

              {/* Wallet Address */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Unique Wallet Address
                  </div>
                  <button
                    onClick={() => copyToClipboard(activeWalletData.address, activeWalletData.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-sm"
                  >
                    {copiedAddress === activeWalletData.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Address
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 font-mono text-sm text-neutral-700 dark:text-neutral-300 break-all">
                  {activeWalletData.address}
                </div>
              </div>

              {/* QR Code Section */}
              <div className={`${activeWalletData.qrColor} rounded-2xl p-6 border ${activeWalletData.type === 'crypto' ? 'border-orange-200 dark:border-orange-800/30' : 'border-green-200 dark:border-green-800/30'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                    <span className="font-semibold text-neutral-900 dark:text-white">QR Code for Fast Transfers</span>
                  </div>
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    {showQR ? 'Hide' : 'Show'} QR
                  </button>
                </div>
                
                {showQR && (
                  <div className="flex justify-center">
                    <div className="relative">
                      {/* QR Code Mockup */}
                      <div className="w-48 h-48 bg-white dark:bg-neutral-900 rounded-xl p-4 border-4 border-white dark:border-neutral-800">
                        <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 rounded flex items-center justify-center">
                          <div className="text-center">
                            <QrCode className="w-16 h-16 mx-auto mb-2 text-neutral-600 dark:text-neutral-400" />
                            <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                              Scan to deposit
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0 border-2 border-dashed border-primary-400/50 rounded-xl animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Features */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: 'Admin Monitored', color: 'text-primary-600' },
                { icon: Lock, label: 'Encrypted Storage', color: 'text-secondary-600' },
                { icon: Eye, label: 'Real-time Tracking', color: 'text-accent-600' },
                { icon: Users, label: 'Multi-sig Access', color: 'text-green-600' }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white/50 dark:bg-neutral-900/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${feature.color.replace('text', 'bg').replace('600', '100')} dark:${feature.color.replace('text', 'bg').replace('600', '900/20')}`}>
                      {React.createElement(feature.icon, { 
                        className: `w-4 h-4 ${feature.color} dark:${feature.color.replace('600', '400')}`
                      })}
                    </div>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {feature.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Features & Wallet Selector */}
          <div className="space-y-8">
            {/* Wallet Selector */}
            <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 rounded-3xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                Available Wallets
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {wallets.map((wallet) => {
                  const isActive = wallet.id === activeWallet
                  return (
                    <button
                      key={wallet.id}
                      onClick={() => setActiveWallet(wallet.id)}
                      className={`relative rounded-xl p-4 transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-2 border-primary-300 dark:border-primary-700'
                          : 'bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 hover:border-primary-200 dark:hover:border-primary-800'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${wallet.color} flex items-center justify-center`}>
                          {React.createElement(wallet.icon, { className: "w-5 h-5 text-white" })}
                        </div>
                        <div className="text-left">
                          <div className={`font-semibold ${
                            isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'
                          }`}>
                            {wallet.name}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {wallet.type === 'crypto' ? 'Crypto' : 'Fiat'}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Feature Cards */}
            <div className="space-y-6">
              {[
                {
                  icon: Smartphone,
                  title: "QR Code Support",
                  description: "Fast transfers with scannable QR codes for all supported currencies.",
                  gradient: "from-primary-500 to-primary-600"
                },
                {
                  icon: Globe,
                  title: "Multi-Currency Support",
                  description: "Handle both crypto and fiat currencies in a unified, secure interface.",
                  gradient: "from-secondary-500 to-secondary-600"
                },
                {
                  icon: Shield,
                  title: "Admin-Monitored Safety",
                  description: "24/7 monitoring by our security team to ensure maximum protection.",
                  gradient: "from-accent-500 to-accent-600"
                },
                {
                  icon: Bell,
                  title: "Real-time Alerts",
                  description: "Instant notifications for deposits, withdrawals, and suspicious activity.",
                  gradient: "from-green-500 to-emerald-600"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group bg-white/50 dark:bg-neutral-900/50 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      {React.createElement(feature.icon, { className: "w-6 h-6 text-white" })}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats & Security Section */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Security Badge */}
          <div className="md:col-span-2 bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/10 dark:to-secondary-900/10 rounded-2xl p-8 border border-primary-200 dark:border-primary-800">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  Bank-Level Security
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400">
                  All wallets are protected with military-grade encryption, multi-signature technology, 
                  and continuous monitoring by our security team.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <h4 className="font-bold text-neutral-900 dark:text-white mb-6">Wallet Stats</h4>
            <div className="space-y-4">
              {[
                { label: 'Supported Currencies', value: '25+', icon: Globe },
                { label: 'Active Wallets', value: '100K+', icon: Wallet },
                { label: 'Secure Transactions', value: '$10B+', icon: Shield },
                { label: 'Uptime', value: '99.99%', icon: RefreshCw }
              ].map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                      {React.createElement(stat.icon, { 
                        className: "w-4 h-4 text-primary-600 dark:text-primary-400" 
                      })}
                    </div>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {stat.label}
                    </span>
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-neutral-900 dark:text-white">
                  Ready to get started?
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Create your secure multi-currency wallet today
                </div>
              </div>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
              Create Wallet
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WalletSystem