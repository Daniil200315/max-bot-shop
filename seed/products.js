// Начальный каталог товаров завода «Родная Земля» (РДЗМ).
// Фото — реальные превью с rdzm.ru. Там, где для конкретного варианта фасовки/вкуса
// нет отдельного фото, используется ближайшее похожее (см. комментарии ниже).
const rub = (v) => Math.round(v * 100);

const IMG = {
  milk25: 'https://rdzm.ru/upload/resize_cache/iblock/051/268_268_0/z0ygs1jpzaoyqqhr6k7d5gsp9fdwtejk.JPG',
  milk3445: 'https://rdzm.ru/upload/resize_cache/iblock/7f4/268_268_0/u6yg9uoemnpvvl0x2v6cdsok2bev3fdw.jpg',
  kefir: 'https://rdzm.ru/upload/resize_cache/iblock/c22/268_268_0/yqsd6jhf32qqs5jc2zuwywh8356q1cp5.JPG',
  smetana10: 'https://rdzm.ru/upload/resize_cache/iblock/0aa/268_268_0/rw8x02l4u86exkb7tblvnh55c9pg9kbt.JPG',
  smetana15: 'https://rdzm.ru/upload/resize_cache/iblock/546/268_268_0/xp8l5waja373bymq431g6vgz8vzxwi7t.JPG',
  tvorog200: 'https://rdzm.ru/upload/resize_cache/iblock/c47/268_268_0/29u078n3s5qmnmy9m310y9i5c9njgbvv.JPG',
  tvorog450: 'https://rdzm.ru/upload/resize_cache/iblock/bee/268_268_0/0tbcdp7vihxw814k97xasf9m5gpzw0cw.JPG',
  yogWhite: 'https://rdzm.ru/upload/resize_cache/iblock/94d/268_268_0/ej8ab5meuuo832j05d1qiavpy2s85clg.jpg',
  yogBanana: 'https://rdzm.ru/upload/resize_cache/iblock/09b/268_268_0/609hbyvhlm7ntrlc15kaqdz2j4c2y0le.jpg',
  yogStrawberry: 'https://rdzm.ru/upload/resize_cache/iblock/323/268_268_0/sldufbg2kbmn0fwmm2z3u1m9cth3gkj6.jpg',
  yogRaspberry: 'https://rdzm.ru/upload/resize_cache/iblock/320/268_268_0/0nwc71ucedwshxq0da9aj3x6uzq9jukd.jpg',
  yogPapaya: 'https://rdzm.ru/upload/resize_cache/iblock/2ae/268_268_0/no4ry2xz5sagqi4pg3kox26tngmbont4.jpg',
  yogPeach: 'https://rdzm.ru/upload/resize_cache/iblock/a30/268_268_0/s29pagiemu7gsxkodp7ojw3qfz7shzcd.jpg',
  yogBlueberry: 'https://rdzm.ru/upload/resize_cache/iblock/73a/268_268_0/pdsro9kcwll6qmpkb1x93iq6vocdb68x.jpg',
  butter: 'https://rdzm.ru/upload/resize_cache/iblock/b20/268_268_0/zn0a0yiz1ju8ju8cs3oysjrbll2cw5c1.jpg',
  acidophilin: 'https://rdzm.ru/upload/resize_cache/iblock/dd2/268_268_0/9nusiu9wp5548xpzful75cshhsivbdes.JPG',
  prostokvasha: 'https://rdzm.ru/upload/resize_cache/iblock/597/268_268_0/dcbag3glkevwkm6o1j909hr3qa5dnngy.JPG',
  ryazhenka: 'https://rdzm.ru/upload/resize_cache/iblock/392/268_268_0/lsek71blcj7c3c96ai1a4i7ra8smuglw.JPG',
  snezhok900: 'https://rdzm.ru/upload/resize_cache/iblock/17c/268_268_0/c0df97ek2baa91lseu2vwr59sczrgnk3.JPG',
  snezhok470: 'https://rdzm.ru/upload/resize_cache/iblock/7dd/268_268_0/bm12rjcefrrn8jx48yfyq763h9voqitt.JPG',
  cheeseFenugreek: 'https://rdzm.ru/upload/resize_cache/iblock/efe/268_268_0/lolcc8nhoxq8bq63727jzx21d26u5n46.jpg',
  cheeseWholeMilk: 'https://rdzm.ru/upload/resize_cache/iblock/623/268_268_0/i900y50avme1m8r0q6yum3pti7do16p4.jpg',
  cheeseGeorgievsky: 'https://rdzm.ru/upload/resize_cache/iblock/fe6/268_268_0/f2x3ead5717fhz8o109ymgs00wa0npa7.jpg',
  cheeseCreamy: 'https://rdzm.ru/upload/resize_cache/iblock/f4e/268_268_0/c90uiv0y6bvdgqi25nboul28yu09b9da.jpg',
  cheeseCreamyFenugreek: 'https://rdzm.ru/upload/resize_cache/iblock/b8c/268_268_0/lt60pksqfz18ododxnkhq3xe5or32tei.jpg',
};

const DESC = {
  milk25: 'Пастеризованное, ГОСТ, без ЗМЖ — натуральный продукт, отборное молоко, без растительных жиров',
  milk3445: 'Пастеризованное цельное, ГОСТ, без ЗМЖ — натуральный продукт, без растительных жиров',
  kefir: 'Натуральный кефир, ГОСТ, без ЗМЖ',
  acidophilin: 'Кисломолочный напиток, ГОСТ, без ЗМЖ',
  prostokvasha: 'Термостатная, ГОСТ, без ЗМЖ',
  ryazhenka: 'Из топлёного молока, ГОСТ, без ЗМЖ',
  snezhok: 'Сладкий кисломолочный напиток, ГОСТ, без ЗМЖ',
  smetana: 'Термостатная, ГОСТ, без ЗМЖ',
  tvorog: 'Натуральный, ГОСТ, без ЗМЖ',
  yogWhite: 'Натуральный без добавок, термостатный',
  yogFilled: 'С натуральным наполнителем, без ЗМЖ',
  butter: 'Сладкосливочное, ГОСТ, без ЗМЖ',
  cheeseRodnaya: 'Полутвёрдый, из натурального молока собственного производства',
  cheeseGeorgievsky: 'Полутвёрдый, выдержанный',
  cheeseCreamy: 'Полутвёрдый, мягкий сливочный вкус',
};

export const products = [
  // --- Молоко ---
  { name: 'Молоко 2,5%', description: DESC.milk25, category: 'Молоко', price_kopecks: rub(104), unit: 'шт', weight_label: '900 мл', image_url: IMG.milk25, sort_order: 1 },
  { name: 'Молоко 3,4-4,5%', description: DESC.milk3445, category: 'Молоко', price_kopecks: rub(115), unit: 'шт', weight_label: '900 мл', image_url: IMG.milk3445, sort_order: 2 },

  // --- Кисломолочные напитки ---
  { name: 'Ацидофилин 2,5%', description: DESC.acidophilin, category: 'Кисломолочные напитки', price_kopecks: rub(86), unit: 'шт', weight_label: '470 г', image_url: IMG.acidophilin, sort_order: 1 },
  { name: 'Ацидофилин 2,5%', description: DESC.acidophilin, category: 'Кисломолочные напитки', price_kopecks: rub(121), unit: 'шт', weight_label: '900 г', image_url: IMG.acidophilin, sort_order: 2 },
  { name: 'Кефир 2,5%', description: DESC.kefir, category: 'Кисломолочные напитки', price_kopecks: rub(118), unit: 'шт', weight_label: '900 г', image_url: IMG.kefir, sort_order: 3 },
  { name: 'Простокваша Мечниковская 4,0%', description: DESC.prostokvasha, category: 'Кисломолочные напитки', price_kopecks: rub(87), unit: 'шт', weight_label: '470 г', image_url: IMG.prostokvasha, sort_order: 4 },
  { name: 'Простокваша Мечниковская 4,0%', description: DESC.prostokvasha, category: 'Кисломолочные напитки', price_kopecks: rub(125), unit: 'шт', weight_label: '900 г', image_url: IMG.prostokvasha, sort_order: 5 },
  { name: 'Ряженка 3,2%', description: DESC.ryazhenka, category: 'Кисломолочные напитки', price_kopecks: rub(87), unit: 'шт', weight_label: '470 г', image_url: IMG.ryazhenka, sort_order: 6 },
  { name: 'Ряженка 3,2%', description: DESC.ryazhenka, category: 'Кисломолочные напитки', price_kopecks: rub(125), unit: 'шт', weight_label: '900 г', image_url: IMG.ryazhenka, sort_order: 7 },
  { name: 'Снежок 2,5%', description: DESC.snezhok, category: 'Кисломолочные напитки', price_kopecks: rub(87), unit: 'шт', weight_label: '470 г', image_url: IMG.snezhok470, sort_order: 8 },
  { name: 'Снежок 2,5%', description: DESC.snezhok, category: 'Кисломолочные напитки', price_kopecks: rub(125), unit: 'шт', weight_label: '900 г', image_url: IMG.snezhok900, sort_order: 9 },

  // --- Сметана ---
  { name: 'Сметана 10%', description: DESC.smetana, category: 'Сметана', price_kopecks: rub(96), unit: 'шт', weight_label: '0,3 кг', image_url: IMG.smetana10, sort_order: 1 },
  { name: 'Сметана 15%', description: DESC.smetana, category: 'Сметана', price_kopecks: rub(108), unit: 'шт', weight_label: '0,3 кг', image_url: IMG.smetana15, sort_order: 2 },
  { name: 'Сметана 20%', description: DESC.smetana, category: 'Сметана', price_kopecks: rub(121), unit: 'шт', weight_label: '0,3 кг', image_url: IMG.smetana15, sort_order: 3 }, // заглушка: фото Сметаны 15%

  // --- Творог ---
  { name: 'Творог 5%', description: DESC.tvorog, category: 'Творог', price_kopecks: rub(123), unit: 'шт', weight_label: '200 г', image_url: IMG.tvorog200, sort_order: 1 },
  { name: 'Творог 5%', description: DESC.tvorog, category: 'Творог', price_kopecks: rub(229), unit: 'шт', weight_label: '450 г', image_url: IMG.tvorog450, sort_order: 2 },
  { name: 'Творог Деревенский', description: DESC.tvorog, category: 'Творог', price_kopecks: rub(250), unit: 'шт', weight_label: '450 г', image_url: IMG.tvorog450, sort_order: 3 }, // цена уточняется у заказчика

  // --- Йогурты ---
  // Банан-Кокос-Ваниль и Папайя-Ананас-Лайм сняты с продажи (убраны из seed) — see_products.js
  // синхронизация сама пометит их is_active=0 в БД, не потеряв историю заказов
  { name: 'Йогурт Белый 2,5%', description: DESC.yogWhite, category: 'Йогурты', price_kopecks: rub(85), unit: 'шт', weight_label: '300 г', image_url: IMG.yogWhite, sort_order: 1 },
  { name: 'Йогурт Клубника 2,5%', description: DESC.yogFilled, category: 'Йогурты', price_kopecks: rub(77), unit: 'шт', weight_label: '270 г', image_url: IMG.yogStrawberry, sort_order: 3 },
  { name: 'Йогурт Малина-Ежевика 2,5%', description: DESC.yogFilled, category: 'Йогурты', price_kopecks: rub(77), unit: 'шт', weight_label: '270 г', image_url: IMG.yogRaspberry, sort_order: 4 },
  { name: 'Йогурт Персик-Маракуйя 2,5%', description: DESC.yogFilled, category: 'Йогурты', price_kopecks: rub(77), unit: 'шт', weight_label: '270 г', image_url: IMG.yogPeach, sort_order: 6 },
  { name: 'Йогурт Киви 2,5%', description: DESC.yogFilled, category: 'Йогурты', price_kopecks: rub(71), unit: 'шт', weight_label: '180 г', image_url: IMG.yogBlueberry, sort_order: 7 }, // заглушка: фото Черники-голубики
  { name: 'Йогурт Манго 2,5%', description: DESC.yogFilled, category: 'Йогурты', price_kopecks: rub(71), unit: 'шт', weight_label: '180 г', image_url: IMG.yogBlueberry, sort_order: 8 }, // заглушка: фото Черники-голубики
  { name: 'Йогурт Черника-голубика 2,5%', description: DESC.yogFilled, category: 'Йогурты', price_kopecks: rub(71), unit: 'шт', weight_label: '180 г', image_url: IMG.yogBlueberry, sort_order: 9 },

  // --- Масло ---
  { name: 'Масло сливочное 82,5%', description: DESC.butter, category: 'Масло', price_kopecks: rub(269), unit: 'шт', weight_label: '180 г', image_url: IMG.butter, sort_order: 1 },
  { name: 'Масло сливочное 82,5%', description: DESC.butter, category: 'Масло', price_kopecks: rub(550), unit: 'шт', weight_label: '400 г', image_url: IMG.butter, sort_order: 2 }, // цена уточняется у заказчика

  // --- Сыры: продаются фиксированными порциями, у каждой порции своя запись ---
  ...cheesePortions('Сыр Родная земля из цельного молока', DESC.cheeseRodnaya, 1149, [230, 345, 575], 1, IMG.cheeseWholeMilk),
  ...cheesePortions('Сыр Родная земля с пажитником', DESC.cheeseRodnaya, 1149, [230, 345, 575], 4, IMG.cheeseFenugreek),
  ...cheesePortions('Сыр Родная земля с прованскими травами', DESC.cheeseRodnaya, 1149, [230, 345, 575], 7, IMG.cheeseFenugreek), // заглушка: фото сыра с пажитником
  ...cheesePortions('Сыр Родная земля с чесноком', DESC.cheeseRodnaya, 1149, [230, 345, 575], 10, IMG.cheeseFenugreek), // заглушка: фото сыра с пажитником
  ...cheesePortions('Сыр Родная земля, созревание 3 мес', DESC.cheeseRodnaya, 1149, [230, 345, 575], 13, IMG.cheeseWholeMilk),
  ...cheesePortions('Сыр Георгиевский', DESC.cheeseGeorgievsky, 1199, [240, 360, 600], 16, IMG.cheeseGeorgievsky),
  ...cheesePortions('Сыр Сливочный', DESC.cheeseCreamy, 899, [180, 270, 450], 19, IMG.cheeseCreamy),
  ...cheesePortions('Сыр Сливочный с пажитником', DESC.cheeseCreamy, 899, [180, 270, 450], 22, IMG.cheeseCreamyFenugreek),
];

function cheesePortions(name, tasteDescription, pricePerKg, portionPrices, sortOrderStart, imageUrl) {
  const weights = ['~200 г', '~300 г', '~500 г'];
  return portionPrices.map((price, i) => ({
    name,
    description: `${tasteDescription} · ${pricePerKg.toLocaleString('ru-RU')} ₽/кг`,
    category: 'Сыры',
    price_kopecks: rub(price),
    unit: 'порция',
    weight_label: weights[i],
    image_url: imageUrl,
    sort_order: sortOrderStart + i,
  }));
}
