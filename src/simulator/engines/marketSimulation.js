const { db, run } = require('../db/init');
const { brokerAiStep } = require('../services/brokerAI');

const state = {
  'EUR/USD': { mid: 1.085, vol: 0.0012, trend: 0.00005 },
  'BTC/USD': { mid: 62000, vol: 0.012, trend: 0.0009 }
};

function randomNormal() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
function maybeNewsImpact() { return Math.random() < 0.06 ? (Math.random() - 0.5) * 0.04 : 0; }

async function saveTick(symbol, s, newsImpact, spread) {
  const bid = s.mid * (1 - spread / 2);
  const ask = s.mid * (1 + spread / 2);
  await run(`INSERT INTO market_data (symbol, bid, ask, mid, volatility, trend, news_impact) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [symbol, bid, ask, s.mid, s.vol, s.trend, newsImpact]);
}

function startMarketSimulation() {
  setInterval(async () => {
    for (const [symbol, s] of Object.entries(state)) {
      const newsImpact = maybeNewsImpact();
      const ai = await brokerAiStep({ symbol, volatility: s.vol, newsImpact });
      const shock = randomNormal() * s.vol + s.trend + newsImpact + ai.volatilityAdjustment;
      s.mid = Math.max(0.0001, s.mid * (1 + shock));
      s.vol = Math.max(0.0002, s.vol * (1 + (Math.random() - 0.5) * 0.06));
      s.trend = s.trend * 0.9 + (Math.random() - 0.5) * 0.0001;
      await saveTick(symbol, s, newsImpact, ai.spread);
    }
  }, 1500);
}

function getLatestPrices() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT m.* FROM market_data m INNER JOIN (
        SELECT symbol, MAX(id) AS max_id FROM market_data GROUP BY symbol
      ) latest ON latest.max_id = m.id`,
      [],
      (err, rows) => err ? reject(err) : resolve(rows)
    );
  });
}

module.exports = { startMarketSimulation, getLatestPrices };
