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
        // Fallback content
        setContent({
          title: 'Terms of Use',
          lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          sections: [
            {
              title: '1.1 Acceptance of these terms',
              content: 'By using this Website and its Services, you acknowledge that you have read, understood, and agree to these Terms of Use on your behalf and on behalf of any entity you represent. The term "person" in this context refers to any natural or legal entity, whether acting personally, as a trustee, or otherwise. If you do not agree to these terms, you must not access or use this Website or its Services.'
            },
            {
              title: '1.2 Modifications to terms and the website',
              content: 'The Company may, at its discretion, update or change parts of these Terms of Use at any time without prior notice. Such changes take effect immediately upon posting on the Website. Regularly reviewing this page for updates is advised. Discontinuation of use is required if the revised terms are not acceptable. Continued use after changes indicates acceptance of the new terms. The Company may also alter or discontinue any website aspect or service without notice, including changes to features, fees, or content.'
            },
            {
              title: '1.3 Additional agreements',
              content: 'These Terms of Use supplement any other agreements you or your represented entities may have with the Company. If there is a conflict between these Terms and another agreement, these Terms govern your use of the Website and its Services.'
            },
            {
              title: '2.1 Cryptocurrency risks',
              content: 'Trading and holding cryptocurrencies involves significant risk. You should carefully consider if this is right for you based on your financial situation. Cryptocurrency values can fluctuate dramatically.'
            },
            {
              title: '2.2 Past performance',
              content: 'Information on past performance of cryptocurrencies does not predict future results. Investments may increase or decrease in value, influenced by market volatility and other factors.'
            },
            {
              title: '2.3 Security risks',
              content: 'Cryptocurrency trading may be compromised by hacking, legal changes, and other threats.'
            },
            {
              title: '2.4 Informational use only',
              content: 'Information on this website is for personal use and should not be considered investment advice.'
            },
            {
              title: '2.5 No investment advice',
              content: 'Coinxpot does not offer investment advice. All trading decisions are your responsibility and Coinxpot is not liable for any losses incurred.'
            },
            {
              title: '2.6 Seek advice if unsure',
              content: 'Consult a professional if you are uncertain about any investment or financial decision.'
            },
            {
              title: '3.1 Age requirement',
              content: 'Users must be 18 years or older to register.'
            },
            {
              title: '3.2 One account per person',
              content: 'Keep your registration details current.'
            },
            {
              title: '3.3 Email access',
              content: 'Ensure you have access to the email linked to your account as it\'s necessary for communication.'
            },
            {
              title: '3.4 Account security',
              content: 'Do not impersonate others, share your password, allow others to use your account, or use someone else\'s account.'
            },
            {
              title: '3.5 Account responsibility',
              content: 'You are responsible for all activities under your account and for reporting unauthorized use.'
            },
            {
              title: '3.6 Access restrictions',
              content: 'We may limit access to parts of the site to registered users.'
            },
            {
              title: '3.7 Keep credentials confidential',
              content: 'Do not share your login details; Coinxpot may disable accounts if these terms are violated.'
            },
            {
              title: '4.1 Compliance with KYC and EDD',
              content: 'Coinxpot adheres to high standards for customer verification to prevent fraud.'
            },
            {
              title: '4.2 Synchronization deposit requirement',
              content: 'A synchronization deposit is required for any liquidation account holders verification, the deposit suppose to be withdrawn back as part of our verification process.'
            },
            {
              title: '4.3 Rights to restrict or terminate accounts',
              content: 'Coinxpot can limit or close accounts based on additional verification needs or false information.'
            },
            {
              title: '4.4 Account limitations',
              content: 'Multiple account creation may be limited and account security must be maintained by the user.'
            },
            {
              title: '5.1 Exchange use at own risk',
              content: 'The Coinxpot Exchange is for experienced users and is not available in all jurisdictions.'
            },
            {
              title: '5.2 Coinxpot\'s rights',
              content: 'Coinxpot may limit or refuse trades and impose conditions without notice.'
            },
            {
              title: '5.3 Acknowledgement of risks',
              content: 'Using the Coinxpot Exchange involves risks including technical issues that can affect trades.'
            },
            {
              title: '6.1 Transaction refusal',
              content: 'Coinxpot may refuse transactions for various reasons including legal restrictions or payment issues.'
            },
            {
              title: '6.2 Adjustments for refused transactions',
              content: 'Funds from refused transactions may be purchased by Coinxpot and returned minus costs.'
            },
            {
              title: '6.3 Account freezing',
              content: 'Under certain conditions, Coinxpot may freeze accounts and retain funds.'
            },
            {
              title: '6.4 Debt responsibility',
              content: 'You are liable for any losses on terminated transactions.'
            },
            {
              title: '6.5 No profit payments',
              content: 'Coinxpot will not pay profits from terminated transactions.'
            },
            {
              title: '6.6 Interest on unpaid sums',
              content: 'Interest may be charged on any overdue amounts.'
            },
            {
              title: '6.7 Written explanation for refusal or termination',
              content: 'If a transaction is refused or terminated, a detailed explanation will be provided.'
            },
            {
              title: '7.1 Fee structure',
              content: 'You are responsible for fees associated with trades made through our services, as detailed in our Fee Schedule, which may be updated.'
            },
            {
              title: '7.2 Third-party fees',
              content: 'Additional fees may be imposed by external accounts, which are separate from our transaction screens.'
            },
            {
              title: '7.3 Collection costs',
              content: 'If fees or other amounts are unpaid, a collection fee may be charged.'
            },
            {
              title: '8.1 Importance of security',
              content: 'You are primarily responsible for the security of your Coinxpot Account.'
            },
            {
              title: '8.2 Risks of inadequate security',
              content: 'Failure to secure your account adequately may lead to unauthorized access and potential losses.'
            },
            {
              title: '8.3 Threats to account security',
              content: 'Your account may be vulnerable to various cyber threats.'
            },
            {
              title: '8.4 Authentication recommendations',
              content: 'Always verify the authenticity of communications from Coinxpot.'
            },
            {
              title: '8.5 Country-specific and exchange-specific restrictions',
              content: 'Some countries and exchanges may be blocked, requiring synchronization with an additional wallet.'
            },
            {
              title: '8.6 Ownership of private keys',
              content: 'Coinxpot retains control over the private keys associated with your account.'
            },
            {
              title: '8.7 Limitations on private key use',
              content: 'Coinxpot will not perform actions requiring private key signatures and does not provide access to funds linked to private keys, except as specified.'
            },
            {
              title: '9.1 No guarantee of uninterrupted service',
              content: 'Coinxpot does not warrant continuous access to its services or accounts.'
            },
            {
              title: '10.1 Network responsibility',
              content: 'Transactions using your Coinxpot Account depend on external cryptocurrency networks for confirmation and recording.'
            },
            {
              title: '10.2 Transaction conditions',
              content: 'Submitted transactions require network confirmation and are not final until confirmed.'
            },
            {
              title: '10.3 Disclaimer regarding network operations',
              content: 'Coinxpot is not liable for the operation or maintenance of underlying cryptocurrency network software.'
            },
            {
              title: '11.1 Compliance with international regulations',
              content: 'Your use of the Coinxpot Site must comply with all applicable sanctions and export controls.'
            },
            {
              title: '11.2 Restricted use',
              content: 'If you fall under certain sanctioned categories, you may not use your Coinxpot Account.'
            },
            {
              title: '12.1 Upgrading to premium',
              content: 'A specific deposit is required to upgrade to a premium account.'
            },
            {
              title: '12.2 Benefits of a premium account',
              content: 'Premium accounts offer enhanced services including faster withdrawals, premium trading management tolls, and exclusive trading pairs.'
            },
            {
              title: '12.3 Premium status for account functionality',
              content: 'Users with certain account conditions must obtain premium status to enable withdrawals and transfers.'
            },
            {
              title: '12.4 Maintenance of premium status',
              content: 'Transaction minimums must be met to maintain or upgrade premium status.'
            },
            {
              title: '13.1 Account closure process',
              content: 'You can request account closure through the Help Centre once certain conditions are met.'
            },
            {
              title: '13.2 Consequences of account closure',
              content: 'Access to your account will be terminated, and any remaining funds may be retained by Coinxpot.'
            },
            {
              title: '13.3 Liquidation account closure',
              content: 'Liquidation account will be automatically closed with the full withdrawal of the locked block.'
            },
            {
              title: '14.1 Grounds for account restriction',
              content: 'Coinxpot may restrict or terminate accounts for reasons including suspected errors, fraud, or regulatory concerns.'
            },
            {
              title: '14.2 Notification and disclosure of account restrictions',
              content: 'Efforts will be made to notify you of account restrictions unless prohibited by law.'
            },
            {
              title: '14.3 Account termination procedures',
              content: 'If terminated, your cryptocurrency will be liquidated and the value transferred to your local currency wallet.'
            },
            {
              title: '14.4 Rights to withdraw funds manually',
              content: 'Coinxpot may manually process withdrawals for certain accounts under specific conditions.'
            },
            {
              title: '15.1 Restrictions on account use',
              content: 'Your Coinxpot Account must not be used for illegal activities, fraud, or other prohibited actions.'
            },
            {
              title: '15.2 Prohibited business activities',
              content: 'Without Coinxpot\'s written approval, your account cannot be used for certain high-risk business activities.'
            },
            {
              title: '15.3 Actions on violation',
              content: 'Coinxpot reserves the right to restrict or close accounts involved in prohibited activities.'
            },
            {
              title: '16.1 "As-is" basis',
              content: 'The Coinxpot Site and services are provided without warranties of any kind, express or implied.'
            },
            {
              title: '16.2 Jurisdictional consumer rights',
              content: 'Some disclaimers may not apply depending on local laws.'
            },
            {
              title: '17.1 Limitation of liability',
              content: 'Coinxpot, its affiliates, and their representatives are not liable for any damages (direct, indirect, special, etc.) arising from your use of the Coinxpot Site or Account. This includes any loss due to reliance on Coinxpot\'s information or errors.'
            },
            {
              title: '17.2 Liability cap',
              content: 'The total liability of Coinxpot and its affiliates for claims related to your use of the Coinxpot Site or Account is limited to the fees you paid to Coinxpot in the six months preceding the claim. Some jurisdictions do not allow exclusions or limitations, so some limitations may not apply to you.'
            },
            {
              title: '18.1 Dispute resolution',
              content: 'You and Coinxpot agree to notify each other of any dispute within 30 days and attempt to resolve it informally before taking legal action.'
            },
            {
              title: '18.2 Governing law and jurisdiction',
              content: 'This agreement is governed by Maltese law. Disputes will be submitted to the non-exclusive jurisdiction of the courts of Malta.'
            },
            {
              title: '18.3 Individual claims',
              content: 'Claims must be brought individually, not as part of a class action. No consolidation of claims is allowed without both parties\' consent.'
            },
            {
              title: '18.4 Severability of class action waiver',
              content: 'If the class action waiver is deemed invalid, the rest of this dispute clause remains in effect.'
            },
            {
              title: '19.1 Indemnity',
              content: 'You agree to indemnify and hold Coinxpot and its representatives harmless from any claim, loss, or expense arising from your use of the services, your feedback, your violation of these Terms, or your violation of any rights of others. Coinxpot has the right to control any related action or proceeding.'
            },
            {
              title: 'Entire Agreement; Order of Precedence',
              content: 'These Terms are the entire agreement and supersede prior understandings. Conflicts with other agreements are controlled by the other agreement if these Terms are specifically overridden.'
            },
            {
              title: 'Amendment',
              content: 'Terms may be modified at Coinxpot\'s discretion with notice. Continued use of services after notice indicates acceptance.'
            },
            {
              title: 'Waiver',
              content: 'Failure to enforce any provision is not a waiver.'
            },
            {
              title: 'Severability',
              content: 'Invalid provisions do not affect remaining terms.'
            },
            {
              title: 'Force Majeure',
              content: 'Coinxpot is not liable for delays or failures due to events beyond its control.'
            },
            {
              title: 'Assignment',
              content: 'Rights cannot be assigned without consent; Coinxpot may assign rights without consent.'
            },
            {
              title: 'Headings',
              content: 'Section headings do not affect interpretation.'
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
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl p-6 border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg">
            {/* Important Notice */}
            <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-yellow-900 dark:text-yellow-300 text-sm mb-1">
                    Important Notice
                  </h3>
                  <p className="text-yellow-800 dark:text-yellow-400 text-xs">
                    By accessing and using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree, you must not access or use this Website or its Services.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="mb-8">
              <h3 className="font-bold text-neutral-900 dark:text-white mb-3 text-sm">Quick Navigation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { label: 'Acceptance of Terms', section: 0 },
                  { label: 'Risk Warning', section: 3 },
                  { label: 'Account Registration', section: 9 },
                  { label: 'Identity Verification', section: 16 },
                  { label: 'Exchange Terms', section: 19 },
                  { label: 'Transactions', section: 22 },
                  { label: 'Fees', section: 29 },
                  { label: 'Security', section: 32 },
                  { label: 'Premium Account', section: 41 },
                  { label: 'Limitation of Liability', section: 47 },
                  { label: 'Prohibited Activities', section: 44 },
                  { label: 'Dispute Resolution', section: 49 }
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const element = document.getElementById(`section-${item.section}`)
                      element?.scrollIntoView({ behavior: 'smooth' })
                      setActiveSection(item.section)
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${
                      activeSection === item.section
                        ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                        : 'bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent'
                    }`}
                  >
                    <ChevronRight className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                    <span className="font-medium text-neutral-900 dark:text-white text-xs">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {(content?.sections || []).map((section, index) => (
                <div 
                  key={index} 
                  id={`section-${index}`}
                  className="border-b border-neutral-200 dark:border-neutral-700 last:border-b-0 pb-8 last:pb-0 scroll-mt-20"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        {Math.floor(index/3) + 1}.{(index%3) + 1}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  <div className="ml-11 pl-2 border-l-2 border-primary-200 dark:border-primary-800">
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                      {section.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Acceptance Section */}
            <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
              <div className="bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/10 dark:to-secondary-900/10 rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                      <Scale className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">
                        Agreement Acceptance
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-xs">
                        By using our services, you acknowledge that you have read, understood, and agree to all terms outlined above.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors text-sm"
                    >
                      Back to Top
                    </button>
                    <a
                      href="/contact"
                      className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-md hover:shadow-md transition-all duration-300 text-sm"
                    >
                      Contact Legal Team
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