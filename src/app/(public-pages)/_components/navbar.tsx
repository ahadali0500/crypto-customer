// app/components/Navigation/Navbar.jsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogIn, LayoutDashboard, Shield, HelpCircle, Home, Zap, Info, Mail, FileText, Scale } from 'lucide-react'
import CurrencySlider from './currency-slider'
import logo from "../../../../public/img/logo/logo.png"
const Navbar = () => {
    const [open, setOpen] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const checkAuth = () => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('authToken')
                setIsAuthenticated(!!token)
            }
        }

        checkAuth()
        window.addEventListener('storage', checkAuth)
        const interval = setInterval(checkAuth, 1000)

        return () => {
            window.removeEventListener('storage', checkAuth)
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { href: '/', label: 'Home', icon: <Home size={18} /> },
        { href: '/about', label: 'About', icon: <Info size={18} /> },
        { href: '/contact', label: 'Contact', icon: <Mail size={18} /> },
        { href: '/privacy-policy', label: 'Privacy Policy', icon: <FileText size={18} /> },
        { href: '/terms-and-conditions', label: 'Terms', icon: <Scale size={18} /> },
    ]

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname?.startsWith(href)
    }

    return (
        <>
            <nav className={`w-full sticky top-0 z-50 transition-all duration-500 ${scrolled
                    ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-xl border-b border-neutral-200/50 dark:border-neutral-800/50'
                    : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 lg:h-20">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center gap-3 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                                <img src={logo.src} alt="Bexchange Logo" className="w-8 h-8" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-transparent text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#c026d3] bg-clip-text">
                                    Bexchange.io
                                </h1>
                            </div>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const active = isActive(link.href)
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${active
                                                ? 'bg-gradient-primary text-white shadow-lg shadow-primary/30'
                                                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary-600 dark:hover:text-primary-400'
                                            }`}
                                    >
                                        <span className={`transition-transform ${active ? 'scale-110' : ''}`}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                )
                            })}

                            {/* Auth Button */}
                            <div className="ml-4 pl-4 border-l border-neutral-300 dark:border-neutral-700">
                                {isAuthenticated ? (
                                    <Link
                                        href="/dashboard"
                                        className="px-6 py-2.5 bg-gradient-premium text-white rounded-xl hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300 flex items-center gap-2 text-sm font-semibold group animate-pulse-glow"
                                    >
                                        <LayoutDashboard size={18} className="transition-transform group-hover:rotate-12" />
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/sign-in"
                                        className="px-6 py-2.5 bg-gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 flex items-center gap-2 text-sm font-semibold group"
                                    >
                                        <LogIn size={18} className="transition-transform group-hover:translate-x-1" />
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            onClick={() => setOpen(!open)}
                            aria-label="Toggle menu"
                        >
                            {open ? (
                                <X size={24} className="text-neutral-700 dark:text-neutral-300" />
                            ) : (
                                <Menu size={24} className="text-neutral-700 dark:text-neutral-300" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {open && (
                    <div className="lg:hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-top duration-300">
                        <div className="flex flex-col px-4 py-6 gap-2">
                            {navLinks.map((link) => {
                                const active = isActive(link.href)
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className={`px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 flex items-center gap-3 ${active
                                                ? 'bg-gradient-primary text-white shadow-lg shadow-primary/30'
                                                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                            }`}
                                    >
                                        <span className={`transition-transform ${active ? 'scale-110' : ''}`}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                )
                            })}

                            {/* Mobile Auth Button */}
                            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                {isAuthenticated ? (
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setOpen(false)}
                                        className="px-5 py-3.5 bg-gradient-premium text-white rounded-xl hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300 flex items-center justify-center gap-3 font-semibold"
                                    >
                                        <LayoutDashboard size={20} />
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/sign-in"
                                        onClick={() => setOpen(false)}
                                        className="px-5 py-3.5 bg-gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-3 font-semibold"
                                    >
                                        <LogIn size={20} />
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <CurrencySlider />
            </nav>
        </>
    )
}

export default Navbar