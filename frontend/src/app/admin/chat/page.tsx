'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, Phone, Video, MoreVertical, Search, Clock, User, RefreshCw } from 'lucide-react'

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: string
  isAdmin: boolean
}

interface ChatRoom {
  id: string
  customerName: string
  customerEmail: string
  status: 'active' | 'waiting' | 'closed'
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages?: ChatMessage[]
}

export default function ChatSupportPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Get admin token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Fetch chat sessions
  const fetchChatSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/chat/sessions', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        const sessions = Array.isArray(data) ? data : (data.chatRooms || [])
        setChatRooms(sessions.map((s: any) => ({
          id: s.session_id || s.id,
            customerName: s.customer_name || s.customerName || 'Vizitor',
            customerEmail: s.customer_email || s.customerEmail || '---',
            status: 'active',
            lastMessage: s.messages?.[s.messages.length - 1]?.content || '',
            lastMessageTime: ' ',
            unreadCount: 0,
            messages: s.messages?.map((m: any) => ({
              id: String(m.id),
              senderId: m.role,
              senderName: m.role === 'admin' ? 'Admin' : (s.customer_name || 'Klient'),
              message: m.content,
              timestamp: m.created_at,
              isAdmin: m.role === 'admin'
            })) || []
        })))

        if (!selectedChat && sessions.length > 0) {
          await selectChat({ id: sessions[0].session_id || sessions[0].id, customerName: sessions[0].customer_name || 'Vizitor', customerEmail: sessions[0].customer_email || '---', status: 'active', lastMessage: '', lastMessageTime: '', unreadCount: 0 })
        }
      } else {
        console.error('Failed to fetch chat sessions')
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Select a chat and fetch its messages
  const selectChat = async (chat: ChatRoom) => {
    try {
      const response = await fetch(`/api/admin/chat/sessions/${chat.id}`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        const s = data.session_id ? data : data.chatRoom
        setSelectedChat({
          id: s.session_id || s.id,
          customerName: s.customer_name || 'Vizitor',
          customerEmail: s.customer_email || '---',
          status: 'active',
          lastMessage: s.messages?.[s.messages.length - 1]?.content || '',
          lastMessageTime: '',
          unreadCount: 0,
          messages: (s.messages || []).map((m: any) => ({
            id: String(m.id),
            senderId: m.role,
            senderName: m.role === 'admin' ? 'Admin' : (s.customer_name || 'Klient'),
            message: m.content,
            timestamp: m.created_at,
            isAdmin: m.role === 'admin'
          }))
        })
        
        // Update unread count in chat list
        setChatRooms(prev => prev.map(room => 
          room.id === chat.id ? { ...room, unreadCount: 0 } : room
        ))
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error)
    }
  }

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return

    try {
      setSending(true)
      const response = await fetch(`/api/admin/chat/sessions/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: newMessage.trim(), role: 'admin' })
      })

      if (response.ok) {
        const data = await response.json()
        const newMsg = {
          id: String(data.id),
          senderId: data.role,
          senderName: 'Admin',
          message: data.content,
          timestamp: data.created_at,
          isAdmin: data.role === 'admin'
        }
        setSelectedChat(prev => prev ? { ...prev, messages: [...(prev.messages || []), newMsg] } : null)
        
        // Update last message in chat list
        setChatRooms(prev => prev.map(room => 
          room.id === selectedChat.id 
            ? { 
                ...room, 
                lastMessage: newMessage.trim(),
                lastMessageTime: 'Tani'
              }
            : room
        ))
        
        setNewMessage('')
      } else {
        console.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  // Update chat status
  const updateChatStatus = async (sessionId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/chat/sessions/${sessionId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        // Update status in chat list
        setChatRooms(prev => prev.map(room => 
          room.id === sessionId ? { ...room, status: status.toLowerCase() as 'active' | 'closed' } : room
        ))
        
        // Update selected chat if it's the same
        if (selectedChat?.id === sessionId) {
          setSelectedChat(prev => prev ? { ...prev, status: status.toLowerCase() as 'active' | 'closed' } : null)
        }
      }
    } catch (error) {
      console.error('Error updating chat status:', error)
    }
  }

  useEffect(() => {
    fetchChatSessions()
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchChatSessions, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredChats = chatRooms.filter(chat =>
    chat.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'waiting': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv'
      case 'waiting': return 'Në pritje'
      case 'closed': return 'Mbyllur'
      default: return status
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat Support</h1>
            <p className="text-gray-600">Menaxho konversacionet me klientët</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchChatSessions}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Rifresko</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Kërko konversacione..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="animate-spin mr-2" size={20} />
                <span>Duke ngarkuar...</span>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <MessageSquare size={24} className="mr-2" />
                <span>Asnjë konversacion</span>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {chat.customerName}
                          </h3>
                        <span className="text-xs text-gray-500">{chat.lastMessageTime}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(chat.status)}`}>
                          {getStatusText(chat.status)}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{selectedChat.customerName}</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500">{selectedChat.customerEmail}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedChat.status)}`}>
                          {getStatusText(selectedChat.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select 
                      value={selectedChat.status.toUpperCase()} 
                      onChange={(e) => updateChatStatus(selectedChat.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ACTIVE">Aktiv</option>
                      <option value="WAITING">Në pritje</option>
                      <option value="CLOSED">Mbyllur</option>
                    </select>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Phone size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Video size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(selectedChat.messages || []).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isAdmin
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.isAdmin ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Shkruaj mesazhin..."
                      rows={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {sending ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Zgjidh një konversacion</h3>
                <p className="text-gray-500">Kliko në një konversacion për të filluar të shkruash</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
