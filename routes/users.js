import { Router } from 'express'
import { UserController } from '../controllers/users.js'

export const createUsersRouter = ({ userModel }) => {
  const usersRouter = Router()
  const userController = new UserController({ userModel })

  // Obtiene datos del perfil de usuario
  usersRouter.get('/:id', userController.getProfileData)

  // Actualiza datos del perfil de usuario
  usersRouter.put('/:id', userController.updateProfileData)

  // Devuelve todos los usuarios filtrados
  usersRouter.get('/filter/:filter', userController.getFilteredUsers)

  // Devuelve todos los contactos, conversaciones y grupos que coincidan con la búsqueda
  usersRouter.get('/all/:userId', userController.getInteractionsWithUsers)

  return usersRouter
}
