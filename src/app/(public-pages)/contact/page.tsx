'use client'

import React, { useEffect, useState } from 'react'
import {
    Mail,
    Phone,
    MapPin,
    Send,
    MessageSquare,
    Clock,
    Sparkles,
} from 'lucide-react'
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
        message: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/content/contact`,
                )
                if (response.data?.data) {
                    setContent(response.data.data)
                }
            } catch (error) {
                setContent({
                    title: 'Contact Us',
                    description:
                        "Get in touch with our support team. We're here to help you 24/7 with any inquiries.",
                    email: 'support@bexchange.io',
                    phone: '+1 (555) 123-4567',
                    address: '123 Innovation Street, Tech City, TC 12345',
                    officeHours: '24/7 Support Available',
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
            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/contact-message/create`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            )

            setSubmitted(true)
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
            })

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
            <div className="min-h-screen flex items-center justify-center bg-slate-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#111827f2]">
            {/* Hero Section */}
            <section className="relative py-16 px-4 overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 backdrop-blur-sm border border-white/10 shadow-sm mb-4">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-blue-500">
                            Contact Support
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        <span className="text-slate-50">Contact </span>
                        <span className="text-transparent bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text">
                            Our Team
                        </span>
                    </h1>

                    <p className="text-lg text-slate-300 leading-relaxed max-w-xl mx-auto">
                        {content?.description}
                    </p>
                </div>
            </section>

            {/* Contact Information */}
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center mb-3">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-slate-50 mb-1">Email</h3>
                        <p className="text-slate-300 text-sm">
                            {content?.email}
                        </p>
                    </div>

                    {/* <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center mb-3">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-slate-50 mb-1">Phone</h3>
            <p className="text-slate-300 text-sm">
              {content?.phone}
            </p>
          </div> */}

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center mb-3">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-slate-50 mb-1">
                            Support Hours
                        </h3>
                        <p className="text-slate-300 text-sm">
                            {content?.officeHours}
                        </p>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-50">
                                Send Message
                            </h2>
                        </div>

                        {submitted && (
                            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-400/20 rounded-lg">
                                <p className="text-emerald-400 text-sm">
                                    Thank you! Your message has been sent
                                    successfully.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-slate-50 placeholder-slate-400 focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] text-sm"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-slate-50 placeholder-slate-400 focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] text-sm"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            subject: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-slate-50 placeholder-slate-400 focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] text-sm"
                                    placeholder="What is this regarding?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1">
                                    Message
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            message: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-slate-50 placeholder-slate-400 focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] text-sm resize-none"
                                    placeholder="Tell us how we can help..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full px-4 py-2.5 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white rounded-lg font-semibold hover:shadow-md hover:shadow-blue-500/30 hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
