import { createClient } from '@libsql/client'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import loader from 'morgan'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { MessageModel } from './models/sqlite/messages.js'
import { createChatsRouter } from './routes/chats.js'
import { createGroupsRouter } from './routes/groups.js'
import { createMessagesRouter } from './routes/messages.js'
import { createUsersRouter } from './routes/users.js'

dotenv.config()
const PORT = process.env.PORT ?? 1234

const app = express()
const mainRouter = express.Router()
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

      const id = await MessageModel.createMessage({ content, date, userId, groupId, conversationId })

      io.emit('whatsapp clone msg', id.toString(), alias, content, date, userId, groupId, conversationId)
    } catch (e) {
      console.error(e)
    }
  })

  if (!socket.recovered) {
    try {
      const serverOffset = socket.handshake.auth.serverOffset

      const messages = await MessageModel.getAll({ serverOffset })

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

// API Root
app.use('/api', mainRouter)

// Prueba
mainRouter.get('/hello', async (req, res) => {
  const users = await db.execute('SELECT * FROM usuarios_w_c')
  res.json(users.rows)
})

// API Routers
mainRouter.use('/group', createGroupsRouter())
mainRouter.use('/users', createUsersRouter())
mainRouter.use('/chats', createChatsRouter())
mainRouter.use('/messages', createMessagesRouter())

httpServer.listen(PORT, () => {
  console.log(`Escuchando en: http://localhost:${PORT}`)
})
