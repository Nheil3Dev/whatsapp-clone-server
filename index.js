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
import { createAuthRouter } from './routes/auth.js'
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
    origin: process.env.NODE_ENV === 'production' ? process.cwd() + '/api/' : 'http://localhost:5173'
  }
})

// Data Base
export const db = createClient({
  url: process.env.DB_URL,
  authToken: process.env.DB_TOKEN
})

// WebSocket Server
io.on('connection', async (socket) => {
  try {
    const alias = socket.handshake.auth.user.alias
    console.log(`${alias} has connected!`)
  } catch (e) {
    console.error(e)
  }

  socket.on('disconnect', () => {
    try {
      const alias = socket.handshake.auth.user.alias
      console.log(`${alias} has disconnected`)
    } catch (e) {
      console.error(e)
    }
  })

  socket.on('send msg', async (content, date, groupId, conversationId) => {
    try {
      const userId = socket.handshake.auth.user.id
      const alias = socket.handshake.auth.user.alias

      const id = await MessageModel.createMessage({ content, date, userId, groupId, conversationId })

      io.emit('send msg', id.toString(), alias, content, date, userId, groupId, conversationId)
    } catch (e) {
      console.error(e)
    }
  })

  socket.on('delete msg', async (msgId, chatId) => {
    try {
      const isDeleted = await MessageModel.deleteMessage({ msgId })

      if (isDeleted) {
        io.emit('delete msg', msgId, chatId)
      }
    } catch (e) {
      console.error(e)
    }
  })

  socket.on('modify msg', async (msgId, content, chatId) => {
    try {
      const isModified = await MessageModel.modifyMessage({ msgId, content })

      if (isModified) {
        io.emit('modify msg', msgId, content, chatId)
      }
    } catch (e) {
      console.error(e)
    }
  })

  socket.on('create conversation', async (conversationId, date, usersId) => {
    try {
      const isCreated = await ChatModel.createChat({ conversationId, date, usersId })
      if (isCreated) {
        io.emit('create conversation', conversationId, usersId)
      }
    } catch (e) {
      console.error(e)
    }
  })

  socket.on('create group', async (groupId, name, date, admin, usersId) => {
    try {
      const isCreated = await GroupModel.createGroup({ id: groupId, name, date, admin, usersId })
      if (isCreated) {
        io.emit('create group', groupId, usersId)
      }
    } catch (e) {
      console.error(e)
    }
  })

  socket.on('modify group', async (groupId, name, info) => {
    try {
      const isModified = await GroupModel.updateGroup({ name, info, id: groupId })
      if (isModified) {
        io.emit('modify group', groupId, name, info)
      }
    } catch (e) {
      console.error(e)
    }
  })

  if (!socket.recovered) {
    try {
      const serverOffset = socket.handshake.auth.serverOffset

      const messages = await MessageModel.getAll({ serverOffset })

      messages.forEach(({ id, alias, content, date, userId, groupId, conversationId }) => {
        socket.emit('send msg', id.toString(), alias, content, date, userId, groupId, conversationId)
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

// Configuración del middleware para servir archivos estáticos
app.use(express.static(process.cwd() + '/dist/'))

// App
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/dist/index.html')
})

app.get('/assets/bg-chat-tile-dark.png', (req, res) => {
  res.sendFile(process.cwd() + '/dist/bg-chat-tile-dark.png')
})

app.get('/whatsappclone', (req, res) => {
  res.sendFile(process.cwd() + '/dist/whatsappclone.png')
})

// API Root
app.use('/api', mainRouter)

// API Routers
mainRouter.use('/auth', createAuthRouter())
mainRouter.use('/group', createGroupsRouter())
mainRouter.use('/users', createUsersRouter())
mainRouter.use('/chats', createChatsRouter())
mainRouter.use('/messages', createMessagesRouter())

httpServer.listen(PORT, () => {
  console.log(`Escuchando en: http://localhost:${PORT}`)
})
