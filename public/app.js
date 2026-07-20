// Держим эти константы синхронизированными вручную с lib/pricing.js на бэкенде —
// сервер является источником истины при создании заказа, тут только для мгновенного UI.
const MIN_ORDER_KOPECKS = 50000;
const FREE_DELIVERY_THRESHOLD_KOPECKS = 75000;
const DELIVERY_FEE_KOPECKS = 14900;

const SLOT_DEFS = [
  { start: 8, end: 10 },
  { start: 10, end: 12 },
  { start: 12, end: 14 },
  { start: 14, end: 16 },
  { start: 16, end: 18 },
  { start: 18, end: 20 },
];

const CATEGORY_ICON = {
  'Молоко': '🥛',
  'Кисломолочные напитки': '🧃',
  'Сметана': '🥣',
  'Творог': '🍮',
  'Йогурты': '🍦',
  'Масло': '🧈',
  'Сыры': '🧀',
};

const STATUS_LABEL = {
  created: 'Создан',
  paid: 'Оплачен',
  confirmed: 'Подтверждён',
  delivering: 'В доставке',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const BACK_MAP = {
  cart: 'catalog',
  checkout: 'cart',
  history: 'catalog',
  'order-detail': 'history',
};

const state = {
  user: { id: null, name: '' },
  catalog: [],
  activeCategory: null,
  cart: new Map(), // product_id -> { product, quantity }
  checkout: { dateISO: '', dateLabel: '', selectedSlot: null },
  currentScreen: 'catalog',
  pendingModalGroup: null,
};

const el = {
  historyBtn: document.getElementById('historyBtn'),
  categoryTabs: document.getElementById('categoryTabs'),
  productList: document.getElementById('productList'),
  cartFab: document.getElementById('cartFab'),
  cartFabCount: document.getElementById('cartFabCount'),
  cartFabSum: document.getElementById('cartFabSum'),
  cartItems: document.getElementById('cartItems'),
  cartEmpty: document.getElementById('cartEmpty'),
  cartSummary: document.getElementById('cartSummary'),
  sumSubtotal: document.getElementById('sumSubtotal'),
  sumDelivery: document.getElementById('sumDelivery'),
  sumTotal: document.getElementById('sumTotal'),
  minOrderWarning: document.getElementById('minOrderWarning'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  checkoutForm: document.getElementById('checkoutForm'),
  phoneInput: document.getElementById('phoneInput'),
  addressInput: document.getElementById('addressInput'),
  deliveryDateLabel: document.getElementById('deliveryDateLabel'),
  slotOptions: document.getElementById('slotOptions'),
  privacyCheck: document.getElementById('privacyCheck'),
  payBtn: document.getElementById('payBtn'),
  successOrderInfo: document.getElementById('successOrderInfo'),
  backToCatalogBtn: document.getElementById('backToCatalogBtn'),
  historyList: document.getElementById('historyList'),
  historyEmpty: document.getElementById('historyEmpty'),
  orderDetailContent: document.getElementById('orderDetailContent'),
  portionModal: document.getElementById('portionModal'),
  portionModalTitle: document.getElementById('portionModalTitle'),
  portionOptions: document.getElementById('portionOptions'),
  toast: document.getElementById('toast'),
};

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function formatRub(kopecks) {
  return (kopecks / 100).toLocaleString('ru-RU');
}

function pad(n) {
  return String(n).padStart(2, '0');
}

let toastTimer = null;
function toast(message) {
  el.toast.textContent = message;
  el.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.toast.hidden = true; }, 2600);
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Ошибка сервера');
  }
  return data;
}

// --- Пользователь MAX (см. dev.max.ru/docs/webapps/bridge) ---
function resolveUser() {
  const params = new URLSearchParams(location.search);

  if (window.WebApp) {
    console.log('[MAX WebApp] initData:', window.WebApp.initData);
    console.log('[MAX WebApp] initDataUnsafe:', window.WebApp.initDataUnsafe);
    const u = window.WebApp.initDataUnsafe?.user;
    if (u?.id) {
      return {
        id: u.id,
        name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || '',
      };
    }
  } else {
    console.log('[dev] window.WebApp недоступен (открыто вне MAX). query params:', Object.fromEntries(params));
  }

  const idParam = params.get('user_id');
  if (idParam) {
    return { id: Number(idParam), name: params.get('user_name') || 'Гость' };
  }

  return { id: Date.now(), name: 'Гость' };
}

// --- Навигация между экранами ---
function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('is-active'));
  document.getElementById(`screen-${name}`).classList.add('is-active');
  state.currentScreen = name;
  el.cartFab.hidden = name !== 'catalog' || getCartTotalQuantity() === 0;

  if (window.WebApp?.BackButton) {
    if (name === 'catalog' || name === 'success') {
      window.WebApp.BackButton.hide();
    } else {
      window.WebApp.BackButton.show();
    }
  }
}

function goBack(from) {
  const target = BACK_MAP[from];
  if (target) showScreen(target);
}

document.querySelectorAll('.back-btn').forEach((btn) => {
  btn.addEventListener('click', () => showScreen(btn.dataset.back));
});

if (window.WebApp?.BackButton) {
  window.WebApp.BackButton.onClick(() => goBack(state.currentScreen));
}

// --- Каталог ---
function groupByName(products) {
  const map = new Map();
  for (const p of products) {
    if (!map.has(p.name)) map.set(p.name, []);
    map.get(p.name).push(p);
  }
  return [...map.values()];
}

function renderCategoryTabs() {
  el.categoryTabs.innerHTML = state.catalog.map((c) => `
    <button class="tab${c.category === state.activeCategory ? ' is-active' : ''}" data-category="${escapeHtml(c.category)}">
      ${escapeHtml(c.category)}
    </button>
  `).join('');
}

function photoMarkup(product) {
  if (product.image_url) {
    return `<img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}" loading="lazy" />`;
  }
  return CATEGORY_ICON[product.category] || '🥛';
}

function cartQuantityFor(productId) {
  return state.cart.get(productId)?.quantity || 0;
}

function renderProductCard(product) {
  const qty = cartQuantityFor(product.id);
  const action = qty > 0
    ? `<div class="stepper">
         <button data-decr="${product.id}" aria-label="Убрать">−</button>
         <span>${qty}</span>
         <button data-incr="${product.id}" aria-label="Добавить">+</button>
       </div>`
    : `<button class="add-btn" data-add="${product.id}" aria-label="Добавить">+</button>`;

  return `
    <div class="product-card">
      <div class="product-photo">${photoMarkup(product)}</div>
      <div class="product-info">
        <div class="product-name">${escapeHtml(product.name)}</div>
        <div class="product-meta">${escapeHtml(product.weight_label)}</div>
        <div class="product-price">${formatRub(product.price_kopecks)} ₽</div>
      </div>
      <div class="product-action">${action}</div>
    </div>
  `;
}

function renderVariantCard(group) {
  const totalQty = group.reduce((sum, p) => sum + cartQuantityFor(p.id), 0);
  const minPrice = Math.min(...group.map((p) => p.price_kopecks));
  const first = group[0];

  return `
    <div class="product-card">
      <div class="product-photo">${photoMarkup(first)}</div>
      <div class="product-info">
        <div class="product-name">${escapeHtml(first.name)}</div>
        <div class="product-meta">${escapeHtml(first.description)}</div>
        <div class="product-price">от ${formatRub(minPrice)} ₽</div>
        ${totalQty > 0 ? `<div class="cart-count-hint">В корзине: ${totalQty} порц.</div>` : ''}
      </div>
      <div class="product-action">
        <button class="choose-btn" data-choose="${escapeHtml(first.name)}">Выбрать</button>
      </div>
    </div>
  `;
}

function renderProducts() {
  const bucket = state.catalog.find((c) => c.category === state.activeCategory);
  const products = bucket ? bucket.products : [];
  const groups = groupByName(products);
  el.productList.innerHTML = groups
    .map((g) => (g.length > 1 ? renderVariantCard(g) : renderProductCard(g[0])))
    .join('');
}

function selectCategory(category) {
  state.activeCategory = category;
  renderCategoryTabs();
  renderProducts();
}

el.categoryTabs.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-category]');
  if (btn) selectCategory(btn.dataset.category);
});

el.productList.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  const incr = e.target.closest('[data-incr]');
  const decr = e.target.closest('[data-decr]');
  const choose = e.target.closest('[data-choose]');

  if (add) { addToCart(Number(add.dataset.add), 1); renderProducts(); renderCartFab(); }
  if (incr) { addToCart(Number(incr.dataset.incr), 1); renderProducts(); renderCartFab(); }
  if (decr) { removeFromCart(Number(decr.dataset.decr), 1); renderProducts(); renderCartFab(); }
  if (choose) openPortionModal(choose.dataset.choose);
});

// --- Модалка выбора порции сыра ---
function openPortionModal(groupName) {
  const bucket = state.catalog.find((c) => c.category === state.activeCategory);
  const variants = (bucket?.products || []).filter((p) => p.name === groupName);
  state.pendingModalGroup = variants;

  el.portionModalTitle.textContent = groupName;
  el.portionOptions.innerHTML = variants.map((v) => `
    <div class="portion-option" data-variant="${v.id}">
      <span>${escapeHtml(v.weight_label)}</span>
      <span class="portion-option-price">${formatRub(v.price_kopecks)} ₽</span>
    </div>
  `).join('');

  el.portionModal.hidden = false;
}

function closePortionModal() {
  el.portionModal.hidden = true;
  state.pendingModalGroup = null;
}

el.portionModal.addEventListener('click', (e) => {
  if (e.target.closest('[data-close-modal]')) closePortionModal();
  const option = e.target.closest('[data-variant]');
  if (option) {
    const variant = state.pendingModalGroup.find((v) => v.id === Number(option.dataset.variant));
    if (variant) {
      addToCart(variant.id, 1, variant);
      renderProducts();
      renderCartFab();
      toast(`Добавлено: ${variant.name} ${variant.weight_label}`);
    }
    closePortionModal();
  }
});

// --- Корзина ---
function findProductById(id) {
  for (const bucket of state.catalog) {
    const found = bucket.products.find((p) => p.id === id);
    if (found) return found;
  }
  return null;
}

function addToCart(productId, qty, knownProduct) {
  const product = knownProduct || findProductById(productId);
  if (!product) return;
  const existing = state.cart.get(productId);
  state.cart.set(productId, { product, quantity: (existing?.quantity || 0) + qty });
}

function removeFromCart(productId, qty) {
  const existing = state.cart.get(productId);
  if (!existing) return;
  const nextQty = existing.quantity - qty;
  if (nextQty <= 0) state.cart.delete(productId);
  else state.cart.set(productId, { ...existing, quantity: nextQty });
}

function deleteFromCart(productId) {
  state.cart.delete(productId);
}

function getCartSubtotal() {
  let sum = 0;
  for (const { product, quantity } of state.cart.values()) sum += product.price_kopecks * quantity;
  return sum;
}

function getCartTotalQuantity() {
  let count = 0;
  for (const { quantity } of state.cart.values()) count += quantity;
  return count;
}

function computeDeliveryFee(subtotal) {
  if (subtotal >= FREE_DELIVERY_THRESHOLD_KOPECKS) return 0;
  return DELIVERY_FEE_KOPECKS;
}

function renderCartFab() {
  const qty = getCartTotalQuantity();
  if (qty === 0 || state.currentScreen !== 'catalog') {
    el.cartFab.hidden = true;
    return;
  }
  el.cartFab.hidden = false;
  el.cartFabCount.textContent = qty;
  el.cartFabSum.textContent = `${formatRub(getCartSubtotal())} ₽`;
}

function renderCartItem(entry) {
  const { product, quantity } = entry;
  return `
    <div class="cart-item">
      <div class="product-photo">${photoMarkup(product)}</div>
      <div class="cart-item-info">
        <div class="product-name">${escapeHtml(product.name)}</div>
        <div class="product-meta">${escapeHtml(product.weight_label)} · ${formatRub(product.price_kopecks)} ₽</div>
        <div class="stepper">
          <button data-cart-decr="${product.id}">−</button>
          <span>${quantity}</span>
          <button data-cart-incr="${product.id}">+</button>
        </div>
      </div>
      <button class="remove-btn" data-cart-remove="${product.id}" aria-label="Удалить">✕</button>
    </div>
  `;
}

function renderCart() {
  const entries = [...state.cart.values()];

  if (entries.length === 0) {
    el.cartItems.innerHTML = '';
    el.cartEmpty.hidden = false;
    el.cartSummary.hidden = true;
    el.minOrderWarning.hidden = true;
    el.checkoutBtn.disabled = true;
    return;
  }

  el.cartEmpty.hidden = true;
  el.cartItems.innerHTML = entries.map(renderCartItem).join('');

  const subtotal = getCartSubtotal();
  const deliveryFee = computeDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;
  const belowMinimum = subtotal < MIN_ORDER_KOPECKS;

  el.cartSummary.hidden = false;
  el.sumSubtotal.textContent = `${formatRub(subtotal)} ₽`;
  el.sumDelivery.textContent = deliveryFee === 0 ? 'бесплатно' : `${formatRub(deliveryFee)} ₽`;
  el.sumTotal.textContent = `${formatRub(total)} ₽`;

  el.minOrderWarning.hidden = !belowMinimum;
  el.checkoutBtn.disabled = belowMinimum;
}

el.cartItems.addEventListener('click', (e) => {
  const incr = e.target.closest('[data-cart-incr]');
  const decr = e.target.closest('[data-cart-decr]');
  const remove = e.target.closest('[data-cart-remove]');

  if (incr) addToCart(Number(incr.dataset.cartIncr), 1);
  if (decr) removeFromCart(Number(decr.dataset.cartDecr), 1);
  if (remove) deleteFromCart(Number(remove.dataset.cartRemove));

  if (incr || decr || remove) {
    renderCart();
    renderCartFab();
  }
});

el.cartFab.addEventListener('click', () => { renderCart(); showScreen('cart'); });

el.checkoutBtn.addEventListener('click', () => {
  if (el.checkoutBtn.disabled) return;
  prepareCheckoutScreen();
  showScreen('checkout');
});

// --- Тайм-слоты доставки ---
function resolveDelivery(now = new Date()) {
  const hour = now.getHours();
  let targetDate = new Date(now);
  let available;

  if (hour >= 8 && hour < 19) {
    const cutoff = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    available = SLOT_DEFS.filter((s) => {
      const slotEnd = new Date(targetDate);
      slotEnd.setHours(s.end, 0, 0, 0);
      return slotEnd > cutoff;
    });
    if (available.length === 0) {
      targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + 1);
      available = SLOT_DEFS.slice();
    }
  } else if (hour >= 19) {
    targetDate.setDate(targetDate.getDate() + 1);
    available = SLOT_DEFS.slice();
  } else {
    available = SLOT_DEFS.slice();
  }

  const dateISO = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`;

  const isToday = targetDate.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = targetDate.toDateString() === tomorrow.toDateString();
  const dayMonth = targetDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  const dateLabel = isToday ? `Сегодня, ${dayMonth}` : isTomorrow ? `Завтра, ${dayMonth}` : dayMonth;

  const slots = available.map((s) => ({
    value: `${pad(s.start)}:00-${pad(s.end)}:00`,
    label: `${pad(s.start)}:00–${pad(s.end)}:00`,
  }));

  return { dateISO, dateLabel, slots };
}

function prepareCheckoutScreen() {
  const delivery = resolveDelivery();
  state.checkout.dateISO = delivery.dateISO;
  state.checkout.dateLabel = delivery.dateLabel;
  state.checkout.selectedSlot = delivery.slots[0]?.value || null;

  el.deliveryDateLabel.textContent = delivery.dateLabel;
  el.slotOptions.innerHTML = delivery.slots.map((s) => `
    <button type="button" class="slot-btn${s.value === state.checkout.selectedSlot ? ' is-selected' : ''}" data-slot="${s.value}">
      ${s.label}
    </button>
  `).join('');
}

el.slotOptions.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-slot]');
  if (!btn) return;
  state.checkout.selectedSlot = btn.dataset.slot;
  el.slotOptions.querySelectorAll('.slot-btn').forEach((b) => b.classList.toggle('is-selected', b === btn));
});

// --- Маска телефона ---
el.phoneInput.addEventListener('input', () => {
  let digits = el.phoneInput.value.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith('7')) digits = `7${digits}`;
  digits = digits.slice(0, 11);

  const rest = digits.slice(1);
  let formatted = '+7';
  if (rest.length > 0) formatted += ` (${rest.slice(0, 3)}`;
  if (rest.length >= 3) formatted += ')';
  if (rest.length > 3) formatted += ` ${rest.slice(3, 6)}`;
  if (rest.length > 6) formatted += `-${rest.slice(6, 8)}`;
  if (rest.length > 8) formatted += `-${rest.slice(8, 10)}`;

  el.phoneInput.value = formatted;
});

// --- Оформление заказа и оплата ---
el.checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const phoneDigits = el.phoneInput.value.replace(/\D/g, '');
  if (phoneDigits.length !== 11) {
    toast('Введите корректный номер телефона');
    return;
  }
  if (!el.addressInput.value.trim()) {
    toast('Укажите адрес доставки');
    return;
  }
  if (!state.checkout.selectedSlot) {
    toast('Выберите время доставки');
    return;
  }
  if (!el.privacyCheck.checked) {
    toast('Необходимо согласие на обработку персональных данных');
    return;
  }

  el.payBtn.disabled = true;
  el.payBtn.textContent = 'Оформляем…';

  try {
    const order = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        user_id: state.user.id,
        user_name: state.user.name,
        phone: el.phoneInput.value,
        delivery_address: `г. Новокузнецк, ${el.addressInput.value.trim()}`,
        delivery_date: state.checkout.dateISO,
        delivery_time_slot: state.checkout.selectedSlot,
        items: [...state.cart.values()].map((entry) => ({
          product_id: entry.product.id,
          quantity: entry.quantity,
        })),
      }),
    });

    state.cart.clear();
    renderCartFab();

    const payment = await apiFetch('/payments/create', {
      method: 'POST',
      body: JSON.stringify({ order_id: order.id }),
    });

    if (payment.confirmation_url) {
      if (window.WebApp?.openLink) {
        window.WebApp.openLink(payment.confirmation_url);
      } else {
        window.location.href = payment.confirmation_url;
      }
    } else {
      toast('Не удалось получить ссылку на оплату');
    }
  } catch (err) {
    console.error(err);
    toast(err.message || 'Не удалось оформить заказ');
  } finally {
    el.payBtn.disabled = false;
    el.payBtn.textContent = 'Оплатить';
  }
});

// --- Экран успеха ---
async function showOrderSuccess(orderId) {
  try {
    const order = await apiFetch(`/orders/${orderId}`);
    el.successOrderInfo.innerHTML = `
      Заказ №${order.id} · ${formatRub(order.total_kopecks)} ₽<br />
      <span class="status-badge status-${order.status}">${STATUS_LABEL[order.status] || order.status}</span>
    `;
  } catch (err) {
    el.successOrderInfo.textContent = 'Не удалось загрузить данные заказа';
  }
  showScreen('success');
}

el.backToCatalogBtn.addEventListener('click', () => {
  history.replaceState(null, '', location.pathname);
  showScreen('catalog');
});

// --- История заказов ---
async function openHistory() {
  showScreen('history');
  try {
    const orders = await apiFetch(`/orders?user_id=${state.user.id}`);
    if (orders.length === 0) {
      el.historyList.innerHTML = '';
      el.historyEmpty.hidden = false;
      return;
    }
    el.historyEmpty.hidden = true;
    el.historyList.innerHTML = orders.map((o) => `
      <div class="history-item" data-order="${o.id}">
        <div class="history-item-main">
          <span class="history-item-number">Заказ №${o.id}</span>
          <span class="history-item-date">${escapeHtml(o.delivery_date)}, ${escapeHtml(o.delivery_time_slot)}</span>
          <span class="status-badge status-${o.status}">${STATUS_LABEL[o.status] || o.status}</span>
        </div>
        <span class="history-item-sum">${formatRub(o.total_kopecks)} ₽</span>
      </div>
    `).join('');
  } catch (err) {
    toast('Не удалось загрузить историю заказов');
  }
}

el.historyList.addEventListener('click', (e) => {
  const item = e.target.closest('[data-order]');
  if (item) openOrderDetail(Number(item.dataset.order));
});

async function openOrderDetail(orderId) {
  showScreen('order-detail');
  el.orderDetailContent.innerHTML = 'Загрузка…';
  try {
    const order = await apiFetch(`/orders/${orderId}`);
    const itemsHtml = order.items.map((i) => `
      <div class="order-detail-row">
        <span>${escapeHtml(i.product_name)} × ${i.quantity}</span>
        <span>${formatRub(i.price_kopecks * i.quantity)} ₽</span>
      </div>
    `).join('');

    el.orderDetailContent.innerHTML = `
      <div class="order-detail-block">
        <h4>Статус</h4>
        <span class="status-badge status-${order.status}">${STATUS_LABEL[order.status] || order.status}</span>
      </div>
      <div class="order-detail-block">
        <h4>Товары</h4>
        ${itemsHtml}
      </div>
      <div class="order-detail-block">
        <h4>Доставка</h4>
        <div class="order-detail-row"><span>Дата</span><span>${escapeHtml(order.delivery_date)}</span></div>
        <div class="order-detail-row"><span>Время</span><span>${escapeHtml(order.delivery_time_slot)}</span></div>
        <div class="order-detail-row"><span>Адрес</span><span>${escapeHtml(order.delivery_address)}</span></div>
      </div>
      <div class="order-detail-block">
        <h4>Оплата</h4>
        <div class="order-detail-row"><span>Товары</span><span>${formatRub(order.subtotal_kopecks)} ₽</span></div>
        <div class="order-detail-row"><span>Доставка</span><span>${order.delivery_fee_kopecks === 0 ? 'бесплатно' : formatRub(order.delivery_fee_kopecks) + ' ₽'}</span></div>
        <div class="order-detail-row"><span>Итого</span><span>${formatRub(order.total_kopecks)} ₽</span></div>
      </div>
    `;
  } catch (err) {
    el.orderDetailContent.innerHTML = '<p class="empty-state">Не удалось загрузить заказ</p>';
  }
}

el.historyBtn.addEventListener('click', openHistory);

// --- Инициализация ---
async function init() {
  state.user = resolveUser();

  try {
    const { categories } = await apiFetch('/products');
    state.catalog = categories;
    state.activeCategory = categories[0]?.category || null;
    renderCategoryTabs();
    renderProducts();
  } catch (err) {
    el.productList.innerHTML = '<p class="empty-state">Не удалось загрузить каталог</p>';
  }

  const orderId = new URLSearchParams(location.search).get('order_id');
  if (orderId) {
    showOrderSuccess(orderId);
  } else {
    showScreen('catalog');
  }
}

init();
