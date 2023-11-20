import { Router } from 'express'
import { GroupController } from '../controllers/groups.js'

export const createGroupsRouter = () => {
  const groupsRouter = Router()

  const groupController = new GroupController()

  // Actualiza nombre e info de los grupos
  groupsRouter.put('/:id', groupController.updateGroup)

  // Crea un nuevo grupo
  groupsRouter.post('/', groupController.createGroup)

  // Devuelve los grupos que tienen dos usuarios en común
  groupsRouter.get('/:id', groupController.getCommonGroups)

  // Devuelve todos los usuarios que pertenecen a un grupo
  groupsRouter.get('/users/:idGroup', groupController.getUsersGroup)

  groupsRouter.delete('/', groupController.deleteGroup)

  return groupsRouter
}
