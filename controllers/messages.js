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
}
