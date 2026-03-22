const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'enemies_secret_2026';

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Error opening DB', err);
  else console.log('Base de datos SQLite conectada.');
});

const initDbSql = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  image TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer'
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  total REAL NOT NULL,
  items TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);
`;

db.exec(initDbSql, (err) => {
  if (err) console.error('Error inicializar tablas', err);
  else console.log('Tablas inicializadas.');
});

const authMiddleware = (req, res, next) => {
  const bearer = req.headers.authorization;
  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no enviado' });
  }
  const token = bearer.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'No se pudieron cargar productos' });
    res.json(rows);
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Error obteniendo el producto' });
    if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(row);
  });
});

app.post('/api/products', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Permiso denegado' });

  const { name, description, category, price, image, stock } = req.body;
  const sql = `INSERT INTO products (name, description, category, price, image, stock) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [name, description, category, price, image, stock || 100], function(err) {
    if (err) return res.status(500).json({ error: 'Error guardando producto' });
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/api/products/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Permiso denegado' });
  const { id } = req.params;
  const { name, description, category, price, image, stock } = req.body;
  const sql = `UPDATE products SET name = ?, description = ?, category = ?, price = ?, image = ?, stock = ? WHERE id = ?`;
  db.run(sql, [name, description, category, price, image, stock, id], function(err) {
    if (err) return res.status(500).json({ error: 'Error actualizando producto' });
    if (this.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ success: true });
  });
});

app.delete('/api/products/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Permiso denegado' });
  const { id } = req.params;
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Error eliminando producto' });
    if (this.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ success: true });
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Faltan campos' });
  const hashed = bcrypt.hashSync(password, 10);
  const stmt = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';
  db.run(stmt, [email, hashed, name], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Email ya registrado' });
      return res.status(500).json({ error: 'Error creando usuario' });
    }
    const user = { id: this.lastID, email, name, role: 'customer' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '8h' });
    res.status(201).json({ token, user });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Faltan campos' });

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Error de login' });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: payload });
  });
});

app.get('/api/users/me', authMiddleware, (req, res) => {
  db.get('SELECT id, email, name, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Error al obtener usuario' });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  });
});

app.post('/api/orders', authMiddleware, (req, res) => {
  const { total, items } = req.body;
  if (!total || !items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Datos inválidos' });

  const now = new Date().toISOString();
  const stmt = 'INSERT INTO orders (userId, total, items, status, createdAt) VALUES (?, ?, ?, ?, ?)';
  db.run(stmt, [req.user.id, total, JSON.stringify(items), 'paid', now], function(err) {
    if (err) return res.status(500).json({ error: 'Error registrando orden' });
    res.json({ success: true, orderId: this.lastID });
  });
});

app.get('/api/orders', authMiddleware, (req, res) => {
  db.all('SELECT * FROM orders WHERE userId = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error buscando órdenes' });
    res.json(rows.map(row => ({ ...row, items: JSON.parse(row.items) })));
  });
});

app.post('/api/payments', authMiddleware, (req, res) => {
  const { amount, method, details } = req.body;
  if (!amount || !method) return res.status(400).json({ error: 'Datos de pago incompletos' });

  // SIMULACIÓN de procesamiento de pago
  const fakeId = `PYMT-${Date.now()}`;
  const status = 'approved';

  res.json({
    status,
    paymentId: fakeId,
    amount,
    method,
    processedAt: new Date().toISOString(),
    message: 'Pago simulado exitoso. Integra Stripe/PayPal en producción.'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
