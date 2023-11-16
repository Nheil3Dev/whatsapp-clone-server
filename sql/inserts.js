import { db } from '../index.js'

await db.execute(`
    INSERT INTO usuarios_w_c VALUES
    ('cd89bf8f-e422-47f5-867d-2567caf3e476', 'claudio@meloinvento.com', '123456', 'Claudio', 'Yo tampoco se vivir, estoy improvisando...✌️'),
    ('3a477c32-9b41-4d7c-8cd6-dc3de056c5ec', 'valeria@meloinvento.com', '123456', 'Valeria', 'Me encanta la patrulla canina 🐶🐶'),
    ('7d0bf74b-252c-4baf-9391-a798a859243f', 'lucia@meloinvento.com', '123456', 'Lucia', 'Miau 🐈')
`)

await db.execute(`
    INSERT INTO grupos_w_c VALUES
    ('56dde3b3-ca4d-4eb8-9fde-03edb9ec2d3c', 'La familia feliz 😁', 'Grupo de la familia', '2023-10-26 12:00:36', 'cd89bf8f-e422-47f5-867d-2567caf3e476')
`)

await db.execute(`
    INSERT INTO grupos_usuarios_w_c VALUES
    ('56dde3b3-ca4d-4eb8-9fde-03edb9ec2d3c', 'cd89bf8f-e422-47f5-867d-2567caf3e476'),
    ('56dde3b3-ca4d-4eb8-9fde-03edb9ec2d3c', '3a477c32-9b41-4d7c-8cd6-dc3de056c5ec'),
    ('56dde3b3-ca4d-4eb8-9fde-03edb9ec2d3c', '7d0bf74b-252c-4baf-9391-a798a859243f')
`)

await db.execute(`
    INSERT INTO conversaciones_w_c VALUES
    ('5ef80889-fee3-468d-b1d2-2c8ca55fb15a', '2023-10-26 12:15:22'),
    ('317439b3-f147-499a-9e7a-db380af5eb21', '2023-10-26 12:19:39')
`)

await db.execute(`
    INSERT INTO conversaciones_usuarios_w_c VALUES
    ('5ef80889-fee3-468d-b1d2-2c8ca55fb15a', 'cd89bf8f-e422-47f5-867d-2567caf3e476'),
    ('5ef80889-fee3-468d-b1d2-2c8ca55fb15a', '3a477c32-9b41-4d7c-8cd6-dc3de056c5ec'),
    ('317439b3-f147-499a-9e7a-db380af5eb21', 'cd89bf8f-e422-47f5-867d-2567caf3e476'),
    ('317439b3-f147-499a-9e7a-db380af5eb21', '7d0bf74b-252c-4baf-9391-a798a859243f')
`)
