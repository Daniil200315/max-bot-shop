import express from 'express';
import { all, get, insert } from '../db.js';
import { MIN_ORDER_KOPECKS, isBelowMinimum, computeDeliveryFee } from '../lib/pricing.js';

export const apiRouter = express.Router();

function toProductDto(p) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    price_kopecks: p.price_kopecks,
    price_rub: p.price_kopecks / 100,
    unit: p.unit,
    weight_label: p.weight_label,
    image_url: p.image_url,
  };
}

apiRouter.get('/products', (req, res) => {
  const rows = all(
    'SELECT * FROM products WHERE is_active = 1 ORDER BY category, sort_order, id'
  );

  const categories = [];
  const byCategory = new Map();
  for (const row of rows) {
    if (!byCategory.has(row.category)) {
      const bucket = { category: row.category, products: [] };
      byCategory.set(row.category, bucket);
      categories.push(bucket);
    }
    byCategory.get(row.category).products.push(toProductDto(row));
  }

  res.json({ categories });
});

apiRouter.get('/products/:id', (req, res) => {
  const product = get('SELECT * FROM products WHERE id = ? AND is_active = 1', [req.params.id]);
  if (!product) return res.status(404).json({ error: 'Товар не найден' });
  res.json(toProductDto(product));
});

function getOrderWithItems(orderId) {
  const order = get('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (!order) return null;
  const items = all('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  return { ...order, items };
}

apiRouter.post('/orders', (req, res) => {
  const {
    user_id,
    user_name = '',
    phone,
    delivery_address,
    delivery_date,
    delivery_time_slot,
    items,
  } = req.body || {};

  if (!user_id || !phone || !delivery_address || !delivery_date || !delivery_time_slot) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Корзина пуста' });
  }

  const resolvedItems = [];
  let subtotal_kopecks = 0;

  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!item.product_id || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'Некорректный состав заказа' });
    }
    const product = get('SELECT * FROM products WHERE id = ? AND is_active = 1', [item.product_id]);
    if (!product) {
      return res.status(400).json({ error: `Товар #${item.product_id} недоступен` });
    }
    subtotal_kopecks += product.price_kopecks * quantity;
    resolvedItems.push({
      product_id: product.id,
      product_name: product.name,
      quantity,
      price_kopecks: product.price_kopecks,
    });
  }

  if (isBelowMinimum(subtotal_kopecks)) {
    return res.status(400).json({
      error: `Минимальная сумма заказа ${MIN_ORDER_KOPECKS / 100} ₽`,
    });
  }

  const delivery_fee_kopecks = computeDeliveryFee(subtotal_kopecks);
  const total_kopecks = subtotal_kopecks + delivery_fee_kopecks;

  const orderId = insert(
    `INSERT INTO orders
      (user_id, user_name, phone, delivery_address, delivery_date, delivery_time_slot,
       subtotal_kopecks, delivery_fee_kopecks, total_kopecks, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'created')`,
    [user_id, user_name, phone, delivery_address, delivery_date, delivery_time_slot,
      subtotal_kopecks, delivery_fee_kopecks, total_kopecks]
  );

  for (const item of resolvedItems) {
    insert(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, price_kopecks)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, item.product_id, item.product_name, item.quantity, item.price_kopecks]
    );
  }

  res.status(201).json(getOrderWithItems(orderId));
});

apiRouter.get('/orders', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id обязателен' });

  const orders = all(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [user_id]
  );
  res.json(orders);
});

apiRouter.get('/orders/:id', (req, res) => {
  const order = getOrderWithItems(req.params.id);
  if (!order) return res.status(404).json({ error: 'Заказ не найден' });
  res.json(order);
});
