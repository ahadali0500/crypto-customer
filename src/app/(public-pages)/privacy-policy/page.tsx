'use client'

import React, { useEffect, useState } from 'react'
import { Shield, Lock, FileText, Sparkles, ChevronRight } from 'lucide-react'
import axios from 'axios'

interface PrivacyContent {
  title?: string
  lastUpdated?: string
  sections?: Array<{ title: string; content: string }>
}

const PrivacyPolicyPage = () => {
  const [content, setContent] = useState<PrivacyContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<number | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/content/privacy-policy`
        )
        if (response.data?.data) {
          setContent(response.data.data)
        }
      } catch (error) {
        setContent({
          title: 'Privacy Policy',
          lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          sections: [
            {
              title: 'Information Collection',
              content: 'We collect personal information you provide directly (name, email, phone) and automatically (IP address, browser data, usage patterns) to deliver and improve our services.'
            },
            {
              title: 'Use of Information',
              content: 'Your information helps us provide, maintain, and improve services, process transactions, send support communications, and analyze usage trends for better user experiences.'
            },
            {
              title: 'Information Sharing',
              content: 'We do not sell or rent personal information. Information may be shared only with trusted service providers who maintain confidentiality and assist in platform operations.'
            },
            {
              title: 'Data Security',
              content: 'We implement industry-standard security measures to protect your data. While we strive for maximum security, no online transmission or storage method is 100% secure.'
            },
            {
              title: 'Your Rights',
              content: 'You have rights to access, update, or delete personal information. You may also opt out of communications. Contact support to exercise these rights.'
            },
            {
              title: 'Cookies & Tracking',
              content: 'We use cookies and similar technologies to enhance platform functionality and analyze usage. You can control cookie preferences through your browser settings.'
            },
            {
              title: 'Policy Updates',
              content: 'We may update this Privacy Policy periodically. Changes will be posted here with updated "Last Updated" dates. Continued use constitutes acceptance.'
            }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/20 via-white/90 to-secondary-50/20 dark:from-primary-950/10 dark:via-neutral-900 dark:to-secondary-950/10" />
        
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-primary-300/10 to-secondary-300/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border border-primary-200 dark:border-primary-800/30 mb-4">
            <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
              Data Protection
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            <span className="text-transparent bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#c026d3] bg-clip-text">
              Privacy
            </span>
            <span className="text-neutral-900 dark:text-white"> Policy</span>
          </h1>
          
          {content?.lastUpdated && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Last Updated:</span>
              <span className="font-medium text-neutral-900 dark:text-white">{content.lastUpdated}</span>
            </div>
          )}
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl p-6 border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg">
            {/* Privacy Commitment */}
            <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-primary-900 dark:text-primary-300 text-sm mb-1">
                    Our Privacy Commitment
                  </h3>
                  <p className="text-primary-800 dark:text-primary-400 text-xs">
                    We are committed to protecting your personal information and being transparent about how we collect, use, and safeguard your data.
                  </p>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="mb-8">
              <h3 className="font-bold text-neutral-900 dark:text-white mb-3 text-sm">Policy Sections</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(content?.sections || []).map((section, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const element = document.getElementById(`section-${index}`)
                      element?.scrollIntoView({ behavior: 'smooth' })
                      setActiveSection(index)
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
                      activeSection === index
                        ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                        : 'bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                      <span className="font-medium text-neutral-900 dark:text-white text-sm">
                        {section.title}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {(content?.sections || []).map((section, index) => (
                <div 
                  key={index} 
                  id={`section-${index}`}
                  className="border-b border-neutral-200 dark:border-neutral-700 last:border-b-0 pb-6 last:pb-0 scroll-mt-20"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm ml-11">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Contact Section */}
            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/10 dark:to-secondary-900/10 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">
                      Privacy Questions?
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-3">
                      If you have questions about our Privacy Policy or data practices, please contact our support team.
                    </p>
                    <a
                      href="/contact"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-md hover:shadow-md transition-all duration-300 text-sm"
                    >
                      Contact Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPolicyPage