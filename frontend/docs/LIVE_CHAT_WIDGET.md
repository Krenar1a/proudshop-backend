# Live Chat Widget Documentation

## Overview

The Live Chat Widget provides customers with instant support access on all public pages of the website. It's a floating button that opens a chat interface where customers can communicate directly with support agents.

## Features

### Customer-Facing Features
- **Floating Chat Button**: Always visible in bottom-right corner
- **Real-time Messaging**: Instant message sending and receiving
- **Unread Notifications**: Visual badge showing unread admin messages
- **Sound Notifications**: Audio alert for new admin messages
- **Session Persistence**: Continues conversations across page refreshes
- **Minimize/Maximize**: Collapsible interface for better UX
- **Auto-refresh**: Polls for new messages every 10 seconds
- **Welcome Messages**: Automated greeting when chat starts

### Admin Integration
- **Seamless Integration**: Works with existing admin chat interface
- **Real-time Updates**: Messages appear instantly in admin dashboard
- **Customer Information**: Collects name and email before starting
- **Status Management**: Automatically sets chat status to "WAITING"

## Implementation

### Frontend Component
- **Location**: `src/components/LiveChatWidget.tsx`
- **Integration**: Added to root layout (`src/app/layout.tsx`)
- **Visibility**: Shows on all pages except admin routes

### API Endpoints

#### Customer Chat Endpoints
- `POST /api/chat/sessions` - Create new chat session
- `GET /api/chat/sessions/[sessionId]` - Get session with messages
- `POST /api/chat/sessions/[sessionId]/messages` - Send customer message

#### Features
- **Session Management**: Automatic session creation and retrieval
- **Message Threading**: Proper conversation flow
- **Status Updates**: Auto-update chat status when customer messages
- **Welcome Messages**: System-generated greeting messages

## User Flow

### Starting a Chat

1. **Customer clicks chat button** (floating blue button)
2. **Information form appears**:
   - Customer enters name and email
   - Form validates required fields
3. **Chat session created**:
   - API creates new session in database
   - System sends welcome message
   - Session ID saved to localStorage
4. **Chat interface opens**:
   - Customer can start typing messages
   - Real-time polling begins

### Continuing a Chat

1. **Session persistence**: Returns to existing session if found
2. **Message history**: Loads previous conversation
3. **Status indicators**: Shows current chat status
4. **Real-time updates**: Polls for new admin messages

### Receiving Messages

1. **Auto-refresh**: Polls every 10 seconds for new messages
2. **Sound notification**: Plays when admin sends message
3. **Visual badge**: Shows unread message count on closed widget
4. **Auto-scroll**: Scrolls to newest messages automatically

## Technical Details

### State Management
```typescript
const [isOpen, setIsOpen] = useState(false)           // Widget visibility
const [chatSession, setChatSession] = useState(null)  // Current session
const [userInfo, setUserInfo] = useState({})          // Customer details
const [unreadCount, setUnreadCount] = useState(0)     // Unread messages
```

### Polling System
- **Frequency**: Every 10 seconds when chat is active
- **Endpoint**: `GET /api/chat/sessions/[sessionId]`
- **Purpose**: Check for new admin messages
- **Cleanup**: Automatically stops when component unmounts

### Local Storage
- **Session ID**: `chat_session_id` - Persists active session
- **User Info**: `chat_user_info` - Remembers customer details
- **Purpose**: Maintains conversation across page refreshes

### Notifications
- **Sound**: Base64-encoded audio for new message alerts
- **Visual**: Red badge with unread count on chat button
- **Conditions**: Only triggers for admin messages when widget closed

## Styling & UX

### Design Elements
- **Floating Button**: Blue circular button with chat icon
- **Widget Panel**: Clean white panel with rounded corners
- **Message Bubbles**: Different colors for user/admin/system messages
- **Responsive**: Works on desktop and mobile devices

### Animations
- **Hover Effects**: Button scales on hover
- **Smooth Transitions**: Panel open/close animations
- **Scroll Behavior**: Smooth scroll to new messages

### Status Indicators
- **Loading States**: Shows "Duke ngarkuar..." during API calls
- **Send States**: Disables input while sending messages
- **Error Handling**: Graceful handling of network issues

## Configuration

### Visibility Control
```typescript
// Don't show chat widget on admin pages
if (pathname?.startsWith('/admin')) {
  return null
}
```

### Polling Interval
```typescript
const interval = setInterval(pollMessages, 10000) // 10 seconds
```

### Audio Settings
```typescript
audio.volume = 0.3 // 30% volume for notifications
```

## Database Integration

### Session Creation
- Creates `ChatSession` record with customer info
- Generates system welcome message
- Sets initial status to "ACTIVE"

### Message Storage
- All messages stored in `ChatMessage` table
- Includes sender type (USER/ADMIN/SYSTEM)
- Timestamps for proper ordering

### Status Management
- Updates chat status when customer sends message
- Sets to "WAITING" to alert admins of new messages

## Security & Privacy

### Data Protection
- No sensitive data stored in localStorage
- Customer email/name only collected when starting chat
- Messages transmitted over HTTPS

### Input Validation
- Message content validated on both client and server
- Email format validation in start form
- XSS protection through proper escaping

## Troubleshooting

### Common Issues

1. **Widget not appearing**
   - Check if on admin page (widget hidden)
   - Verify component is imported in layout
   - Check browser console for errors

2. **Messages not sending**
   - Verify API endpoints are accessible
   - Check network connectivity
   - Ensure session exists and is valid

3. **No sound notifications**
   - Browser may block autoplay audio
   - User interaction required for audio
   - Normal behavior in some browsers

### Error Handling
- API failures gracefully handled
- Retry mechanisms for important operations
- User-friendly error messages

## Future Enhancements

### Planned Features
- **File Upload**: Allow customers to send images/documents
- **Chat History**: Show previous conversations for returning customers
- **Offline Mode**: Queue messages when offline
- **Typing Indicators**: Show when admin is typing
- **Emoji Support**: Rich text messaging capabilities

### Technical Improvements
- **WebSocket Integration**: Real-time bidirectional communication
- **Push Notifications**: Browser notifications for new messages
- **Mobile App**: Dedicated mobile chat interface
- **AI Chatbot**: Automated responses for common questions

## Monitoring & Analytics

### Metrics to Track
- **Session Start Rate**: How many visitors start chats
- **Response Time**: How quickly admins respond
- **Resolution Rate**: Percentage of resolved conversations
- **Customer Satisfaction**: Post-chat ratings

### Implementation
```typescript
// Track chat events
const trackChatEvent = (event: string, data: any) => {
  // Send to analytics service
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ event, data })
  })
}
```

This live chat widget provides a complete customer support solution that integrates seamlessly with the admin dashboard, ensuring customers can get help quickly and efficiently.
