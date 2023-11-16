export class MessageController {
  constructor ({ messageModel }) {
    this.messageModel = messageModel
  }

  getFilteredMessages = async (req, res) => {
    try {
      const { chatId, search } = req.query

      const messages = await this.messageModel.getFilteredMessages({ chatId, search })

      res.json(messages)
    } catch (e) {
      console.error(e)
    }
  }
}
