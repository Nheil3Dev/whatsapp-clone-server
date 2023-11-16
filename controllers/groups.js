export class GroupController {
  constructor ({ groupModel }) {
    this.groupModel = groupModel
  }

  updateGroup = async (req, res) => {
    try {
      const { id } = req.params
      const { name, info } = req.body

      const data = await this.groupModel.updateGroup({ name, info, id })

      res.json(data)
    } catch (e) {
      console.error(e)
    }
  }

  createGroup = async (req, res) => {
    try {
      const { id, name, date, admin, usersId } = req.body

      const isCreated = await this.groupModel.createGroup({ id, name, date, admin, usersId })

      res.json(isCreated)
    } catch (e) {
      console.error(e)
    }
  }

  getCommonGroups = async (req, res) => {
    try {
      const { id } = req.params
      const { contactId } = req.query

      const commonGroups = await this.groupModel.getCommonGroups({ id, contactId })

      res.json(commonGroups)
    } catch (e) {
      console.error(e)
    }
  }

  getUsersGroup = async (req, res) => {
    try {
      const { idGroup } = req.params

      const users = await this.groupModel.getUsersGroup({ idGroup })

      res.json(users)
    } catch (e) {
      console.error(e)
    }
  }
}
