import { Bot } from '@maxhub/max-bot-api';
import { get, run, all } from './db.js';
import { notifyClient, refundPayment } from './routes/payment.js';
import { formatSupportOrderMessage, supportStatusKeyboard, SUPPORT_STATUS_LABEL } from './lib/messages.js';

const STATUS_BY_ACTION = {
  confirm: 'confirmed',
  delivering: 'delivering',
  delivered: 'delivered',
  cancel: 'cancelled',
};

const REFUNDABLE_STATUSES = ['paid', 'confirmed', 'delivering'];
const TERMINAL_STATUSES = ['delivered', 'cancelled'];

export function createBot() {
  return new Bot(process.env.BOT_TOKEN);
}

function openAppKeyboard() {
  return {
    attachments: [{
      type: 'inline_keyboard',
      payload: {
        buttons: [[{
          type: 'open_app',
          text: '🛍 Открыть магазин',
          url: process.env.BASE_URL,
        }]],
      },
    }],
  };
}

export function registerBotHandlers(bot) {
  // По умолчанию SDK при ошибке в обработчике апдейта делает `throw err`,
  // а необработанный reject в Node по умолчанию убивает процесс целиком —
  // из-за бага в одном сообщении упал бы весь магазин. Тут просто логируем.
  bot.catch((err, ctx) => {
    console.error('Bot update handler error:', err, 'update:', ctx?.update);
  });

  const welcome = async (ctx) => {
    try {
      await ctx.reply('Добро пожаловать в магазин «Родная Земля»! 🥛🧀', openAppKeyboard());
    } catch (err) {
      console.error('Failed to send welcome message:', err);
    }
  };

  bot.on('bot_started', welcome);
  bot.command('start', welcome);

  bot.on('message_callback', async (ctx) => {
    // ВАЖНО: структура callback в SDK 0.2.2 не до конца документирована,
    // оставляем отладочный вывод, чтобы проверить эмпирически при первом запуске.
    console.log('=== CALLBACK DEBUG ===');
    console.log('callback:', JSON.stringify(ctx.callback, null, 2));
    console.log('user:', JSON.stringify(ctx.user, null, 2));
    console.log('=====================');

    const payload = ctx.callback?.payload || '';
    const [action, orderIdRaw] = payload.split(':');
    const newStatus = STATUS_BY_ACTION[action];
    if (!newStatus) return;

    const orderId = Number(orderIdRaw);
    const order = get('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return;

    if (newStatus === 'cancelled' && REFUNDABLE_STATUSES.includes(order.status)) {
      await refundPayment(order);
    }

    run("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?", [newStatus, orderId]);
    const updatedOrder = get('SELECT * FROM orders WHERE id = ?', [orderId]);
    const items = all('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    await notifyClient(bot, updatedOrder.user_id, newStatus, updatedOrder);

    try {
      await ctx.answerOnCallback({ notification: `Статус обновлён: ${SUPPORT_STATUS_LABEL[newStatus]}` });
    } catch (err) {
      console.error('Failed to answer callback:', err);
    }

    try {
      const text = `${formatSupportOrderMessage({ ...updatedOrder, items })}\n\nТекущий статус: ${SUPPORT_STATUS_LABEL[newStatus]}`;
      const keyboard = TERMINAL_STATUSES.includes(newStatus)
        ? { attachments: [] }
        : supportStatusKeyboard(orderId);
      await ctx.editMessage({ text, ...keyboard });
    } catch (err) {
      console.error('Failed to edit support message:', err);
    }
  });
}
