import { db } from '../../index.js'

export class MessageModel {
  static async getFilteredMessages ({ chatId, search }) {
    const messages = await db.execute({
      sql: `
        SELECT 
          m.id,
          m.content,
          m.date,
          m.id_user AS userId,
          m.id_group AS groupId,
          m.id_conversation AS conversationId,
          u.alias
        FROM 
          mensajes_w_c AS m
        INNER JOIN
          usuarios_w_c AS u
        ON
          m.id_user = u.id
        WHERE 
          content LIKE ? 
        AND (id_conversation = ? OR id_group = ?)
      `,
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

      // activamos las conversaciones por si el otro usuario la ha borrado
      await db.execute({
        sql: 'UPDATE conversaciones_usuarios_w_c SET active = 1 WHERE id_conversation = ?',
        args: [conversationId]
      })
    }
    return result.lastInsertRowid
  }

  static async modifyMessage ({ msgId, content }) {
    const isModified = await db.execute({
      sql: 'UPDATE mensajes_w_c SET content = ? WHERE id = ?',
      args: [content, msgId]
    })

    return isModified.rowsAffected === 1
  }

  static async deleteMessage ({ msgId }) {
    const isDeleted = await db.execute({
      sql: 'DELETE FROM mensajes_w_c WHERE id = ?',
      args: [msgId]
    })

    return isDeleted.rowsAffected === 1
  }
}
