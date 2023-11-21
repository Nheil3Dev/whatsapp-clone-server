import { MessageModel } from '../models/sqlite/messages.js'

export class MessageController {
  getFilteredMessages = async (req, res) => {
    try {
      const { chatId, search } = req.query

      const messages = await MessageModel.getFilteredMessages({ chatId, search })

      res.json(messages)
    } catch (e) {
      console.error(e)
    }
  }

  modifyMessage = async (req, res) => {
    try {
      const { msgId, content } = req.body

      const isModified = await MessageModel.modifyMessage({ msgId, content })

      res.json(isModified)
    } catch (e) {
      console.error(e)
    }
  }

  deleteMessage = async (req, res) => {
    try {
      const { msgId } = req.body

      const isDeleted = await MessageModel.deleteMessage({ msgId })

      res.json(isDeleted)
    } catch (e) {
      console.error(e)
    }
  }
}
