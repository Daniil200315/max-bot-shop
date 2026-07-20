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
  tvorog: 'https://rdzm.ru/upload/resize_cache/iblock/73c/268_268_0/zohup2arffa7fjdsu0cb3aw1nwsw8h88.png',
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

export const products = [
  // --- Молоко ---
  { name: 'Молоко 2,5%', description: '', category: 'Молоко', price_kopecks: rub(104), unit: 'шт', weight_label: '900 мл', image_url: IMG.milk25, sort_order: 1 },
  { name: 'Молоко 3,4-4,5%', description: '', category: 'Молоко', price_kopecks: rub(115), unit: 'шт', weight_label: '900 мл', image_url: IMG.milk3445, sort_order: 2 },

  // --- Кисломолочные напитки ---
  { name: 'Ацидофилин 2,5%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(86), unit: 'шт', weight_label: '470 г', image_url: IMG.acidophilin, sort_order: 1 },
  { name: 'Ацидофилин 2,5%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(121), unit: 'шт', weight_label: '900 г', image_url: IMG.acidophilin, sort_order: 2 },
  { name: 'Кефир 2,5%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(118), unit: 'шт', weight_label: '900 г', image_url: IMG.kefir, sort_order: 3 },
  { name: 'Простокваша Мечниковская 4,0%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(87), unit: 'шт', weight_label: '470 г', image_url: IMG.prostokvasha, sort_order: 4 },
  { name: 'Простокваша Мечниковская 4,0%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(125), unit: 'шт', weight_label: '900 г', image_url: IMG.prostokvasha, sort_order: 5 },
  { name: 'Ряженка 3,2%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(87), unit: 'шт', weight_label: '470 г', image_url: IMG.ryazhenka, sort_order: 6 },
  { name: 'Ряженка 3,2%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(125), unit: 'шт', weight_label: '900 г', image_url: IMG.ryazhenka, sort_order: 7 },
  { name: 'Снежок 2,5%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(87), unit: 'шт', weight_label: '470 г', image_url: IMG.snezhok470, sort_order: 8 },
  { name: 'Снежок 2,5%', description: '', category: 'Кисломолочные напитки', price_kopecks: rub(125), unit: 'шт', weight_label: '900 г', image_url: IMG.snezhok900, sort_order: 9 },

  // --- Сметана ---
  { name: 'Сметана 10%', description: '', category: 'Сметана', price_kopecks: rub(96), unit: 'шт', weight_label: '0,3 кг', image_url: IMG.smetana10, sort_order: 1 },
  { name: 'Сметана 15%', description: '', category: 'Сметана', price_kopecks: rub(108), unit: 'шт', weight_label: '0,3 кг', image_url: IMG.smetana15, sort_order: 2 },
  { name: 'Сметана 20%', description: '', category: 'Сметана', price_kopecks: rub(121), unit: 'шт', weight_label: '0,3 кг', image_url: IMG.smetana15, sort_order: 3 }, // заглушка: фото Сметаны 15%

  // --- Творог ---
  { name: 'Творог 5%', description: '', category: 'Творог', price_kopecks: rub(123), unit: 'шт', weight_label: '200 г', image_url: IMG.tvorog, sort_order: 1 },
  { name: 'Творог 5%', description: '', category: 'Творог', price_kopecks: rub(229), unit: 'шт', weight_label: '450 г', image_url: IMG.tvorog, sort_order: 2 },

  // --- Йогурты ---
  { name: 'Йогурт Белый 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(85), unit: 'шт', weight_label: '300 г', image_url: IMG.yogWhite, sort_order: 1 },
  { name: 'Йогурт Банан-Кокос-Ваниль 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(77), unit: 'шт', weight_label: '270 г', image_url: IMG.yogBanana, sort_order: 2 },
  { name: 'Йогурт Клубника 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(77), unit: 'шт', weight_label: '270 г', image_url: IMG.yogStrawberry, sort_order: 3 },
  { name: 'Йогурт Малина-Ежевика 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(77), unit: 'шт', weight_label: '270 г', image_url: IMG.yogRaspberry, sort_order: 4 },
  { name: 'Йогурт Папайя-Ананас-Лайм 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(77), unit: 'шт', weight_label: '270 г', image_url: IMG.yogPapaya, sort_order: 5 },
  { name: 'Йогурт Персик-Маракуйя 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(77), unit: 'шт', weight_label: '270 г', image_url: IMG.yogPeach, sort_order: 6 },
  { name: 'Йогурт Киви 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(71), unit: 'шт', weight_label: '180 г', image_url: IMG.yogBlueberry, sort_order: 7 }, // заглушка: фото Черники-голубики
  { name: 'Йогурт Манго 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(71), unit: 'шт', weight_label: '180 г', image_url: IMG.yogBlueberry, sort_order: 8 }, // заглушка: фото Черники-голубики
  { name: 'Йогурт Черника-голубика 2,5%', description: '', category: 'Йогурты', price_kopecks: rub(71), unit: 'шт', weight_label: '180 г', image_url: IMG.yogBlueberry, sort_order: 9 },

  // --- Масло ---
  { name: 'Масло сливочное 82,5%', description: '', category: 'Масло', price_kopecks: rub(269), unit: 'шт', weight_label: '180 г', image_url: IMG.butter, sort_order: 1 },

  // --- Сыры: продаются фиксированными порциями, у каждой порции своя запись ---
  ...cheesePortions('Сыр Родная земля из цельного молока', 1149, [230, 345, 575], 1, IMG.cheeseWholeMilk),
  ...cheesePortions('Сыр Родная земля с пажитником', 1149, [230, 345, 575], 4, IMG.cheeseFenugreek),
  ...cheesePortions('Сыр Родная земля с прованскими травами', 1149, [230, 345, 575], 7, IMG.cheeseFenugreek), // заглушка: фото сыра с пажитником
  ...cheesePortions('Сыр Родная земля с чесноком', 1149, [230, 345, 575], 10, IMG.cheeseFenugreek), // заглушка: фото сыра с пажитником
  ...cheesePortions('Сыр Родная земля, созревание 3 мес', 1149, [230, 345, 575], 13, IMG.cheeseWholeMilk),
  ...cheesePortions('Сыр Георгиевский', 1199, [240, 360, 600], 16, IMG.cheeseGeorgievsky),
  ...cheesePortions('Сыр Сливочный', 899, [180, 270, 450], 19, IMG.cheeseCreamy),
  ...cheesePortions('Сыр Сливочный с пажитником', 899, [180, 270, 450], 22, IMG.cheeseCreamyFenugreek),
];

function cheesePortions(name, pricePerKg, portionPrices, sortOrderStart, imageUrl) {
  const weights = ['~200 г', '~300 г', '~500 г'];
  return portionPrices.map((price, i) => ({
    name,
    description: `${pricePerKg.toLocaleString('ru-RU')} ₽/кг`,
    category: 'Сыры',
    price_kopecks: rub(price),
    unit: 'порция',
    weight_label: weights[i],
    image_url: imageUrl,
    sort_order: sortOrderStart + i,
  }));
}