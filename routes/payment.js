import express from 'express';
import { randomUUID, createHash } from 'crypto';
import { all, get, run } from '../db.js';
import { formatSupportOrderMessage, supportStatusKeyboard, clientStatusMessage } from '../lib/messages.js';

const YOOKASSA_API = 'https://api.yookassa.ru/v3';

function yookassaAuthHeader() {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  return 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64');
}

// Детерминированный ключ из order_id (а не randomUUID на каждый вызов) — повторный
// запрос создания платежа с фронта на тот же заказ (двойной клик, ретрай сети)
// не должен породить второй платёж на стороне ЮKassa.
function idempotenceKeyForOrder(orderId) {
  return createHash('sha256').update(`create-payment-order-${orderId}`).digest('hex');
}

function amountToKopecks(value) {
  return Math.round(Number(value) * 100);
}

// bot instance is injected from server.js so this module doesn't need to import bot.js directly
export function createPaymentRouter(bot) {
  const paymentRouter = express.Router();

  paymentRouter.post('/create', async (req, res) => {
    const { order_id } = req.body || {};
    const order = get('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });

    const baseUrl = process.env.BASE_URL;

    try {
      const response = await fetch(`${YOOKASSA_API}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: yookassaAuthHeader(),
          'Idempotence-Key': idempotenceKeyForOrder(order.id),
        },
        body: JSON.stringify({
          amount: { value: (order.total_kopecks / 100).toFixed(2), currency: 'RUB' },
          confirmation: {
            type: 'redirect',
            return_url: `${baseUrl}/?order_success=${order.id}`,
          },
          capture: true,
          description: `Заказ №${order.id} - Родная Земля`,
          metadata: { order_id: String(order.id) },
        }),
      });

      const payment = await response.json();
      if (!response.ok) {
        console.error('YooKassa create payment error:', payment);
        return res.status(502).json({ error: 'Не удалось создать платёж' });
      }

      run(
        `INSERT INTO payments (order_id, yookassa_id, amount_kopecks, status)
         VALUES (?, ?, ?, ?)`,
        [order.id, payment.id, order.total_kopecks, payment.status || 'pending']
      );
      run('UPDATE orders SET payment_id = ?, updated_at = datetime(\'now\') WHERE id = ?', [payment.id, order.id]);

      res.json({ confirmation_url: payment.confirmation?.confirmation_url });
    } catch (err) {
      console.error('YooKassa create payment failed:', err);
      res.status(502).json({ error: 'Ошибка связи с платёжным сервисом' });
    }
  });

  paymentRouter.post('/webhook', express.json(), async (req, res) => {
    // ВАЖНО: ЮKassa не подписывает вебхуки, а URL не является секретом (путь
    // предсказуем, адрес прописан в личном кабинете) — поэтому телу запроса не
    // доверяем вообще. Используем только object.id из уведомления, чтобы
    // запросить у ЮKassa настоящее состояние платежа, и дальше работаем
    // исключительно с ответом API (статус, сумма, валюта, metadata.order_id).
    const notification = req.body || {};
    const event = notification.event;
    const paymentId = notification.object?.id;

    console.log('Webhook получен:', { event, payment_id: paymentId });

    if (!paymentId) {
      console.warn('Webhook: в теле нет object.id, игнорируем', { event });
      return res.sendStatus(200);
    }

    if (event !== 'payment.succeeded' && event !== 'payment.canceled') {
      console.log('Webhook: событие не обрабатывается, пропуск', { event, payment_id: paymentId });
      return res.sendStatus(200);
    }

    let apiResponse;
    try {
      apiResponse = await fetch(`${YOOKASSA_API}/payments/${paymentId}`, {
        headers: { Authorization: yookassaAuthHeader() },
      });
    } catch (err) {
      console.error('Webhook: ЮKassa API недоступна, нужен ретрай', { payment_id: paymentId, error: err.message });
      return res.sendStatus(500);
    }

    if (apiResponse.status === 404) {
      console.warn('Webhook: платёж с таким id не найден в ЮKassa (похоже на подделку)', { event, payment_id: paymentId });
      return res.sendStatus(200);
    }

    if (!apiResponse.ok) {
      console.error('Webhook: ошибка ЮKassa API, нужен ретрай', { payment_id: paymentId, status: apiResponse.status });
      return res.sendStatus(500);
    }

    const payment = await apiResponse.json();
    const orderId = payment.metadata?.order_id;
    const order = orderId ? get('SELECT * FROM orders WHERE id = ?', [orderId]) : null;

    if (!order) {
      console.warn('Webhook: заказ не найден по metadata.order_id из ЮKassa', { payment_id: payment.id, order_id: orderId });
      return res.sendStatus(200);
    }

    if (event === 'payment.succeeded') {
      const amountMatches = amountToKopecks(payment.amount?.value) === order.total_kopecks;
      const currencyMatches = payment.amount?.currency === 'RUB';

      if (payment.status !== 'succeeded' || !payment.paid || !amountMatches || !currencyMatches) {
        console.warn('Webhook: payment.succeeded не прошёл проверку, заказ не тронут', {
          payment_id: payment.id,
          order_id: order.id,
          status: payment.status,
          paid: payment.paid,
          amountMatches,
          currencyMatches,
        });
        return res.sendStatus(200);
      }

      run('UPDATE payments SET status = ?, updated_at = datetime(\'now\') WHERE yookassa_id = ?', ['succeeded', payment.id]);

      if (order.status === 'created') {
        run('UPDATE orders SET status = ?, updated_at = datetime(\'now\') WHERE id = ?', ['paid', order.id]);
        const paidOrder = get('SELECT * FROM orders WHERE id = ?', [order.id]);
        const items = all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        // Корзина на сервере хранится до фактической оплаты (не до создания заказа) —
        // если оплата не состоится, при повторном открытии клиент увидит те же товары.
        run('DELETE FROM carts WHERE user_id = ?', [paidOrder.user_id]);
        await notifySupportChat(bot, { ...paidOrder, items });
        await notifyClient(bot, paidOrder.user_id, 'paid', paidOrder);
        console.log('Webhook: заказ помечен оплаченным', { order_id: order.id, payment_id: payment.id });
      } else {
        console.log('Webhook: заказ уже был обработан ранее, повторное уведомление не отправляется', {
          order_id: order.id,
          order_status: order.status,
          payment_id: payment.id,
        });
      }
    } else if (event === 'payment.canceled') {
      // Отменённый (не состоявшийся) платёж — заказ остаётся в created, чтобы
      // клиент мог повторно оплатить; уведомление сотрудникам не отправляется.
      run('UPDATE payments SET status = ?, updated_at = datetime(\'now\') WHERE yookassa_id = ?', ['cancelled', payment.id]);
      console.log('Webhook: платёж отменён', { order_id: order.id, payment_id: payment.id });
    }

    res.sendStatus(200);
  });

  return paymentRouter;
}

export async function notifySupportChat(bot, order) {
  const supportChatId = process.env.SUPPORT_CHAT_ID;
  if (!bot || !supportChatId) return;
  try {
    await bot.api.sendMessageToChat(supportChatId, formatSupportOrderMessage(order), supportStatusKeyboard(order.id));
  } catch (err) {
    console.error('Failed to notify support chat:', err);
  }
}

export async function notifyClient(bot, userId, status, order) {
  if (!bot) return;
  try {
    await bot.api.sendMessageToUser(userId, clientStatusMessage(status, order));
  } catch (err) {
    console.error('Failed to notify client:', err);
  }
}

export async function refundPayment(order) {
  const payment = get('SELECT * FROM payments WHERE order_id = ? AND status = ? ORDER BY id DESC', [order.id, 'succeeded']);
  if (!payment) return;

  try {
    const response = await fetch(`${YOOKASSA_API}/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: yookassaAuthHeader(),
        'Idempotence-Key': randomUUID(),
      },
      body: JSON.stringify({
        amount: { value: (payment.amount_kopecks / 100).toFixed(2), currency: 'RUB' },
        payment_id: payment.yookassa_id,
      }),
    });
    const refund = await response.json();
    if (!response.ok) {
      console.error('YooKassa refund error:', refund);
      return;
    }
    run('UPDATE payments SET status = ?, updated_at = datetime(\'now\') WHERE id = ?', ['refunded', payment.id]);
  } catch (err) {
    console.error('YooKassa refund failed:', err);
  }
}
