import { createClient } from '@libsql/client'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import loader from 'morgan'

dotenv.config()
const app = express()
const router = express.Router()
const bd = createClient({
  url: 'libsql://grown-pestilence-nheil3dev.turso.io',
  authToken: process.env.DB_TOKEN
})

const PORT = process.env.PORT ?? 1234

app.use(cors())
app.use(express.json())
app.use(loader('dev'))

app.use('/api', router)

router.get('/messages', async (req, res) => {
  try {
    const messages = await bd.execute('SELECT * FROM messages')
    res.json(messages.rows)
  } catch (e) {
    console.error(e)
  }
})

router.get('/lastMsg', async (req, res) => {
  try {
    const lastMsg = await bd.execute('SELECT * FROM messages ORDER BY id DESC LIMIT 1')
    console.log(lastMsg.rows[0])
    res.json(lastMsg.rows[0])
  } catch (e) {
    console.error(e)
  }
})

app.listen(PORT, () => {
  console.log(`Escuchando en: http://localhost:${PORT}`)
})
