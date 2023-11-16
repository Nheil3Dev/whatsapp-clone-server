import { createClient } from '@libsql/client'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import loader from 'morgan'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { ChatModel } from './models/sqlite/chats.js'
import { GroupModel } from './models/sqlite/groups.js'
import { MessageModel } from './models/sqlite/messages.js'
import { UserModel } from './models/sqlite/users.js'
import { createChatsRouter } from './routes/chats.js'
import { createGroupsRouter } from './routes/groups.js'
import { createMessagesRouter } from './routes/messages.js'
import { createUsersRouter } from './routes/users.js'

dotenv.config()
const PORT = process.env.PORT ?? 1234

const app = express()
const router = express.Router()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173'
  }
})

// Data Base
export const db = createClient({
  url: process.env.DB_URL,
  authToken: process.env.DB_TOKEN
})

// WebSocket Server
io.on('connection', async (socket) => {
  console.log('An user has connected!')

  socket.on('disconnect', () => {
    console.log('An user has disconnected')
  })

  socket.on('whatsapp clone msg', async (content, date, groupId, conversationId) => {
    try {
      const userId = socket.handshake.auth.user.id
      const alias = socket.handshake.auth.user.alias

      const id = MessageModel.createMessage({ content, date, userId, groupId, conversationId })

      io.emit('whatsapp clone msg', id.toString(), alias, content, date, userId, groupId, conversationId)
    } catch (e) {
      console.error(e)
    }
  })

  if (!socket.recovered) {
    try {
      const serverOffset = socket.handshake.auth.serverOffset

      const messages = MessageModel.getAll({ serverOffset })

      messages.forEach(({ id, alias, content, date, userId, groupId, conversationId }) => {
        socket.emit('whatsapp clone msg', id.toString(), alias, content, date, userId, groupId, conversationId)
      })
    } catch (e) {
      console.error(e)
    }
  }
})

// Middlewares
app.use(cors())
app.use(express.json())
app.use(loader('dev'))

// Models to use
const userModel = new UserModel()
const groupModel = new GroupModel()
const chatModel = new ChatModel()
const messageModel = new MessageModel()

// API Root
app.use('/api', router)

// API Routers
router.use('/group', createGroupsRouter({ groupModel }))
router.use('/users', createUsersRouter({ userModel }))
router.use('/chats', createChatsRouter({ chatModel }))
router.use('/messages', createMessagesRouter({ messageModel }))

httpServer.listen(PORT, () => {
  console.log(`Escuchando en: http://localhost:${PORT}`)
})
