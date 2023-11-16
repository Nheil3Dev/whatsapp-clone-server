import { db } from '../../index.js'

export class MessageModel {
  static async getFilteredMessages ({ chatId, search }) {
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
          content LIKE ? 
        AND (id_conversation = ? OR id_group = ?)`,
      args: [`%${search}%`, chatId, chatId]
    })

    return messages.rows
  }

  static async getAll ({ serverOffset }) {
    const messages = await db.execute({
      sql: `
        SELECT 
          m.id,
          u.alias AS alias, 
          m.content,
          m.date,
          m.id_user AS userId,
          m.id_group AS groupId,
          m.id_conversation AS conversationId
        FROM 
          mensajes_w_c AS m
        INNER JOIN
          usuarios_w_c AS u
        ON
          m.id_user = u.id 
        WHERE 
          m.id > ?
      `,
      args: [serverOffset ?? 0]
    })

    return messages.rows
  }

  static async createMessage ({ content, date, userId, groupId, conversationId }) {
    let result
    if (groupId) {
      result = await db.execute({
        sql: 'INSERT INTO mensajes_w_c (content, date, id_user, id_group) VALUES (?, ?, ?, ?)',
        args: [content, date, userId, groupId]
      })
    } else {
      result = await db.execute({
        sql: 'INSERT INTO mensajes_w_c (content, date, id_user, id_conversation) VALUES (?, ?, ?, ?)',
        args: [content, date, userId, conversationId]
      })
    }
    return result.lastInsertRowid
  }
}
