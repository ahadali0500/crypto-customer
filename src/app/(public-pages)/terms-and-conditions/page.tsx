'use client'

import React, { useEffect, useState } from 'react'
import { Scale, FileText, AlertCircle, Sparkles, ChevronRight } from 'lucide-react'
import axios from 'axios'

interface TermsContent {
  title?: string
  lastUpdated?: string
  sections?: Array<{ title: string; content: string }>
}

const TermsAndConditionsPage = () => {
  const [content, setContent] = useState<TermsContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<number | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/content/terms-and-conditions`
        )
        if (response.data?.data) {
          setContent(response.data.data)
        }
      } catch (error) {
        setContent({
          title: 'Terms & Conditions',
          lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          sections: [
            {
              title: 'Acceptance of Terms',
              content: 'By accessing and using this platform, you accept and agree to be bound by these terms and conditions. If you do not agree, please do not use our services.'
            },
            {
              title: 'Account Registration',
              content: 'All accounts are created and verified by administrators with full KYC/AML compliance. You must provide accurate information during registration and maintain account security.'
            },
            {
              title: 'Use of Service',
              content: 'You agree to use our services only for lawful purposes. Any misuse that could damage, disable, or impair our systems is strictly prohibited.'
            },
            {
              title: 'Transactions',
              content: 'All transactions are subject to verification and approval by our administrators. Exchange rates may change and transactions can be refused at our discretion.'
            },
            {
              title: 'Fees and Charges',
              content: 'All applicable fees are clearly displayed before transaction completion. Fees are generally non-refundable unless specified otherwise in our policies.'
            },
            {
              title: 'Security Responsibility',
              content: 'You are responsible for maintaining account security. Immediately report any unauthorized access. We are not liable for losses from security breaches due to user negligence.'
            },
            {
              title: 'Prohibited Activities',
              content: 'Illegal activities including money laundering, fraud, terrorist financing, or any regulatory violations are strictly prohibited and may result in immediate account termination.'
            },
            {
              title: 'Limitation of Liability',
              content: 'To the maximum extent permitted by law, we shall not be liable for any indirect, consequential, or punitive damages arising from service use.'
            },
            {
              title: 'Terms Modification',
              content: 'We reserve the right to modify these terms at any time. Continued use after modifications constitutes acceptance of updated terms.'
            },
            {
              title: 'Termination Rights',
              content: 'We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms or suspicious activity.'
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
        
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-r from-primary-300/10 to-secondary-300/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border border-primary-200 dark:border-primary-800/30 mb-4">
            <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
              Legal Agreement
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            <span className="text-neutral-900 dark:text-white">Terms & </span>
            <span className="text-transparent bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#c026d3] bg-clip-text">
              Conditions
            </span>
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
            {/* Important Notice */}
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-yellow-900 dark:text-yellow-300 text-sm mb-1">
                    Important Notice
                  </h3>
                  <p className="text-yellow-800 dark:text-yellow-400 text-xs">
                    Please read these terms carefully before using our service. By using our platform, you agree to be bound by these terms and conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="mb-8">
              <h3 className="font-bold text-neutral-900 dark:text-white mb-3 text-sm">Table of Contents</h3>
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
                    <Scale className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">
                      Questions About Terms?
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-3">
                      If you have any questions about these Terms and Conditions, please contact us through our support channels.
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

export default TermsAndConditionsPage