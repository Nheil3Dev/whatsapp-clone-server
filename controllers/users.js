export class UserController {
  constructor ({ userModel }) {
    this.userModel = userModel
  }

  getProfileData = async (req, res) => {
    try {
      const { id } = req.params
      const user = await this.userModel.getProfileData({ id })
      res.json(user)
    } catch (e) {
      console.error(e)
    }
  }

  updateProfileData = async (req, res) => {
    try {
      const { id } = req.params
      const { alias, info } = req.body
      const data = await this.userModel.updateProfileData({ alias, info, id })
      res.json(data)
    } catch (e) {
      console.error(e)
    }
  }

  getFilteredUsers = async (req, res) => {
    try {
      const { filter } = req.params
      const users = await this.userModel.getFilteredUsers({ filter })
      res.json(users)
    } catch (e) {
      console.error(e)
    }
  }

  getInteractionsWithUsers = async (req, res) => {
    try {
      const { filter } = req.query
      const { userId } = req.params

      const interactions = await this.userModel.getInteractionsWithUsers({ filter, userId })

      res.json(interactions)
    } catch (e) {
      console.error(e)
    }
  }
}
