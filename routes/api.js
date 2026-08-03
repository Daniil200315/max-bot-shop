import express from 'express';
import { all, get, insert, run } from '../db.js';
import { MIN_ORDER_KOPECKS, isBelowMinimum, computeDeliveryFee } from '../lib/pricing.js';
import { buildDateOptions, isDeliverySelectionValid } from '../lib/delivery.js';

export const apiRouter = express.Router();

function toProductDto(p) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    nutrition_info: p.nutrition_info,
    ingredients: p.ingredients,
    category: p.category,
    price_kopecks: p.price_kopecks,
    price_rub: p.price_kopecks / 100,
    unit: p.unit,
    weight_label: p.weight_label,
    image_url: p.image_url,
  };
}

function getOrderWithItems(orderId) {
  const order = get('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (!order) return null;
  const items = all('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  return { ...order, items };
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

apiRouter.get('/delivery-options', (req, res) => {
  res.json({ dateOptions: buildDateOptions() });
});

const FIELD_LIMITS = { street: 200, house: 20, apartment: 20, comment: 500 };

apiRouter.post('/orders', (req, res) => {
  const {
    user_id,
    user_name = '',
    phone,
    street = '',
    house = '',
    apartment = '',
    comment = '',
    district,
    delivery_date,
    delivery_time_slot,
    items,
  } = req.body || {};

  const trimmedStreet = String(street).trim();
  const trimmedHouse = String(house).trim();
  const trimmedApartment = String(apartment).trim();
  const trimmedComment = String(comment).trim();

  if (!user_id || !phone || !trimmedStreet || !trimmedHouse || !district || !delivery_date || !delivery_time_slot) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }
  if (trimmedStreet.length > FIELD_LIMITS.street) {
    return res.status(400).json({ error: `Улица не длиннее ${FIELD_LIMITS.street} символов` });
  }
  if (trimmedHouse.length > FIELD_LIMITS.house) {
    return res.status(400).json({ error: `Номер дома не длиннее ${FIELD_LIMITS.house} символов` });
  }
  if (trimmedApartment.length > FIELD_LIMITS.apartment) {
    return res.status(400).json({ error: `Номер квартиры не длиннее ${FIELD_LIMITS.apartment} символов` });
  }
  if (trimmedComment.length > FIELD_LIMITS.comment) {
    return res.status(400).json({ error: `Комментарий не длиннее ${FIELD_LIMITS.comment} символов` });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Корзина пуста' });
  }
  if (!isDeliverySelectionValid(delivery_date, delivery_time_slot)) {
    return res.status(400).json({ error: 'Выбранные дата и время доставки уже недоступны, обновите страницу' });
  }

  const delivery_address = `г. Новокузнецк, ул. ${trimmedStreet}, д. ${trimmedHouse}${trimmedApartment ? `, кв. ${trimmedApartment}` : ''}`;

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
      (user_id, user_name, phone, delivery_address, street, house, apartment, comment, district,
       delivery_date, delivery_time_slot, subtotal_kopecks, delivery_fee_kopecks, total_kopecks, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'created')`,
    [user_id, user_name, phone, delivery_address, trimmedStreet, trimmedHouse, trimmedApartment, trimmedComment,
      district, delivery_date, delivery_time_slot, subtotal_kopecks, delivery_fee_kopecks, total_kopecks]
  );

  for (const item of resolvedItems) {
    insert(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, price_kopecks)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, item.product_id, item.product_name, item.quantity, item.price_kopecks]
    );
  }

  // Уведомление сотрудникам отправляется в routes/payment.js по событию
  // payment.succeeded от ЮKassa — не здесь, чтобы не дублировать сообщение.
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

// Корзина привязана к user_id из MAX и переживает закрытие мини-приложения.
// Цена всегда берётся из текущей записи товара в БД, а не из сохранённой
// корзины — так пересчёт цены при обновлении каталога происходит сам собой.
// Товары, снятые с продажи (is_active=0) или удалённые, тихо выпадают из
// корзины при чтении; их названия возвращаются в removedNames для тоста на фронте.
function reconcileCart(userId) {
  const row = get('SELECT items FROM carts WHERE user_id = ?', [userId]);
  if (!row) return { items: [], removedNames: [] };

  let stored;
  try {
    stored = JSON.parse(row.items);
  } catch {
    stored = [];
  }
  if (!Array.isArray(stored)) stored = [];

  const items = [];
  const removedNames = [];
  for (const entry of stored) {
    const product = get('SELECT * FROM products WHERE id = ?', [entry.product_id]);
    if (!product || !product.is_active) {
      if (product) removedNames.push(product.name);
      continue;
    }
    const quantity = Number(entry.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) continue;
    items.push({ product: toProductDto(product), quantity });
  }
  return { items, removedNames };
}

apiRouter.get('/cart', (req, res) => {
  const userId = Number(req.query.user_id);
  if (!userId) return res.status(400).json({ error: 'user_id обязателен' });
  res.json(reconcileCart(userId));
});

apiRouter.put('/cart', (req, res) => {
  const { user_id, items } = req.body || {};
  const userId = Number(user_id);
  if (!userId) return res.status(400).json({ error: 'user_id обязателен' });
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items должен быть массивом' });

  const cleaned = items
    .filter((i) => i && Number.isInteger(Number(i.product_id)) && Number.isInteger(Number(i.quantity)) && Number(i.quantity) > 0)
    .map((i) => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) }));

  if (cleaned.length === 0) {
    run('DELETE FROM carts WHERE user_id = ?', [userId]);
    return res.json({ ok: true });
  }

  const existing = get('SELECT user_id FROM carts WHERE user_id = ?', [userId]);
  if (existing) {
    run('UPDATE carts SET items = ?, updated_at = datetime(\'now\') WHERE user_id = ?', [JSON.stringify(cleaned), userId]);
  } else {
    insert('INSERT INTO carts (user_id, items, updated_at) VALUES (?, ?, datetime(\'now\'))', [userId, JSON.stringify(cleaned)]);
  }
  res.json({ ok: true });
});
