import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common'
import { Shield, TrendingUp, Zap } from 'lucide-react'

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.03%3E%3Ccircle cx=30 cy=30 r=1/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>



                <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
                    {/* Left side - Branding and features */}
                    <div className="hidden lg:block space-y-8">

                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold text-white leading-tight">
                                Trade with Confidence on the{" "} <br />
                                <span className="bg-gradient-to-r from-primary-mild to-primary-deep bg-clip-text text-transparent">
                                    Future of Finance
                                </span>
                            </h2>
                            <p className="text-base text-slate-300 leading-relaxed">
                                Access advanced trading tools, real-time market data, and institutional-grade security for your
                                cryptocurrency investments.
                            </p>
                        </div>


                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-white text-lg font-semibold">Bank-Grade Security</div>
                                    <p className="text-slate-400 text-sm">Multi-layer encryption & cold storage</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-white text-lg font-semibold">Lightning Fast Trades</div>
                                    <p className="text-slate-400 text-sm">Execute orders in milliseconds</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-white text-lg font-semibold">Advanced Analytics</div>
                                    <p className="text-slate-400 text-sm">Professional trading indicators</p>
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
