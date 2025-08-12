# Chat System Documentation

## Overview

The chat system allows administrators to communicate with customers in real-time. The system is fully integrated with the database and provides a complete interface for managing customer support conversations.

## Features

### Admin Interface
- **Real-time Chat Interface**: Modern WhatsApp-style chat interface
- **Client List**: View all chat sessions with status indicators
- **Message History**: Complete conversation history for each client
- **Status Management**: Update chat status (Active, Waiting, Closed)
- **Search & Filter**: Find specific conversations quickly
- **Auto-refresh**: Automatically refreshes chat list every 30 seconds
- **Unread Indicators**: Visual badges for unread messages

### Database Models

#### ChatSession
```prisma
model ChatSession {
  id        String        @id @default(cuid())
  userId    String?       // Optional: link to registered user
  userEmail String?       // Customer email
  userName  String?       // Customer name
  status    ChatStatus    @default(ACTIVE)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  
  messages  ChatMessage[]
  
  @@map("chat_sessions")
}
```

#### ChatMessage
```prisma
model ChatMessage {
  id        String      @id @default(cuid())
  sessionId String
  sender    MessageSender  // USER, ADMIN, SYSTEM
  message   String
  isRead    Boolean     @default(false)
  createdAt DateTime    @default(now())
  
  session   ChatSession @relation(fields: [sessionId], references: [id])
  
  @@map("chat_messages")
}
```

#### Enums
```prisma
enum ChatStatus {
  ACTIVE   // Chat is active
  WAITING  // Waiting for admin response
  CLOSED   // Chat is closed
}

enum MessageSender {
  USER     // Message from customer
  ADMIN    // Message from administrator
  SYSTEM   // System-generated message
}
```

## API Endpoints

### Get Chat Sessions
```http
GET /api/admin/chat/sessions
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (`ACTIVE`, `WAITING`, `CLOSED`)

**Response:**
```json
{
  "chatRooms": [
    {
      "id": "session_id",
      "customerName": "Customer Name",
      "customerEmail": "customer@email.com",
      "status": "active",
      "lastMessage": "Last message content",
      "lastMessageTime": "10:30",
      "unreadCount": 2,
      "updatedAt": "2025-08-03T..."
    }
  ]
}
```

### Get Chat Messages
```http
GET /api/admin/chat/sessions/{sessionId}
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "chatRoom": {
    "id": "session_id",
    "customerName": "Customer Name", 
    "customerEmail": "customer@email.com",
    "status": "active",
    "messages": [
      {
        "id": "message_id",
        "senderId": "admin-1",
        "senderName": "Admin",
        "message": "Hello, how can I help?",
        "timestamp": "10:25",
        "isAdmin": true
      }
    ]
  }
}
```

### Send Message
```http
POST /api/admin/chat/sessions/{sessionId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "message": "Your message content"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "message_id",
    "senderId": "admin-1", 
    "senderName": "Admin",
    "message": "Your message content",
    "timestamp": "10:30",
    "isAdmin": true
  },
  "text": "Mesazhi u dërgua me sukses"
}
```

### Update Chat Status
```http
PUT /api/admin/chat/sessions/{sessionId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "CLOSED"
}
```

**Response:**
```json
{
  "success": true,
  "session": { ... },
  "message": "Statusi u ndryshua në: CLOSED"
}
```

### Create Chat Session (for testing)
```http
POST /api/admin/chat/sessions
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userEmail": "customer@email.com",
  "userName": "Customer Name"
}
```

## Usage Guide

### For Administrators

1. **Access Chat Interface**
   - Navigate to Admin Dashboard → Chat Support
   - Login required with admin credentials

2. **View Conversations**
   - All active conversations appear in the left sidebar
   - Unread messages show with badge counters
   - Search functionality available

3. **Respond to Messages**
   - Click on a conversation to view full chat history
   - Type message in the input field at bottom
   - Press Enter or click Send button
   - Messages are automatically marked as read

4. **Manage Chat Status**
   - Use the dropdown in chat header to change status:
     - **Active**: Currently being handled
     - **Waiting**: Waiting for customer response
     - **Closed**: Conversation completed

5. **Features**
   - Auto-refresh every 30 seconds
   - Manual refresh button available
   - Real-time status indicators
   - Message timestamps

### Admin Interface Components

#### Chat List Sidebar (Left Panel)
- Search bar for filtering conversations
- List of all chat sessions with:
  - Customer name and email
  - Last message preview
  - Timestamp of last activity
  - Status badge (Active/Waiting/Closed)
  - Unread message count

#### Chat Area (Right Panel)
- **Header**: Customer info, status dropdown, action buttons
- **Messages**: Full conversation history with timestamps
- **Input**: Message composition area with send button

## Sample Data

The system includes sample chat data for testing:

```bash
# Create sample chat sessions and messages
npm run create:chats
```

This creates 4 sample chat sessions with various statuses and messages.

## Technical Implementation

### Frontend (React/TypeScript)
- **Real-time Updates**: Auto-refresh with loading states
- **Error Handling**: Graceful handling of API errors
- **Responsive Design**: Works on desktop and mobile
- **State Management**: Local state with API synchronization

### Backend (Next.js API Routes)
- **Authentication**: JWT token-based admin authentication
- **Database**: Prisma ORM with SQLite
- **Error Handling**: Comprehensive error responses
- **Data Validation**: Input validation and sanitization

### Security Features
- **Admin Authentication**: Required for all chat operations
- **Input Sanitization**: Message content is validated
- **CORS Protection**: API routes are protected
- **Rate Limiting**: Prevents spam (can be added)

## Customization

### Adding New Message Types
1. Extend `MessageSender` enum in Prisma schema
2. Update API routes to handle new sender types
3. Modify frontend to display new message types

### Adding File Attachments
1. Add file fields to `ChatMessage` model
2. Implement file upload endpoints
3. Update chat interface to support file display

### Adding Real-time Updates
1. Integrate WebSocket or Server-Sent Events
2. Update frontend to listen for real-time events
3. Implement push notifications

### Adding Customer Interface
1. Create customer-facing chat widget
2. Implement session creation from frontend
3. Add customer message endpoints

## Troubleshooting

### Common Issues

1. **Messages not appearing**
   - Check admin authentication token
   - Verify API endpoints are accessible
   - Check browser console for errors

2. **Authentication errors**
   - Ensure admin is logged in
   - Check token expiration
   - Verify admin permissions

3. **Database errors**
   - Check Prisma connection
   - Verify database schema is up to date
   - Run `npx prisma db push` if needed

### Error Codes
- `401`: Unauthorized - Admin not authenticated
- `404`: Not Found - Chat session doesn't exist
- `400`: Bad Request - Invalid data sent
- `500`: Server Error - Database or server issue

## Performance Considerations

- **Pagination**: Consider implementing for large chat lists
- **Message Limits**: Implement message history limits
- **Caching**: Cache frequently accessed chat data
- **Indexing**: Add database indexes for search queries

## Future Enhancements

- Real-time notifications with WebSockets
- File and image sharing capabilities
- Chat analytics and reporting
- Customer satisfaction ratings
- Automated chatbot integration
- Multi-language support
- Mobile app integration
