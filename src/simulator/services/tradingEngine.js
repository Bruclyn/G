const { db, run } = require('../db/init');
const { getLatestPrices } = require('../engines/marketSimulation');

async function getPrice(symbol, side) {
  const prices = await getLatestPrices();
  const row = prices.find(p => p.symbol === symbol);
  if (!row) throw new Error(`No simulated price for ${symbol}`);
  return side === 'BUY' ? row.ask : row.bid;
}

async function openTrade({ userId = 1, symbol, side, lotSize, leverage }) {
  const openPrice = await getPrice(symbol, side);
  const notional = openPrice * lotSize;
  const marginUsed = notional / leverage;
  await run(`UPDATE balances SET used_margin = used_margin + ?, free_margin = free_margin - ? WHERE user_id = ?`, [marginUsed, marginUsed, userId]);
  const result = await run(`INSERT INTO trades (user_id, symbol, side, lot_size, leverage, open_price, margin_used) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, symbol, side, lotSize, leverage, openPrice, marginUsed]);
  return { tradeId: result.lastID, openPrice, marginUsed };
}

async function closeTrade({ userId = 1, tradeId }) {
  const trade = await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM trades WHERE id = ? AND user_id = ? AND status = 'OPEN'`, [tradeId, userId], (err, row) => err ? reject(err) : resolve(row));
  });
  if (!trade) throw new Error('Trade not found or already closed');

  const closeSide = trade.side === 'BUY' ? 'SELL' : 'BUY';
  const closePrice = await getPrice(trade.symbol, closeSide);
  const direction = trade.side === 'BUY' ? 1 : -1;
  const pnl = (closePrice - trade.open_price) * trade.lot_size * direction * trade.leverage;

  await run(`UPDATE trades SET close_price = ?, pnl = ?, status = 'CLOSED', closed_at = CURRENT_TIMESTAMP WHERE id = ?`, [closePrice, pnl, tradeId]);
  await run(`UPDATE balances SET equity = equity + ?, free_margin = free_margin + ?, used_margin = used_margin - ? WHERE user_id = ?`, [pnl, trade.margin_used, trade.margin_used, userId]);
  return { tradeId, closePrice, pnl };
}

module.exports = { openTrade, closeTrade };
