// Разовый скрипт: скачивает оригиналы фото товаров с rdzm.ru и сжимает их до
// разумного размера для десктопа (ширина ~800px, качество 82) через sharp.
// Не часть рантайма приложения — держим отдельно от seed/products.js, чтобы не
// тащить sharp в прод-образ. Запуск: node scripts/fetch-product-images.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'img', 'products');
fs.mkdirSync(OUT_DIR, { recursive: true });

const IMAGES = {
  'milk25.jpg': 'https://rdzm.ru/upload/iblock/051/z0ygs1jpzaoyqqhr6k7d5gsp9fdwtejk.JPG',
  'milk3445.jpg': 'https://rdzm.ru/upload/iblock/7f4/u6yg9uoemnpvvl0x2v6cdsok2bev3fdw.jpg',
  'kefir.jpg': 'https://rdzm.ru/upload/iblock/c22/yqsd6jhf32qqs5jc2zuwywh8356q1cp5.JPG',
  'smetana10.jpg': 'https://rdzm.ru/upload/iblock/0aa/rw8x02l4u86exkb7tblvnh55c9pg9kbt.JPG',
  'smetana15.jpg': 'https://rdzm.ru/upload/iblock/546/xp8l5waja373bymq431g6vgz8vzxwi7t.JPG',
  'smetana20.jpg': 'https://rdzm.ru/upload/iblock/90f/gpj4hld8vcmckr1wgtpp1onj07p20bny.JPG',
  'tvorog200.jpg': 'https://rdzm.ru/upload/iblock/c47/29u078n3s5qmnmy9m310y9i5c9njgbvv.JPG',
  'tvorog450.jpg': 'https://rdzm.ru/upload/iblock/bee/0tbcdp7vihxw814k97xasf9m5gpzw0cw.JPG',
  'yog-white.jpg': 'https://rdzm.ru/upload/iblock/94d/ej8ab5meuuo832j05d1qiavpy2s85clg.jpg',
  'yog-banana.jpg': 'https://rdzm.ru/upload/iblock/09b/609hbyvhlm7ntrlc15kaqdz2j4c2y0le.jpg',
  'yog-strawberry.jpg': 'https://rdzm.ru/upload/iblock/323/sldufbg2kbmn0fwmm2z3u1m9cth3gkj6.jpg',
  'yog-raspberry.jpg': 'https://rdzm.ru/upload/iblock/320/0nwc71ucedwshxq0da9aj3x6uzq9jukd.jpg',
  'yog-papaya.jpg': 'https://rdzm.ru/upload/iblock/2ae/no4ry2xz5sagqi4pg3kox26tngmbont4.jpg',
  'yog-peach.jpg': 'https://rdzm.ru/upload/iblock/a30/s29pagiemu7gsxkodp7ojw3qfz7shzcd.jpg',
  'yog-blueberry.jpg': 'https://rdzm.ru/upload/iblock/92f/cfk2wuhmwx21xphpnwalpymoe848m7oy.jpg',
  'yog-kiwi.jpg': 'https://rdzm.ru/upload/iblock/47e/v9tb1g33f28lt6r1025nbe9k47itccbx.jpg',
  'yog-mango.jpg': 'https://rdzm.ru/upload/iblock/6e9/hu34kvgy27cr91yg3wbyuadqihryc7au.jpg',
  'butter180.jpg': 'https://rdzm.ru/upload/iblock/b20/zn0a0yiz1ju8ju8cs3oysjrbll2cw5c1.jpg',
  'butter400.jpg': 'https://rdzm.ru/upload/iblock/42c/e2i12vtv03s9yrmfo2t7wo1r5nzj9ogy.jpg',
  'acidophilin.jpg': 'https://rdzm.ru/upload/iblock/dd2/9nusiu9wp5548xpzful75cshhsivbdes.JPG',
  'prostokvasha.jpg': 'https://rdzm.ru/upload/iblock/597/dcbag3glkevwkm6o1j909hr3qa5dnngy.JPG',
  'ryazhenka.jpg': 'https://rdzm.ru/upload/iblock/392/lsek71blcj7c3c96ai1a4i7ra8smuglw.JPG',
  'snezhok900.jpg': 'https://rdzm.ru/upload/iblock/17c/c0df97ek2baa91lseu2vwr59sczrgnk3.JPG',
  'snezhok470.jpg': 'https://rdzm.ru/upload/iblock/7dd/bm12rjcefrrn8jx48yfyq763h9voqitt.JPG',
  'cheese-plain.jpg': 'https://rdzm.ru/upload/iblock/e19/7uxrc20lainwuydqttx0vem4lslvnhxr.jpg',
  'cheese-classic.jpg': 'https://rdzm.ru/upload/iblock/108/s2bcj2240ueam2j9k1pyiresmeaogowb.jpg',
  'cheese-creamy.jpg': 'https://rdzm.ru/upload/iblock/04d/bezl3q1nt918r75w3zxh12iiqq4n9ihp.jpg',
  'cheese-creamy-fenugreek.jpg': 'https://rdzm.ru/upload/iblock/dcd/338liwlb4p6bww9u7994mnu8o44pn2x3.jpg',
  'cheese-fenugreek.jpg': 'https://rdzm.ru/upload/iblock/962/a6hf4cme2znepxkxq0bfkxqp2d46w0it.jpg',
  'cheese-garlic.jpg': 'https://rdzm.ru/upload/iblock/6af/gw8yxpu72cjyebp3zddszarb1ba09cje.jpg',
  'cheese-provence.jpg': 'https://rdzm.ru/upload/iblock/678/pcj423924smxnbpkuctmnixq5w81f00n.jpg',
  'cheese-georgievsky.jpg': 'https://rdzm.ru/upload/iblock/44c/bj423pzkphg94qgyks4mfq3q02j8zvjb.jpg',
  'cheese-halloumi.jpg': 'https://rdzm.ru/upload/iblock/b5f/bw541ozvgtpk03gfoyac9qg1z0inya9e.jpg',
  'cheese-halloumi-provence.jpg': 'https://rdzm.ru/upload/iblock/b82/94wrblddbay4lqscj23nxpm8kjsrzx45.jpg',
  'cheese-belper-knolle.jpg': 'https://rdzm.ru/upload/iblock/279/t7ziwfjfopvsxpp63ki66uet5czm36kp.jpg',
};

async function fetchAndProcess(filename, url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; rdzm-shop-bot image sync)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  const outPath = path.join(OUT_DIR, filename);
  await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toFile(outPath);

  const { size } = fs.statSync(outPath);
  return size;
}

let totalBytes = 0;
let failed = [];
for (const [filename, url] of Object.entries(IMAGES)) {
  try {
    const size = await fetchAndProcess(filename, url);
    totalBytes += size;
    console.log(`OK  ${filename}  ${(size / 1024).toFixed(0)} KB`);
  } catch (err) {
    failed.push({ filename, url, error: err.message });
    console.error(`FAIL ${filename}  ${err.message}`);
  }
}

console.log(`\nTotal: ${Object.keys(IMAGES).length - failed.length}/${Object.keys(IMAGES).length} images, ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
if (failed.length) {
  console.log('Failed:', JSON.stringify(failed, null, 2));
  process.exitCode = 1;
}
