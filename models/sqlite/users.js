import { db } from '../../index.js'

export class UserModel {
  static async getProfileData ({ id }) {
    const user = await db.execute({
      sql: 'SELECT alias, info FROM usuarios_w_c WHERE id = ?',
      args: [id]
    })
    return user.rows[0]
  }

  static async updateProfileData ({ alias, info, id }) {
    const data = await db.execute({
      sql: 'UPDATE usuarios_w_c SET alias = ?, info = ? WHERE id = ?',
      args: [alias, info, id]
    })
    return data
  }

  static async getFilteredUsers ({ filter }) {
    let users
    if (filter === 'all') {
      users = await db.execute('SELECT id, alias, info FROM usuarios_w_c ORDER BY alias')
    } else {
      users = await db.execute({
        sql: 'SELECT id, alias, info FROM usuarios_w_c WHERE alias LIKE ? ORDER BY alias',
        args: [`%${filter}%`]
      })
    }
    return users.rows
  }

  static async getInteractionsWithUsers ({ filter, userId }) {
    // Selecciona los contactos que no disponen de una conversación previa
    const contacts = await db.execute({
      sql: `
        SELECT 
          u.id, u.alias, u.info
        FROM 
          usuarios_w_c AS u
        WHERE
          u.alias 
        LIKE 
          ?
        AND 
          u.id 
        NOT IN (
          SELECT 
            cu1.id_user
          FROM 
            conversaciones_usuarios_w_c AS cu1
          WHERE 
            cu1.id_conversation
          IN (
            SELECT 
              cu2.id_conversation
            FROM 
              conversaciones_usuarios_w_c AS cu2
            WHERE 
              cu2.id_user = ?
          )
        )
      `,
      args: [`%${filter}%`, userId]
    })

    // Selecciona las conversaciones con los usuarios que su alias coincide con el filtro
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
          u.alias LIKE ?
        AND
          u.id != ?
        AND 
          c.id IN (
            SELECT 
              c.id
            FROM 
              conversaciones_w_c AS c
            JOIN 
              conversaciones_usuarios_w_c cu ON c.id = cu.id_conversation
            WHERE 
              cu.id_user = ?
          )
      `,
      args: [`%${filter}%`, userId, userId]
    })

    // Selecciona los grupos en los que se encuentra el usuario que coincide con el filtro
    const groups = await db.execute({
      sql: `
      SELECT DISTINCT
        g.id,
        g.name,
        g.info,
        g.date,
        g.admin,
        u.alias AS adminAlias
      FROM 
        grupos_w_c AS g 
      JOIN
        grupos_usuarios_w_c AS gu ON g.id = gu.id_group
      JOIN
        usuarios_w_c AS u ON u.id = g.admin
      WHERE
        g.id IN (
          SELECT 
            gu.id_group
          FROM 
            grupos_usuarios_w_c AS gu
          JOIN
            usuarios_w_c AS user_filter ON gu.id_user = user_filter.id
          WHERE 
            user_filter.alias LIKE ?
          )
      AND 
        g.id IN (
          SELECT 
            id_group AS id
          FROM 
            grupos_usuarios_w_c
          WHERE 
            id_user = ?
          )
      `,
      args: [`%${filter}%`, userId]
    })

    return {
      contacts: contacts.rows,
      conversations: conversations.rows,
      groups: groups.rows
    }
  }
}
