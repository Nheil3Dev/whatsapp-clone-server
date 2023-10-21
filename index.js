import { createClient } from '@libsql/client'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import loader from 'morgan'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

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

const db = createClient({
  url: 'libsql://grown-pestilence-nheil3dev.turso.io',
  authToken: process.env.DB_TOKEN
})

await db.execute(`
  CREATE TABLE IF NOT EXISTS whatsappclone (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    content TEXT,
    date TIMESTAMP
  )
`)

io.on('connection', async (socket) => {
  console.log('A user has connected!')

  socket.on('disconnect', () => {
    console.log('An user has disconnected')
  })

  socket.on('whatsapp clone msg', async (msg, date) => {
    const user = socket.handshake.auth.user ?? 'Anonymous'
    let result
    try {
      result = await db.execute({
        sql: 'INSERT INTO whatsappclone (user, content, date) VALUES (?, ?, ?)',
        args: [user, msg, date]
      })
    } catch (e) {
      console.error(e)
    }
    io.emit('whatsapp clone msg', result.lastInsertRowid.toString(), user, msg, date)
  })

  if (!socket.recovered) {
    try {
      const results = await db.execute({
        sql: 'SELECT * FROM whatsappclone WHERE id > ?',
        args: [socket.handshake.auth.serverOffset ?? 0]
      })
      results.rows.forEach(({ id, user, content, date }) => {
        socket.emit('whatsapp clone msg', id.toString(), user, content, date)
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

// Routers
app.use('/api', router)

router.get('/messages', async (req, res) => {
  try {
    const messages = await db.execute('SELECT * FROM messages')
    res.json(messages.rows)
  } catch (e) {
    console.error(e)
  }
})

router.get('/lastMsg', async (req, res) => {
  try {
    const lastMsg = await db.execute('SELECT * FROM whatsappclone ORDER BY id DESC LIMIT 1')
    res.json(lastMsg.rows[0])
  } catch (e) {
    console.error(e)
  }
})

httpServer.listen(PORT, () => {
  console.log(`Escuchando en: http://localhost:${PORT}`)
})
