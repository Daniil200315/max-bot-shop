import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import { apiRouter } from './routes/api.js';
import { createPaymentRouter } from './routes/payment.js';
import { createBot, registerBotHandlers } from './bot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');

// Последний рубеж: магазин не должен падать целиком из-за необработанной
// ошибки где-либо (например, в фоновом поллинге бота между апдейтами).
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));
process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));

async function main() {
  await initDb();

  const bot = createBot();
  registerBotHandlers(bot);

  const app = express();
  app.use(express.json());
  app.use(express.static(PUBLIC_DIR));

  app.use('/api/payments', createPaymentRouter(bot));
  app.use('/api', apiRouter);

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server started on :${port}`));

  // Сбой поллинга бота (невалидный токен и т.п.) не должен останавливать API магазина
  try {
    await bot.start();
  } catch (err) {
    console.error('Bot failed to start (API/mini-app продолжают работать):', err.message);
  }
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
