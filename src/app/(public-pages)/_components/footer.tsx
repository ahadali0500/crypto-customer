'use client'

import React from 'react'
import Link from 'next/link'
import { BsTwitter, BsGithub, BsLinkedin } from 'react-icons/bs'
import logo from "../../../../public/img/logo/logo.png"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-800 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-3">
              <img src={logo.src} alt="GlobaCoin" className="w-9 h-9" />
              <span className="text-white font-semibold text-lg">Bexchange.io</span>
            </Link>
            <p className="text-sm leading-relaxed">
             A secure cryptocurrency platform focused on usability and security
            </p>
          </div>
          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms-and-conditions" className="hover:text-white">Term & Conditions</Link></li>
              <li><Link href="/" className="hover:text-white">Security</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/faqs" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t text-center border-white/10 mt-12 pt-6 ">

          {/* Copyright */}
          <p className="text-sm">
            © {currentYear} Bexchange. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer
