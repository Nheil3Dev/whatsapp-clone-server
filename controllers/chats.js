import { ChatModel } from '../models/sqlite/chats.js'

export class ChatController {
  getAllChats = async (req, res) => {
    try {
      const { idUser } = req.query

      const chats = await ChatModel.getAllChats({ idUser })

      res.json(chats)
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  createChat = async (req, res) => {
    try {
      const { conversationId, date, usersId } = req.body

      const isCreated = await ChatModel.createChat({ conversationId, date, usersId })

      res.json(isCreated)
    } catch (e) {
      console.error(e)
    }
  }

  deleteChat = async (req, res) => {
    try {
      const { userId, chatId } = req.body

      const isDeleted = await ChatModel.deleteConversation({ chatId, userId })

      res.json(isDeleted)
    } catch (e) {
      console.error(e)
    }
  }

  checkChat = async (req, res) => {
    try {
      const { userId1, userId2 } = req.query

      const chat = await ChatModel.checkConversation({ userId1, userId2 })

      res.json(chat)
    } catch (e) {
      console.error(e)
    }
  }

  getConversation = async (req, res) => {
    try {
      const { conversationId } = req.params
      const { userId } = req.query

      const conversation = await ChatModel.getConversation({ conversationId, userId })

      res.json(conversation)
    } catch (e) {
      console.error(e)
    }
  }
}
