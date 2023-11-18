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
      const { conversationId, groupId, userId } = req.body
      let isDeleted

      if (!groupId) {
        isDeleted = await ChatModel.deleteConversation({ conversationId, userId })
      } else {
        isDeleted = await ChatModel.deleteGroup({ groupId, userId })
      }

      res.json(isDeleted)
    } catch (e) {
      console.error(e)
    }
  }
}
