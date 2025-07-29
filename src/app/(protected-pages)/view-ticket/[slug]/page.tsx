'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Button, Spinner } from '@/components/ui'
import RichTextEditor from '@/components/shared/RichTextEditor'
import classNames from 'classnames'

interface TicketMessage {
  id: number
  message: string
  ticketId: number
  createdAt: string
  updatedAt: string
  type?: 'customer' | 'admin' // Add this
  sender?: 'user' | 'admin'
  userId?: number
  adminId?: number
  isFromAdmin?: boolean
}

interface TicketDetail {
  id: number
  subject: string
  type: 'Solved' | 'Pending'
  customerId: number
  createdAt: string
  updatedAt: string
  ticketMessage: TicketMessage[]
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params?.slug || params?.id
  const [editorKey, setEditorKey] = useState<number>(0)
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

  const formatDate = (date: Date) => {
    const today = new Date()
    const messageDate = new Date(date)

    if (messageDate.toDateString() === today.toDateString()) return 'Today'

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === yesterday.toDateString())
      return 'Yesterday'

    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

// Update the isCustomerMessage function in the client component
const isCustomerMessage = (message: TicketMessage) => {
  // Use the type field if available
  if (message.type) {
    return message.type === 'customer';
  }
  
  // Fallback to previous logic if type isn't available
  if (message.sender) return message.sender === 'user';
  if (typeof message.isFromAdmin === 'boolean') return !message.isFromAdmin;
  if (message.adminId) return false;
  if (message.userId) return true;
  return true;
};

  const fetchTicketDetail = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/ticket/fetch/${ticketId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTicket(response.data.data)
    } catch (error) {
      console.error('Error fetching ticket detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    const plainText = newMessage.replace(/<[^>]+>/g, '').trim()
    if (!plainText || sending) return

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    if (!token) return

    setSending(true)
    try {
      const formData = new FormData()
      formData.append('ticketId', String(ticketId))
      formData.append('message', newMessage)

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/ticket/reply`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      await fetchTicketDetail()
      setNewMessage('')
      setEditorKey(prev => prev + 1)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleEditorChange = (content: { html: string }) => {
    setNewMessage(content.html)
  }

  useEffect(() => {
    if (ticketId) fetchTicketDetail()
  }, [ticketId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size={40} />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Ticket not found</h2>
          <Button onClick={() => router.push('/view-ticket')}>Go Back</Button>
        </div>
      </div>
    )
  }
// console.log('ticlet:', ticket);
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">Ticket #{ticket.id}</h1>
              <span className={`px-2 py-1 text-xs rounded-full ${
                ticket.type === 'Solved' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {ticket.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Subject: {ticket.subject}
            </p>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      {/* Chat messages - UPDATED SECTION */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ticket.ticketMessage.map((message, index) => {
          const messageDate = new Date(message.createdAt)
          const showDate = index === 0 || 
            formatDate(messageDate) !== formatDate(new Date(ticket.ticketMessage[index - 1].createdAt))
          const isFromCustomer = isCustomerMessage(message)
          
          return (
            <div key={message.id} className="space-y-1">
              {showDate && (
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 my-4">
                  {formatDate(messageDate)}
                </div>
              )}

              <div className={`flex ${isFromCustomer ? 'justify-end' : 'justify-start'}`}>
                <div className={classNames(
                  'max-w-[80%] lg:max-w-[60%] px-4 py-2 rounded-lg',
                  'flex flex-col space-y-1',
                  isFromCustomer
                    ? 'bg-blue-500 text-white rounded-br-none' // Customer messages (right)
                    : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none' // Admin messages (left)
                )}>
                  <div className={classNames(
                    'text-xs font-medium',
                    isFromCustomer ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {isFromCustomer ? 'You' : 'Support Team'}
                  </div>
                  <div 
                    className="text-sm break-words"
                    dangerouslySetInnerHTML={{ __html: message.message }}
                  />
                  <div className={classNames(
                    'text-xs self-end',
                    isFromCustomer ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {formatTime(messageDate)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input area */}
      {ticket.type !== 'Solved' && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-3">
            <RichTextEditor
              key={editorKey}
              onChange={handleEditorChange}
              editorContentClass="min-h-[120px]"
              placeholder="Type your message..."
            />
            <div className="flex justify-end">
              <Button 
                onClick={sendMessage} 
                variant="solid"
                size='sm'
                disabled={sending || !newMessage.replace(/<[^>]+>/g, '').trim()}
              >
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}