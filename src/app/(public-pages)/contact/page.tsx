'use client'

import React, { useEffect, useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Sparkles } from 'lucide-react'
import axios from 'axios'

interface ContactContent {
  title?: string
  description?: string
  email?: string
  phone?: string
  address?: string
  officeHours?: string
}

const ContactPage = () => {
  const [content, setContent] = useState<ContactContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/content/contact`
        )
        if (response.data?.data) {
          setContent(response.data.data)
        }
      } catch (error) {
        setContent({
          title: 'Contact Us',
          description: 'Get in touch with our support team. We\'re here to help you 24/7 with any inquiries.',
          email: 'support@innovateco.com',
          phone: '+1 (555) 123-4567',
          address: '123 Innovation Street, Tech City, TC 12345',
          officeHours: '24/7 Support Available'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/contact`,
        formData,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json'
          }
        }
      )
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error('Error submitting contact form:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

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
              Contact Support
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-neutral-900 dark:text-white">Contact </span>
            <span className="text-transparent bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#c026d3] bg-clip-text">
              Our Team
            </span>
          </h1>
          
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
            {content?.description}
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white mb-1">Email</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              {content?.email}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-secondary-300 dark:hover:border-secondary-700 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-secondary-500 to-secondary-600 flex items-center justify-center mb-3">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white mb-1">Phone</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              {content?.phone}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-accent-300 dark:hover:border-accent-700 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white mb-1">Support Hours</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              {content?.officeHours}
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl p-6 border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Send Message</h2>
            </div>

            {submitted && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-400 text-sm">Thank you! Your message has been sent successfully.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="What is this regarding?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg font-semibold hover:shadow-md hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage