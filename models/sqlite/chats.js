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
          conversaciones_usuarios_w_c AS cu ON cu.id_conversation = c.id
        JOIN
          usuarios_w_c AS u ON cu.id_user = u.id
        WHERE
          c.id IN (
            SELECT id_conversation
            FROM conversaciones_usuarios_w_c
            WHERE id_user = ?
            AND active = 1
          )
          AND u.id != ?
      `,
      args: [idUser, idUser]
    })

    const chats = [...groups.rows, ...conversations.rows]

    const addMessages = chats.map(async (chat) => {
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

    let isCreated

    // Conversación contigo mismo
    if (usersId[0] === usersId[1]) {
      const addUser = await db.execute({
        sql: 'INSERT INTO conversaciones_usuarios_w_c (id_conversation, id_user) VALUES (?, ?)',
        args: [conversationId, usersId[0]]
      })

      isCreated = data.rowsAffected === 1 && addUser.rowsAffected === 1
    // Conversación normal entre dos usuarios
    } else {
      const addUsers = usersId.map(async (userId) => {
        return await db.execute({
          sql: 'INSERT INTO conversaciones_usuarios_w_c (id_conversation, id_user) VALUES (?, ?)',
          args: [conversationId, userId]
        })
      })
      const response = await Promise.all(addUsers).then(values => values.map(value => value.rowsAffected === 1))

      isCreated = data.rowsAffected === 1 && response.every(item => item === true)
    }
    return isCreated
  }

  static async deleteConversation ({ chatId, userId }) {
    let isDeleted
    // Primero comprobamos que no haya ningún mensaje
    const noMsg = await db.execute({
      sql: 'SELECT * FROM mensajes_w_c WHERE id_conversation = ? LIMIT 1',
      args: [chatId]
    })

    // Si la conversación no tiene mensajes borramos todos los usuarios y la conversacion
    if (noMsg.rows.length === 0) {
      const deleteUsers = await db.execute({
        sql: 'DELETE FROM conversaciones_usuarios_w_c WHERE id_conversation = ?',
        args: [chatId]
      })

      const deleteConversation = await db.execute({
        sql: 'DELETE FROM conversaciones_w_c WHERE id = ?',
        args: [chatId]
      })

      isDeleted = deleteUsers.rowsAffected > 1 && deleteConversation.rowsAffected === 1

    // Si hay mensajes
    } else {
      // Desactivamos la conversación al usuario solicitante
      const deleteUser = await db.execute({
        sql: 'UPDATE conversaciones_usuarios_w_c SET active = 0 WHERE id_conversation = ? AND id_user = ?',
        args: [chatId, userId]
      })

      // Comprobamos que el otro usuario no se haya salido de la conversación
      const isLastUser = await db.execute({
        sql: 'SELECT * FROM conversaciones_usuarios_w_c WHERE id_conversation = ? AND active = 1',
        args: [chatId]
      })

      // Si el otro usuario también ha borrado la conversación, borramos la conversación, los usuarios y sus mensajes
      if (isLastUser.rows.length === 0) {
        const deleteUsers = await db.execute({
          sql: 'DELETE FROM conversaciones_usuarios_w_c WHERE id_conversation = ?',
          args: [chatId]
        })

        const deleteMsgs = await db.execute({
          sql: 'DELETE FROM mensajes_w_c WHERE id_conversation = ?',
          args: [chatId]
        })

        const deleteConversation = await db.execute({
          sql: 'DELETE FROM conversaciones_w_c WHERE id = ?',
          args: [chatId]
        })

        isDeleted = deleteUsers.rowsAffected === 2 && deleteUser.rowsAffected === 1 && deleteConversation.rowsAffected === 1 && deleteMsgs.rowsAffected >= 1
      } else {
        isDeleted = deleteUser.rowsAffected === 1
      }
    }
    return isDeleted
  }

  static async checkConversation ({ userId1, userId2 }) {
    const chat = await db.execute({
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
          conversaciones_usuarios_w_c AS cu ON cu.id_conversation = c.id
        JOIN
          usuarios_w_c AS u ON cu.id_user = u.id
        WHERE
          c.id IN (
            SELECT id_conversation
            FROM conversaciones_usuarios_w_c
            WHERE id_user = ?
          )
        AND u.id = ?  
      `,
      args: [userId1, userId2]
    })

    // Si el chat existe obtenemos los mensajes
    if (chat.rows.length === 1) {
      const chatId = chat.rows[0].id

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
            id_conversation = ?
        `,
        args: [chatId]
      })

      // Vovlemos a poner la conversación activa
      await db.execute({
        sql: 'UPDATE conversaciones_usuarios_w_c SET active = 1 WHERE id_conversation = ?',
        args: [chatId]
      })

      return {
        ...chat.rows[0],
        messages: messages.rows
      }
    }

    return {}
  }

  static async getConversation ({ conversationId, userId }) {
    const conversation = await db.execute({
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
          conversaciones_usuarios_w_c AS cu ON cu.id_conversation = c.id
        JOIN
          usuarios_w_c AS u ON cu.id_user = u.id
        WHERE
          c.id = ?
        AND 
          u.id != ?
      `,
      args: [conversationId, userId]
    })

    return conversation.rows[0]
  }
}
