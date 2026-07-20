import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { products as seedProducts } from './seed/products.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'shop.sqlite');

let db;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  price_kopecks INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT 'шт',
  weight_label TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_date TEXT NOT NULL,
  delivery_time_slot TEXT NOT NULL,
  subtotal_kopecks INTEGER NOT NULL,
  delivery_fee_kopecks INTEGER NOT NULL,
  total_kopecks INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  payment_id TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_kopecks INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  yookassa_id TEXT NOT NULL,
  amount_kopecks INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
`;

export async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run(SCHEMA);
  seedIfEmpty();
  persist();

  return db;
}

function seedIfEmpty() {
  const row = get('SELECT COUNT(*) AS count FROM products');
  if (row.count > 0) return;

  for (const p of seedProducts) {
    db.run(
      `INSERT INTO products (name, description, category, price_kopecks, unit, weight_label, image_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.name, p.description, p.category, p.price_kopecks, p.unit, p.weight_label, p.image_url, p.sort_order]
    );
  }
}

export function persist() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

export function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

export function get(sql, params = []) {
  return all(sql, params)[0] || null;
}

export function run(sql, params = []) {
  db.run(sql, params);
  persist();
}

export function insert(sql, params = []) {
  db.run(sql, params);
  const { id } = get('SELECT last_insert_rowid() AS id');
  persist();
  return id;
}

export function getDb() {
  return db;
}
