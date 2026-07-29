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
  sort_order INTEGER NOT NULL DEFAULT 0,
  nutrition_info TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  district TEXT NOT NULL DEFAULT '',
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
  runMigrations();
  syncProducts();
  persist();

  return db;
}

// CREATE TABLE IF NOT EXISTS не добавляет колонки в уже существующую таблицу —
// для баз, созданных до этого поля, дотягиваем схему явным ALTER TABLE.
function ensureColumn(table, column, definition) {
  const columns = all(`PRAGMA table_info(${table})`);
  if (!columns.some((c) => c.name === column)) {
    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function runMigrations() {
  ensureColumn('products', 'nutrition_info', "TEXT DEFAULT ''");
  ensureColumn('orders', 'district', "TEXT NOT NULL DEFAULT ''");
}

// Upsert по естественному ключу (name, category, weight_label) — id товара не меняется,
// поэтому order_items.product_id и история заказов не ломаются при обновлении seed-каталога.
// Товары, пропавшие из seed/products.js, не удаляются, а помечаются is_active=0.
function productKey(p) {
  return `${p.name}|||${p.category}|||${p.weight_label}`;
}

function syncProducts() {
  const existingRows = all('SELECT id, name, category, weight_label FROM products');
  const existingByKey = new Map(existingRows.map((r) => [productKey(r), r.id]));
  const seedKeys = new Set(seedProducts.map(productKey));

  for (const p of seedProducts) {
    const existingId = existingByKey.get(productKey(p));
    if (existingId) {
      db.run(
        `UPDATE products SET description = ?, price_kopecks = ?, unit = ?, image_url = ?, sort_order = ?, is_active = 1
         WHERE id = ?`,
        [p.description, p.price_kopecks, p.unit, p.image_url, p.sort_order, existingId]
      );
    } else {
      db.run(
        `INSERT INTO products (name, description, category, price_kopecks, unit, weight_label, image_url, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.name, p.description, p.category, p.price_kopecks, p.unit, p.weight_label, p.image_url, p.sort_order]
      );
    }
  }

  for (const row of existingRows) {
    if (!seedKeys.has(productKey(row))) {
      db.run('UPDATE products SET is_active = 0 WHERE id = ?', [row.id]);
    }
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
