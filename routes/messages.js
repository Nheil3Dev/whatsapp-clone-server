import { Router } from 'express'
import { MessageController } from '../controllers/messages.js'

export const createMessagesRouter = ({ messageModel }) => {
  const messagesRouter = Router()
  const messageController = new MessageController({ messageModel })

  // Obtiene los mensajes de un chat concreto según un filtro
  messagesRouter.get('/', messageController.getFilteredMessages)

  return messagesRouter
}
