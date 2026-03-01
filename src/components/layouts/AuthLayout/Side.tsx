import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common'
import { Shield, Zap, BarChart3, Globe } from 'lucide-react'
import logo from '../../../../public/img/logo/logo.png'

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[oklch(0.24_0.03_260.32)] bg-white flex items-center justify-center p-4 transition-colors duration-300">
            <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Left side - Branding */}
                <div className="hidden lg:block">
                    <div className="mb-10">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 flex items-center justify-center">
                                <img src={logo.src} alt="Bexchange Logo" className="w-10 h-10" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Bexchange.io
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Professional Crypto Trading
                                </p>
                            </div>
                        </div>

                        {/* Headline */}
                        <h2 className="text-4xl font-bold leading-tight mb-4 text-gray-900 dark:text-white">
                            Trade Smarter,<br />
                            <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                                Trade Faster
                            </span>
                        </h2>

                        {/* Subtext */}
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            Join thousands of traders using our secure, high-performance platform for cryptocurrency trading.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        
                        {/* Secure */}
                        <div className="flex items-start gap-3 p-4 rounded-xl border
                            bg-white border-gray-200 shadow-sm
                            dark:bg-slate-800/50 dark:border-gray-700
                            transition-colors duration-300">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                bg-green-100 dark:bg-green-900/30">
                                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Secure</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Bank-level protection</p>
                            </div>
                        </div>

                        {/* Fast */}
                        <div className="flex items-start gap-3 p-4 rounded-xl border
                            bg-white border-gray-200 shadow-sm
                            dark:bg-slate-800/50 dark:border-gray-700
                            transition-colors duration-300">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                bg-blue-100 dark:bg-blue-900/30">
                                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Fast</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Instant execution</p>
                            </div>
                        </div>

                        {/* Advanced */}
                        <div className="flex items-start gap-3 p-4 rounded-xl border
                            bg-white border-gray-200 shadow-sm
                            dark:bg-slate-800/50 dark:border-gray-700
                            transition-colors duration-300">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                bg-purple-100 dark:bg-purple-900/30">
                                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Advanced</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Professional tools</p>
                            </div>
                        </div>

                        {/* Global */}
                        <div className="flex items-start gap-3 p-4 rounded-xl border
                            bg-white border-gray-200 shadow-sm
                            dark:bg-slate-800/50 dark:border-gray-700
                            transition-colors duration-300">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                bg-orange-100 dark:bg-orange-900/30">
                                <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Global</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">24/7 markets</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right side - Form */}
                <div className="w-full max-w-md mx-auto lg:mx-0">
                    {children && cloneElement(children as React.ReactElement<any>, { ...rest })}
                </div>

            </div>
        </div>
    )
}

export default Side