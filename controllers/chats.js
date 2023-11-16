export class ChatController {
  constructor ({ chatModel }) {
    this.chatModel = chatModel
  }

  getAllChats = async (req, res) => {
    try {
      const { idUser } = req.query

      const chats = await this.chatModel.getAllChats({ idUser })

      res.json(chats)
    } catch (e) {
      console.error(e)
    }
  }

  createChat = async (req, res) => {
    try {
      const { conversationId, date, usersId } = req.body

      const isCreated = await this.chatModel.createChat({ conversationId, date, usersId })

      res.json(isCreated)
    } catch (e) {
      console.error(e)
    }
  }
}
