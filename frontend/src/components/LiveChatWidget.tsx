'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { MessageSquare, X, Send, Minimize2 } from 'lucide-react'

interface ChatMessage {
  id: string
  message: string
  sender: 'user' | 'admin' | 'system'
  timestamp: Date
  senderName: string
}

interface ChatSession {
  id: string
  status: 'active' | 'waiting' | 'closed'
  messages: ChatMessage[]
}

export default function LiveChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const [userInfo, setUserInfo] = useState({ name: '', email: '' })
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isAdminPage = pathname?.startsWith('/admin')

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Play notification sound for new messages
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAkBSx+zPLdehobXrPo6atWFAlFmuGyvjEKChVKb7PV5p9FBgo7kNLxzXEpBSCAzPPwI9B')
      audio.volume = 0.3
      audio.play().catch(() => {}) // Ignore errors if audio can't play
    } catch (_error) {
      // Silently ignore audio errors
    }
  }

  useEffect(() => {
    if (!isAdminPage) {
      scrollToBottom()
      
      // Check for new messages and play sound
      if (chatSession?.messages && chatSession.messages.length > lastMessageCount && lastMessageCount > 0) {
        const newMessages = chatSession.messages.slice(lastMessageCount)
        const hasNewAdminMessage = newMessages.some(msg => msg.sender === 'admin')
        
        if (hasNewAdminMessage) {
          if (!isOpen) {
            playNotificationSound()
            setUnreadCount(prev => prev + newMessages.filter(msg => msg.sender === 'admin').length)
          }
        }
      }
      
      setLastMessageCount(chatSession?.messages?.length || 0)
    }
  }, [chatSession?.messages, lastMessageCount, isOpen, isAdminPage])

  // Reset unread count when chat is opened
  useEffect(() => {
    if (!isAdminPage && isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen, isAdminPage])

  // Auto refresh messages every 10 seconds when chat is active
  useEffect(() => {
    if (isAdminPage || !chatSession?.id || !hasStartedChat) return

    const pollMessages = async () => {
      try {
        const response = await fetch(`/api/chat/sessions/${chatSession.id}`)
        if (response.ok) {
          const data = await response.json()
          setChatSession(data.session)
        }
      } catch (error) {
        console.error('Error polling messages:', error)
      }
    }

    const interval = setInterval(pollMessages, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [chatSession?.id, hasStartedChat, isAdminPage])

  // Check for existing session in localStorage
  useEffect(() => {
    if (!isAdminPage) {
      const savedSession = localStorage.getItem('chat_session_id')
      const savedUserInfo = localStorage.getItem('chat_user_info')
      
      if (savedSession && savedUserInfo) {
        setHasStartedChat(true)
        setUserInfo(JSON.parse(savedUserInfo))
        // Load existing chat session
        loadChatSession(savedSession)
      }
    }
  }, [isAdminPage])

  const loadChatSession = async (sessionId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/chat/sessions/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setChatSession(data.session)
      }
    } catch (error) {
      console.error('Error loading chat session:', error)
    } finally {
      setLoading(false)
    }
  }

  const startChat = async () => {
    if (!userInfo.name || !userInfo.email) return

    try {
      setLoading(true)
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userInfo.name,
          userEmail: userInfo.email
        })
      })

      if (response.ok) {
        const data = await response.json()
        setChatSession(data.session)
        setHasStartedChat(true)
        
        // Save to localStorage
        localStorage.setItem('chat_session_id', data.session.id)
        localStorage.setItem('chat_user_info', JSON.stringify(userInfo))
      }
    } catch (error) {
      console.error('Error starting chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !chatSession || sending) return

    try {
      setSending(true)
      const response = await fetch(`/api/chat/sessions/${chatSession.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        setChatSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, data.message]
        } : null)
        setMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (hasStartedChat) {
        sendMessage()
      } else {
        startChat()
      }
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('sq-AL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Don't show chat widget on admin pages
  if (isAdminPage) {
    return null
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 relative"
        >
          <MessageSquare size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-2xl border transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-80 h-96'
      }`}>
        {/* Header */}
        <div className="bg-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} />
            <h3 className="font-semibold">Live Chat Support</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-blue-600 p-1 rounded"
            >
              <Minimize2 size={16} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-600 p-1 rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Chat Content */}
            <div className="h-64 flex flex-col">
              {!hasStartedChat ? (
                /* Start Chat Form */
                <div className="p-4 space-y-3">
                  <p className="text-sm text-gray-600">
                    Përshëndetje! Si mund t&apos;ju ndihmojmë sot?
                  </p>
                  <div>
                    <input
                      type="text"
                      placeholder="Emri juaj"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email juaj"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                      onKeyPress={handleKeyPress}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={startChat}
                    disabled={!userInfo.name || !userInfo.email || loading}
                    className="w-full bg-blue-500 text-white py-2 rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Duke filluar...' : 'Fillo Chat'}
                  </button>
                </div>
              ) : (
                /* Chat Messages */
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                      <div className="text-center text-gray-500 text-sm">
                        Duke ngarkuar...
                      </div>
                    ) : chatSession?.messages.length === 0 ? (
                      <div className="text-center text-gray-500 text-sm">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p>Chat-i juaj ka filluar!</p>
                          <p className="text-xs mt-1">Një nga specialistët tanë do t&apos;ju përgjigjet së shpejti.</p>
                        </div>
                      </div>
                    ) : (
                      chatSession?.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              msg.sender === 'user'
                                ? 'bg-blue-500 text-white'
                                : msg.sender === 'admin'
                                ? 'bg-gray-200 text-gray-900'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            <p>{msg.message}</p>
                            <p className={`text-xs mt-1 ${
                              msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Shkruani mesazhin..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sending}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!message.trim() || sending}
                        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
