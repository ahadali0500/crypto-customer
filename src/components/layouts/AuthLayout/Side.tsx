import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common'
import { Shield, Zap, BarChart3, Globe, Clock, Users } from 'lucide-react'
import logo from '../../../../public/img/logo/logo.png'
type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                {/* Left side - Branding */}
                <div className="hidden lg:block">
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 flex items-center justify-center">
                                <img src={logo.src} alt="Bexchange Logo" className="w-10 h-10" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bexchange.io</h1>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Professional Crypto Trading</p>
                            </div>
                        </div>
                        
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
                            Trade Smarter,<br />
                            <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                                Trade Faster
                            </span>
                        </h2>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                            Join thousands of traders using our secure, high-performance platform for cryptocurrency trading.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Secure</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Bank-level protection</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Fast</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Instant execution</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Advanced</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Professional tools</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Global</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">24/7 markets</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Sign in form */}
                <div className="w-full max-w-md mx-auto lg:mx-0">
                    {children && cloneElement(children as React.ReactElement<any>, { ...rest })}
                </div>
            </div>
        </div>
    )
}

export default Side