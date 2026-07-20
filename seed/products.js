// Начальный каталог товаров завода «Родная Земля» (РДЗМ).
// image_url оставлены пустыми - заглушка на фронте, потом заменить на реальные фото с rdzm.ru
const rub = (v) => Math.round(v * 100);

export const products = [
  // --- Молоко ---
  { name: 'Молоко 2,5%', description: '', category: 'Молоко', price_kopecks: rub(104), unit: 'шт', weight_label: '900 мл', image_url: '', sort_order: 1 },
  { name: 'Молоко 3,4-4,5%', description: '', category: 'Молоко', price_kopecks: rub(115), unit: 'шт', weight_label: '900 мл', image_url: '', sort_order: 2 },

  // --- Кисломолочные напитки ---
  { name: 'Ацидофилин 2,5%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(86), unit: 'шт', weight_label: '470 г', image_url: '', sort_order: 1 },
  { name: 'Ацидофилин 2,5%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(121), unit: 'шт', weight_label: '900 г', image_url: '', sort_order: 2 },
  { name: 'Кефир 2,5%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(118), unit: 'шт', weight_label: '900 г', image_url: '', sort_order: 3 },
  { name: 'Простокваша Черниговская 4,0%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(87), unit: 'шт', weight_label: '470 г', image_url: '', sort_order: 4 },
  { name: 'Простокваша Черниговская 4,0%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(125), unit: 'шт', weight_label: '900 г', image_url: '', sort_order: 5 },
  { name: 'Ряженка 3,2%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(87), unit: 'шт', weight_label: '470 г', image_url: '', sort_order: 6 },
  { name: 'Ряженка 3,2%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(125), unit: 'шт', weight_label: '900 г', image_url: '', sort_order: 7 },
  { name: 'Снежок 2,5%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(87), unit: 'шт', weight_label: '470 г', image_url: '', sort_order: 8 },
  { name: 'Снежок 2,5%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(125), unit: 'шт', weight_label: '900 г', image_url: '', sort_order: 9 },

  // --- Сметана ---
  { name: 'Сметана 10%', description: '', category: 'Сметана', price_kopecks: rub(96), unit: 'шт', weight_label: '0,3 кг', image_url: '', sort_order: 1 },
  { name: 'Сметана 15%', description: '', category: 'Сметана', price_kopecks: rub(108), unit: 'шт', weight_label: '0,3 кг', image_url: '', sort_order: 2 },
  { name: 'Сметана 20%', description: '', category: 'Сметана', price_kopecks: rub(121), unit: 'шт', weight_label: '0,3 кг', image_url: '', sort_order: 3 },

  // --- Творог ---
  { name: 'Творог 5%', description: '', category: 'Творог', price_kopecks: rub(123), unit: 'шт', weight_label: '200 г', image_url: '', sort_order: 1 },
  { name: 'Творог 5%', description: '', category: 'Творог', price_kopecks: rub(229), unit: 'шт', weight_label: '450 г', image_url: '', sort_order: 2 },

  // --- Йогурты ---
  { name: 'Йогурт Белый 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(85), unit: 'шт', weight_label: '300 г', image_url: '', sort_order: 1 },
  { name: 'Йогурт Банан-Кокос-Ваниль 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(77), unit: 'шт', weight_label: '270 г', image_url: '', sort_order: 2 },
  { name: 'Йогурт Клубника 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(77), unit: 'шт', weight_label: '270 г', image_url: '', sort_order: 3 },
  { name: 'Йогурт Малина-Ежевика 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(77), unit: 'шт', weight_label: '270 г', image_url: '', sort_order: 4 },
  { name: 'Йогурт Папайя-Ананас-Лайм 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(77), unit: 'шт', weight_label: '270 г', image_url: '', sort_order: 5 },
  { name: 'Йогурт Персик-Маракуйя 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(77), unit: 'шт', weight_label: '270 г', image_url: '', sort_order: 6 },
  { name: 'Йогурт Киви 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(71), unit: 'шт', weight_label: '180 г', image_url: '', sort_order: 7 },
  { name: 'Йогурт Манго 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(71), unit: 'шт', weight_label: '180 г', image_url: '', sort_order: 8 },
  { name: 'Йогурт Черника-голубика 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(71), unit: 'шт', weight_label: '180 г', image_url: '', sort_order: 9 },

  // --- Масло ---
  { name: 'Масло сливочное 82,5%', description: '', category: 'Масло', price_kopecks: rub(269), unit: 'шт', weight_label: '180 г', image_url: '', sort_order: 1 },

  // --- Сыры: продаются фиксированными порциями, у каждой порции своя запись ---
  ...cheesePortions('Сыр Родная земля из цельного молока', 1149, [230, 345, 575], 1),
  ...cheesePortions('Сыр Родная земля с пажитником', 1149, [230, 345, 575], 4),
  ...cheesePortions('Сыр Родная земля с прованскими травами', 1149, [230, 345, 575], 7),
  ...cheesePortions('Сыр Родная земля с чесноком', 1149, [230, 345, 575], 10),
  ...cheesePortions('Сыр Родная земля, созревание 3 мес', 1149, [230, 345, 575], 13),
  ...cheesePortions('Сыр Георгиевский', 1199, [240, 360, 600], 16),
  ...cheesePortions('Сыр Сливочный', 899, [180, 270, 450], 19),
  ...cheesePortions('Сыр Сливочный с пажитником', 899, [180, 270, 450], 22),
];

function cheesePortions(name, pricePerKg, portionPrices, sortOrderStart) {
  const weights = ['~200 г', '~300 г', '~500 г'];
  return portionPrices.map((price, i) => ({
    name,
    description: `${pricePerKg.toLocaleString('ru-RU')} ₽/кг`,
    category: 'Сыры',
    price_kopecks: rub(price),
    unit: 'порция',
    weight_label: weights[i],
    image_url: '',
    sort_order: sortOrderStart + i,
  }));
}
