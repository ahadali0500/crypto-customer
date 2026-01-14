'use client'

import React, { useEffect, useState } from 'react'
import { Info, Shield, Users, Target, CheckCircle, Sparkles } from 'lucide-react'
import axios from 'axios'

interface AboutContent {
  title?: string
  description?: string
  mission?: string
  vision?: string
  values?: Array<{ title: string; description: string }>
}

const AboutPage = () => {
  const [content, setContent] = useState<AboutContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/content/about`
        )
        if (response.data?.data) {
          setContent(response.data.data)
        }
      } catch (error) {
        setContent({
          title: 'About Our Platform',
          description: 'A leading cryptocurrency exchange platform dedicated to providing secure, transparent, and efficient currency exchange services with enterprise-grade security.',
          mission: 'To provide a secure and transparent platform for cryptocurrency and fiat currency exchanges, ensuring the highest level of customer satisfaction and security.',
          vision: 'To become the most trusted and reliable currency exchange platform globally, setting new standards in security, transparency, and customer service.',
          values: [
            {
              title: 'Security First',
              description: 'Military-grade encryption and multi-signature wallets to protect user assets.'
            },
            {
              title: 'Transparency',
              description: 'Complete transparency in all transactions, fees, and operational processes.'
            },
            {
              title: 'Customer Focus',
              description: '24/7 dedicated support team for personalized assistance and guidance.'
            },
            {
              title: 'Compliance',
              description: 'Strict adherence to international regulations and KYC/AML requirements.'
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
      <div className="min-h-screen flex items-center justify-center bg-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-sm mb-4">
            <Sparkles className="w-4 h-4 text-[#38bdf8]" />
            <span className="text-sm font-semibold text-slate-200">
              Our Story
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-slate-50">About </span>
            <span className="text-transparent bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text">
              Our Platform
            </span>
          </h1>
          
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {content?.description}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-50 mb-2">Our Mission</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {content?.mission}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-50 mb-2">Our Vision</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {content?.vision}
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-sm mb-3">
              <Info className="w-4 h-4 text-[#38bdf8]" />
              <span className="text-sm font-semibold text-slate-200">
                Core Values
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2">
              Our Guiding Principles
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto text-sm">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {content?.values?.map((value, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-50 mb-1">
                      {value.title}
                    </h3>
                    <p className="text-slate-300 text-sm">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Badge */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-slate-50 mb-1">
                  Enterprise-Grade Security
                </h3>
                <p className="text-slate-300 text-sm">
                  All accounts are created and verified by administrators with full KYC/AML compliance. 
                  We use military-grade encryption and multi-signature wallets to protect your assets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage