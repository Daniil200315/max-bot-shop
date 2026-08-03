function formatRub(kopecks) {
  return (kopecks / 100).toLocaleString('ru-RU');
}

export function formatSupportOrderMessage(order) {
  const lines = order.items
    .map((i) => `• ${i.product_name} × ${i.quantity} = ${formatRub(i.price_kopecks * i.quantity)} ₽`)
    .join('\n');

  const deliveryLine = order.delivery_fee_kopecks === 0
    ? 'бесплатно'
    : `${formatRub(order.delivery_fee_kopecks)} ₽`;

  const addressLines = [
    `Улица: ${order.street}`,
    `Дом: ${order.house}`,
    order.apartment ? `Квартира: ${order.apartment}` : null,
    order.comment ? `Комментарий: ${order.comment}` : null,
  ].filter(Boolean).join('\n');

  return `📦 Заказ №${order.id}
Дата доставки: ${order.delivery_date}, ${order.delivery_time_slot}

Товары:
${lines}

Сумма товаров: ${formatRub(order.subtotal_kopecks)} ₽
Доставка: ${deliveryLine}
Итого: ${formatRub(order.total_kopecks)} ₽

Клиент: ${order.user_name} (тел: ${order.phone})
Район: ${order.district}
${addressLines}`;
}

export const SUPPORT_STATUS_LABEL = {
  confirmed: '✅ Подтверждён',
  delivering: '🚚 В доставке',
  delivered: '✔️ Доставлен',
  cancelled: '❌ Отменён',
};

export function supportStatusKeyboard(orderId) {
  return {
    attachments: [{
      type: 'inline_keyboard',
      payload: {
        buttons: [
          [{ type: 'callback', text: '✅ Подтверждён', payload: `confirm:${orderId}` }],
          [{ type: 'callback', text: '🚚 В доставке', payload: `delivering:${orderId}` }],
          [{ type: 'callback', text: '✔️ Доставлен', payload: `delivered:${orderId}` }],
          [{ type: 'callback', text: '❌ Отменён', payload: `cancel:${orderId}` }],
        ],
      },
    }],
  };
}

export function clientStatusMessage(status, order) {
  switch (status) {
    case 'paid':
      return `✅ Заказ №${order.id} оплачен! Наш сотрудник свяжется с вами для подтверждения.`;
    case 'confirmed':
      return `✅ Ваш заказ №${order.id} подтверждён! Доставка ${order.delivery_date} в ${order.delivery_time_slot}.`;
    case 'delivering':
      return `🚚 Ваш заказ №${order.id} в пути! Ожидайте доставку.`;
    case 'delivered':
      return `✔️ Ваш заказ №${order.id} доставлен. Спасибо за покупку! 🥛`;
    case 'cancelled':
      return `❌ Ваш заказ №${order.id} отменён. Средства будут возвращены на карту.`;
    default:
      return `Статус заказа №${order.id} изменён: ${status}`;
  }
}
