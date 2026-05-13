const sqlite3 = require('sqlite3').verbose();
const email = process.argv[2];

if (!email) {
  console.error('Uso: node make-admin.js tu-email@ejemplo.com');
  process.exit(1);
}

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('No se pudo abrir database.db:', err.message);
    process.exit(1);
  }
});

db.run('UPDATE users SET role = ? WHERE email = ?', ['admin', email], function(err) {
  if (err) {
    console.error('Error actualizando usuario:', err.message);
    process.exit(1);
  }

  if (this.changes === 0) {
    console.log(`No se encontró ningún usuario con email ${email}.`);
  } else {
    console.log(`Usuario ${email} actualizado a admin.`);
  }
  db.close();
});
