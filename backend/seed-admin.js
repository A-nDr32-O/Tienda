const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const email = process.argv[2] || 'admin@prueba.com';
const name = process.argv[3] || 'Admin Prueba';
const password = process.argv[4] || 'Admin1234!';

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('No se pudo abrir database.db:', err.message);
    process.exit(1);
  }
});

const hashedPassword = bcrypt.hashSync(password, 10);

const query = `
  INSERT INTO users (email, password, name, role)
  VALUES (?, ?, ?, 'admin')
  ON CONFLICT(email) DO UPDATE SET
    password = excluded.password,
    name = excluded.name,
    role = 'admin';
`;

db.run(query, [email, hashedPassword, name], function(err) {
  if (err) {
    console.error('Error creando o actualizando el usuario:', err.message);
    process.exit(1);
  }

  console.log(`Usuario admin de prueba listo:`);
  console.log(`  email: ${email}`);
  console.log(`  password: ${password}`);
  db.close();
});
