import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common'
import { Shield, TrendingUp, Zap } from 'lucide-react'

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
                    {/* Left side - Branding and features */}
                    <div className="hidden lg:block space-y-8">

                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                Trade with Confidence on the{" "} <br />
                                <span className="bg-gradient-to-r from-primary-mild to-primary-deep bg-clip-text text-transparent">
                                    Future of Finance
                                </span>
                            </h2>
                            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                Access advanced trading tools, real-time market data, and institutional-grade security for your
                                cryptocurrency investments.
                            </p>
                        </div>


                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-green-500" />
                                </div>
                                <div>
                                    <div className="text-gray-900 dark:text-white text-lg font-semibold">Bank-Grade Security</div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Multi-layer encryption & cold storage</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <div className="text-gray-900 dark:text-white text-lg font-semibold">Lightning Fast Trades</div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Execute orders in milliseconds</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-purple-500" />
                                </div>
                                <div>
                                    <div className="text-gray-900 dark:text-white text-lg font-semibold">Advanced Analytics</div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Professional trading indicators</p>
                                </div>
                            </div>
                        </div>

                      

                    </div>


                        {/* Right side - Sign in form */}
                        <div className="w-full max-w-md mx-auto lg:mx-0">

                            {children
                                ?
                                cloneElement(children as React.ReactElement<any>, {
                                    ...rest,
                                })
                                : null}

                        </div>
                </div>

            </div>
        </>

    )
}

export default Side
