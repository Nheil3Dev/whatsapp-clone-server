import { Router } from 'express'
import { ChatController } from '../controllers/chats.js'

export const createChatsRouter = ({ chatModel }) => {
  const chatsRouter = Router()
  const chatController = new ChatController({ chatModel })

  // Obtiene todas las conversaciones y grupos de un usuario
  chatsRouter.get('/', chatController.getAllChats)

  // Crea una conversación nueva
  chatsRouter.post('/', chatController.createChat)

  return chatsRouter
}
