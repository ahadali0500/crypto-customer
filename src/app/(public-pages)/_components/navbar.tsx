'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  LayoutDashboard,
  Info,
  Mail,
  ArrowRight,
} from 'lucide-react'
import CurrencySlider from './home/currency-slider'
import logo from '../../../../public/img/logo/logo.png'

const navLinks = [
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact'},
]

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  /* -------- AUTH CHECK -------- */
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken')
      setIsAuthenticated(!!token)
    }

    checkAuth()
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  /* -------- SCROLL EFFECT -------- */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-500
        ${
          scrolled
            ? 'bg-slate-900 backdrop-blur-xl shadow-xl border-b border-neutral-700'
            : 'bg-[#111827f2]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-16">
            {/* -------- LEFT SIDE (LOGO + LINKS) -------- */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src={logo.src} alt="Bexchange Logo" className="w-8 h-8" />
                </div>
                <span className="text-xl font-semibold text-white">
                  Bexchange.io
                </span>
              </Link>

            
            
            </div>

            {/* -------- RIGHT SIDE (CTA) -------- */}
            <div className="hidden lg:flex">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-3
                             px-6 py-2.5 rounded-lg
                             text-sm font-semibold text-white
                             bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]
                             shadow-md hover:shadow-lg hover:brightness-110
                             transition-all duration-300"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="group inline-flex items-center gap-3
                             px-8 py-2 rounded-lg
                             text-sm font-semibold text-white
                             bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]
                             shadow-md hover:shadow-lg hover:brightness-110
                             transition-all duration-300"
                >
                  Sign In
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              )}
            </div>

            {/* -------- MOBILE TOGGLE -------- */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-neutral-700 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* -------- MOBILE MENU -------- */}
        {open && (
          <div className="lg:hidden bg-slate-800 backdrop-blur-xl animate-in slide-in-from-top duration-300">
            <div className="flex flex-col px-4 py-6 gap-4">
            

              <div className="pt-4 border-t border-neutral-700">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="group inline-flex items-center gap-3
                             px-6 py-2.5 rounded-lg
                             text-sm font-semibold text-white
                             bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]
                             shadow-md hover:shadow-lg hover:brightness-110
                             transition-all duration-300"
                  >
                    <LayoutDashboard size={20} />
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-center gap-3
                               px-9 py-1 rounded-lg font-semibold text-white
                               bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]
                               shadow-md hover:shadow-lg hover:brightness-110
                               transition-all duration-300"
                  >
                    Sign In
                    <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------- CURRENCY SLIDER -------- */}
        <CurrencySlider />
      </nav>
    </>
  )
}

export default Navbar
