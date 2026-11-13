# Chatty

A real-time chat app built with the MERN stack. Direct messages, group chats, typing indicators, read receipts, image sharing, and an admin panel for handling reports.

Live demo: https://chat-app-mernn.netlify.app (the free Render backend sleeps when idle, so the first request can take about 30 seconds)

![Chat screen](assets/screenshots/chat.png)

## Features

- Direct and group chats that update live over Socket.io
- Typing indicator, online status, and sent/read ticks
- Image messages (uploaded to Cloudinary), replies, reactions, and in-chat search
- Edit a message for 15 minutes after sending, or delete it for everyone
- Mute, archive, and block. You can hide your online status and read receipts
- Notifications: in-app, browser, and sound
- Admin panel: users, reports, suspensions, and an audit log of admin actions
- Light and dark themes

## Stack

| Part | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router, Axios, socket.io-client |
| Backend | Node, Express 5, Socket.io, Mongoose, JWT, bcrypt, express-validator |
| Storage | MongoDB for data, Cloudinary for images |
| Hosting | Netlify (client), Render (server) |

## How it fits together

```
React app  --HTTP (Axios + JWT)-->  Express API  ---->  MongoDB
    ^                                   |
    |                                   +--> Cloudinary (images)
    +------- WebSocket (Socket.io) <----+
```

- **REST** handles anything that needs a reply: logging in, loading old messages, uploading images.
- **Socket.io** pushes live events: new messages, typing, presence, read receipts, notifications.
- Each user joins a socket room named after their user id, and each conversation has its own room. The server emits to a room, and everyone in it gets the event.

### Login

1. The client posts email and password to `/api/auth/login`.
2. The server checks the password against the bcrypt hash and signs a JWT.
3. The client stores the token, and an Axios interceptor sends it as `Authorization: Bearer <token>` on every request.
4. The `protect` middleware verifies the token and loads the user, so a suspended user is blocked straight away.
5. The socket connection sends the same token, so HTTP and WebSocket share one identity.

### Sending a message

1. The client emits `message:send` over the socket.
2. The server checks that the sender is in the conversation and is not blocked, then saves the message to MongoDB.
3. The server emits `message:new` to the conversation room, so everyone in the chat sees it instantly.
4. When the other person opens the chat, the client emits a read event and the sender's ticks turn blue.

## Security

- Passwords hashed with bcrypt, and the login error is the same for an unknown email and a wrong password
- Every route validated with express-validator, with NoSQL injection sanitizing
- Helmet headers, a CORS allow-list, and rate limits on auth, messages, and uploads
- Uploads limited by MIME type and size
- Users can't set their own `role` or `status`

## Run it locally

You need Node 18.18+ and a MongoDB database (local or Atlas). Images need a free Cloudinary account.

```bash
git clone https://github.com/jennyasync/chat-app-mern.git
cd chat-app-mern

cp server/.env.example server/.env   # fill in MONGO_URI, JWT_SECRET, Cloudinary keys
cp client/.env.example client/.env

cd server && npm install && npm run seed:admin && npm run dev   # http://localhost:5000
cd client && npm install && npm run dev                         # http://localhost:5173 (second terminal)
```

Health check: http://localhost:5000/api/health

## Folders

```
server/
  index.js        Express app, middleware, routes, Socket.io setup
  config/         env loading, Cloudinary
  models/         User, Conversation, Message, Notification, Report, AdminAuditLog
  routes/         URL -> controller, with validators and rate limits
  controllers/    request handlers
  validators/     express-validator rules
  middlewares/    auth, errors, uploads, rate limits
  sockets/        message, typing, presence and group events
  utils/          shared services (messages, conversations, notifications)
client/src/
  api/            Axios instance and one file per resource
  contexts/       Auth, Socket, ChatState, Notifications, Preferences
  pages/          landing, auth, chat, profile, settings, admin
  components/     chat UI, layout, modals, shared pieces
  hooks/          small reusable hooks
```

## License

MIT
