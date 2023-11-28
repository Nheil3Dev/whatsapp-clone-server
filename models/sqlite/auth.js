import { db } from '../../index.js'

export class AuthModel {
  static async login ({ email, password }) {
    let response
    const user = await db.execute({
      sql: 'SELECT * FROM usuarios_w_c WHERE email = ?',
      args: [email]
    })

    if (user.rows[0]) {
      if (user.rows[0].password === password) {
        response = { email: true, password: true, user: user.rows[0] }
      } else {
        response = { email: true, password: false }
      }
    } else {
      response = { email: false, passwors: false }
    }
    return response
  }

  static async register ({ id, alias, info, email, password }) {
    const isRegistered = await db.execute({
      sql: 'SELECT * FROM usuarios_w_c WHERE email = ?',
      args: [email]
    })

    if (isRegistered.rows[0]) return false

    const registerUser = await db.execute({
      sql: 'INSERT INTO usuarios_w_c VALUES (?, ?, ?, ?, ?)',
      args: [id, email, password, alias, info]
    })

    if (registerUser.rowsAffected === 1) return true

    return false
  }
}
