import { Router } from 'express'
import { MessageController } from '../controllers/messages.js'

export const createMessagesRouter = () => {
  const messagesRouter = Router()
  const messageController = new MessageController()

  // Obtiene los mensajes de un chat concreto según un filtro
  messagesRouter.get('/', messageController.getFilteredMessages)

  // Modificar un mensaje
  messagesRouter.patch('/', messageController.modifyMessage)

  // Borrar un mensaje
  messagesRouter.delete('/', messageController.deleteMessage)

  return messagesRouter
}
