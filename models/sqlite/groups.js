import { db } from '../../index.js'

export class GroupModel {
  static async updateGroup ({ name, info, id }) {
    const data = await db.execute({
      sql: 'UPDATE grupos_w_c SET name = ?, info = ? WHERE id = ?',
      args: [name, info, id]
    })
    return data
  }

  static async createGroup ({ id, name, date, admin, usersId }) {
    const data = await db.execute({
      sql: 'INSERT INTO grupos_w_c (id, name, date, admin) VALUES (?, ?, ?, ?)',
      args: [id, name, date, admin]
    })

    const addUsers = usersId.map(async (userId) => {
      return await db.execute({
        sql: 'INSERT INTO grupos_usuarios_w_c VALUES (?, ?)',
        args: [id, userId]
      })
    })

    const response = await Promise.all(addUsers).then(values => values.map(value => value.rowsAffected === 1))

    return (data.rowsAffected === 1 && response.every(item => item === true))
  }

  static async getCommonGroups ({ id, contactId }) {
    const commonGroups = await db.execute({
      sql: `
        SELECT 
          g.id,
          g.name 
        FROM 
          grupos_w_c AS g
        INNER JOIN
          grupos_usuarios_w_c AS gu1 
        ON 
          g.id = gu1.id_group
        INNER JOIN
          grupos_usuarios_w_c AS gu2 
        ON 
          gu1.id_group = gu2.id_group
        WHERE 
          gu1.id_user = ? 
        AND 
          gu2.id_user = ?
        `,
      args: [id, contactId]
    })

    return commonGroups.rows
  }

  static async getUsersGroup ({ idGroup }) {
    const users = await db.execute({
      sql: `
        SELECT 
          u.id, u.alias, u.info, u.email 
        FROM 
          usuarios_w_c AS u 
        INNER JOIN 
          grupos_usuarios_w_c AS gu 
        ON 
          u.id = gu.id_user 
        WHERE 
          gu.id_group = ?
      `,
      args: [idGroup]
    })

    return users.rows
  }

  static async deleteGroup ({ chatId, userId }) {
    let isDeleted
    // Primero comprobamos que no haya ningún mensaje
    const noMsg = await db.execute({
      sql: 'SELECT * FROM mensajes_w_c WHERE id_group = ? LIMIT 1',
      args: [chatId]
    })

    // Si el grupo no tiene mensajes borramos todos los usuarios y la conversacion
    if (noMsg.rows.length === 0) {
      const deleteUsers = await db.execute({
        sql: 'DELETE FROM grupos_usuarios_w_c WHERE id_group = ?',
        args: [chatId]
      })

      const deleteGroup = await db.execute({
        sql: 'DELETE FROM grupos_w_c WHERE id = ?',
        args: [chatId]
      })

      isDeleted = deleteUsers.rowsAffected > 1 && deleteGroup.rowsAffected === 1

    // Si hay mensajes
    } else {
      // Borramos al usuario del grupo
      const deleteUser = await db.execute({
        sql: 'DELETE FROM grupos_usuarios_w_c WHERE id_group = ? AND id_user = ?',
        args: [chatId, userId]
      })

      // Comprobamos que el otro usuario no se haya salido de la conversación
      const isLastUser = await db.execute({
        sql: 'SELECT * FROM grupos_usuarios_w_c WHERE id_group = ?',
        args: [chatId]
      })

      // Si el grupo está vacío
      if (isLastUser.rows.length === 0) {
        const deleteMsgs = await db.execute({
          sql: 'DELETE FROM mensajes_w_c WHERE id_group = ?',
          args: [chatId]
        })

        const deleteGroup = await db.execute({
          sql: 'DELETE FROM grupos_w_c WHERE id = ?',
          args: [chatId]
        })

        isDeleted = deleteUser.rowsAffected === 1 && deleteGroup.rowsAffected === 1 && deleteMsgs.rowsAffected >= 1
      } else {
        // TODO: Aqui deberiamos poner otro admin si es que es el admin el que abandonado el grupo
        isDeleted = deleteUser.rowsAffected === 1
      }
    }
    return isDeleted
  }

  static async getGroup ({ groupId }) {
    const group = await db.execute({
      sql: `
        SELECT 
          g.*,
          u.alias AS adminAlias
        FROM 
          grupos_w_c AS g 
        INNER JOIN
          usuarios_w_c AS u ON u.id = g.admin
        WHERE
          g.id = ?
      `,
      args: [groupId]
    })

    return group.rows[0]
  }
}
