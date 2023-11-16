import { UserModel } from '../models/sqlite/users.js'

export class UserController {
  getProfileData = async (req, res) => {
    try {
      const { id } = req.params
      const user = await UserModel.getProfileData({ id })
      res.json(user)
    } catch (e) {
      console.error(e)
    }
  }

  updateProfileData = async (req, res) => {
    try {
      const { id } = req.params
      const { alias, info } = req.body
      const data = await UserModel.updateProfileData({ alias, info, id })
      res.json(data)
    } catch (e) {
      console.error(e)
    }
  }

  getFilteredUsers = async (req, res) => {
    try {
      const { filter } = req.params
      const users = await UserModel.getFilteredUsers({ filter })
      res.json(users)
    } catch (e) {
      console.error(e)
    }
  }

  getInteractionsWithUsers = async (req, res) => {
    try {
      const { filter } = req.query
      const { userId } = req.params

      const interactions = await UserModel.getInteractionsWithUsers({ filter, userId })

      res.json(interactions)
    } catch (e) {
      console.error(e)
    }
  }
}
