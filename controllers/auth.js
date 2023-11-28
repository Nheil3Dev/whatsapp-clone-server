import { AuthModel } from '../models/sqlite/auth.js'

export class AuthController {
  login = async (req, res) => {
    try {
      const { email, password } = req.body

      const response = await AuthModel.login({ email, password })

      res.json(response)
    } catch (e) {
      console.error(e)
    }
  }

  register = async (req, res) => {
    try {
      const { id, alias, info, email, password } = req.body

      const response = await AuthModel.register({ id, alias, info, email, password })

      res.json(response)
    } catch (e) {
      console.error(e)
    }
  }
}
