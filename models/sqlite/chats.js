import { db } from '../../index.js'

export class ChatModel {
  static async getAllChats ({ idUser }) {
    const groups = await db.execute({
      sql: `
        SELECT 
          g.*,
          u.alias AS adminAlias
        FROM 
          grupos_w_c AS g 
        JOIN
          grupos_usuarios_w_c AS gu ON g.id = gu.id_group
        JOIN
          usuarios_w_c AS u ON u.id = g.admin
        WHERE
          gu.id_user = ?
        `,
      args: [idUser]
    })
    const conversations = await db.execute({
      sql: `
        SELECT 
          c.id AS id,
          u.id AS contactId,
          u.alias AS name,
          u.info AS info,
          u.email AS email,
          c.date AS date
        FROM
          conversaciones_w_c AS c
        JOIN
          conversaciones_usuarios_w_c AS cu ON c.id = cu.id_conversation
        JOIN
          usuarios_w_c AS u ON cu.id_user = u.id
        WHERE
          c.id IN (
            SELECT id_conversation
            FROM conversaciones_usuarios_w_c
            WHERE id_user = ?
          )
          AND cu.id_user != ?
      `,
      args: [idUser, idUser]
    })

    const chats = [...groups.rows, ...conversations.rows]

    const addMessages = chats.map(async (chat) => {
      const messages = await db.execute({
        sql: `
          SELECT 
            m.*,
            u.alias
          FROM 
            mensajes_w_c AS m
          INNER JOIN
            usuarios_w_c AS u
          ON
            m.id_user = u.id
          WHERE 
            (id_conversation = ? OR id_group = ?)
        `,
        args: [chat.id, chat.id]
      })
      return {
        ...chat,
        messages: messages.rows
      }
    })
    const chatsWithMessages = await Promise.all(addMessages)
    const lastMsg = await db.execute('SELECT id FROM mensajes_w_c ORDER BY date DESC LIMIT 1')

    return {
      chats: chatsWithMessages,
      lastMsg: lastMsg.rows[0]
    }
  }

  static async createChat ({ conversationId, date, usersId }) {
    const data = await db.execute({
      sql: 'INSERT INTO conversaciones_w_c (id, date) VALUES (?, ?)',
      args: [conversationId, date]
    })
    const addUsers = usersId.map(async (userId) => {
      return await db.execute({
        sql: 'INSERT INTO conversaciones_usuarios_w_c VALUES (?, ?)',
        args: [conversationId, userId]
      })
    })
    const response = await Promise.all(addUsers).then(values => values.map(value => value.rowsAffected === 1))

    const isCreated = data.rowsAffected === 1 && response.every(item => item === true)

    return isCreated
  }
}
