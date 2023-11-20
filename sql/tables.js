import { db } from '../index.js'

await db.execute(`
  CREATE TABLE IF NOT EXISTS whatsappclone (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    content TEXT,
    date TIMESTAMP
  )
`)

await db.execute(`
  CREATE TABLE IF NOT EXISTS usuarios_w_c (
    id TEXT PRIMARY KEY,
    email TEXT,
    password TEXT,
    alias TEXT,
    info TEXT
  );
`)

await db.execute(`
  CREATE TABLE IF NOT EXISTS grupos_w_c (
    id TEXT PRIMARY KEY,
    name TEXT,
    info TEXT,
    date TIMESTAMP,
    admin TEXT,
    FOREIGN KEY (admin) REFERENCES usuarios_w_c(id)
  );
`)

await db.execute(`
  CREATE TABLE IF NOT EXISTS grupos_usuarios_w_c (
    id_group TEXT,
    id_user TEXT,
    PRIMARY KEY (id_group, id_user),
    FOREIGN KEY (id_group) REFERENCES grupos_w_c(id),
    FOREIGN KEY (id_user) REFERENCES usuarios_w_c(id)
  );
`)

await db.execute(`
  CREATE TABLE IF NOT EXISTS conversaciones_w_c (
    id TEXT PRIMARY KEY,
    date TIMESTAMP
  );
`)

await db.execute(`
    CREATE TABLE IF NOT EXISTS conversaciones_usuarios_w_c (
      id_conversation TEXT,
      id_user TEXT,
      active INTEGER DEFAULT 1,
      PRIMARY KEY (id_conversation, id_user),
      FOREIGN KEY (id_conversation) REFERENCES conversaciones_w_c(id),
      FOREIGN KEY (id_user) REFERENCES usuarios_w_c(id)
    )
`)

await db.execute(`
  CREATE TABLE IF NOT EXISTS mensajes_w_c (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    date TIMESTAMP,
    id_user TEXT,
    id_group TEXT,
    id_conversation TEXT,
    FOREIGN KEY (id_user) REFERENCES usuarios_w_c(id),
    FOREIGN KEY (id_group) REFERENCES grupos_w_c(id),
    FOREIGN KEY (id_conversation) REFERENCES conversaciones_w_c(id)
  )
`)
