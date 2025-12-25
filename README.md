# Chatbot System

A real-time chatbot system with customer interface and admin panel.

## Features

### Customer Chatbot (Frontend)
- Floating chatbot widget on bottom right
- Real-time messaging with Socket.IO
- Message timestamps
- Auto-scroll to latest messages
- Session-based chat storage
- Typing indicators

### Admin Panel
- Admin login authentication
- View all active and past chats
- Real-time conversation view
- Send manual replies
- Chat status management
- User IP and session information

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js
- Socket.IO for real-time communication
- MongoDB with Mongoose
- JWT authentication

### Frontend
- React.js
- Material UI (MUI)
- Socket.IO Client
- React Query for data fetching
- React Router for navigation

## Setup Instructions

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```
MONGODB_URI=mongodb://127.0.0.1:27017/chatbot
JWT_SECRET=your-secret-key-here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

4. Start MongoDB (if not running):
```bash
mongod
```

5. Create an admin user (run once):
```bash
npm run init-admin
```

This will create an admin user with:
- Username: `admin`
- Password: `admin123`

6. Run the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

## Usage

### Customer Interface
- Visit `http://localhost:5173`
- Click the floating chat button
- Start chatting with support

### Admin Panel
- Visit `http://localhost:5173/admin/login`
- Login with admin credentials (default: admin/admin123)
- View all chats and respond to customers

## Project Structure

```
chatbot/
├── server/
│   ├── src/
│   │   ├── app.ts              # Main server file with Socket.IO
│   │   ├── connection.ts       # MongoDB connection
│   │   ├── model/             # Mongoose models
│   │   ├── controller/        # Route controllers
│   │   ├── router/            # Express routes
│   │   └── middleware/        # Auth middleware
│   └── package.json
└── client/
    ├── src/
    │   ├── components/        # React components
    │   ├── pages/             # Page components
    │   ├── context/           # React context
    │   └── utills/           # API helpers
    └── package.json
```

## API Endpoints

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Get current admin (protected)

### Chats
- `GET /api/chats` - Get all chats (protected)
- `GET /api/chats/:id` - Get chat by ID (protected)
- `PUT /api/chats/:id/close` - Close a chat (protected)

## Socket.IO Events

### Client Events
- `join-chat` - Join a chat session
- `send-message` - Send a message
- `admin-send-message` - Admin sends a message
- `typing-start` - User starts typing
- `typing-stop` - User stops typing

### Server Events
- `session-created` - New session created
- `chat-history` - Receive chat history
- `new-message` - New message received
- `admin-new-message` - New message for admin
- `chat-updated` - Chat list updated
- `typing-start` - Someone is typing
- `typing-stop` - Typing stopped

