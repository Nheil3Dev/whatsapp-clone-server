import { GroupModel } from '../models/sqlite/groups.js'

export class GroupController {
  updateGroup = async (req, res) => {
    try {
      const { id } = req.params
      const { name, info } = req.body

      const data = await GroupModel.updateGroup({ name, info, id })

      res.json(data)
    } catch (e) {
      console.error(e)
    }
  }

  createGroup = async (req, res) => {
    try {
      const { id, name, date, admin, usersId } = req.body

      const isCreated = await GroupModel.createGroup({ id, name, date, admin, usersId })

      res.json(isCreated)
    } catch (e) {
      console.error(e)
    }
  }

  getCommonGroups = async (req, res) => {
    try {
      const { id } = req.params
      const { contactId } = req.query

      const commonGroups = await GroupModel.getCommonGroups({ id, contactId })

      res.json(commonGroups)
    } catch (e) {
      console.error(e)
    }
  }

  getUsersGroup = async (req, res) => {
    try {
      const { idGroup } = req.params

      const users = await GroupModel.getUsersGroup({ idGroup })

      res.json(users)
    } catch (e) {
      console.error(e)
    }
  }

  deleteGroup = async (req, res) => {
    try {
      const { userId, chatId } = req.body

      const isDeleted = await GroupModel.deleteGroup({ chatId, userId })

      res.json(isDeleted)
    } catch (e) {
      console.error(e)
    }
  }
}
