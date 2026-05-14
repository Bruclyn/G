const { run } = require('../db/init');

async function brokerAiStep({ symbol, volatility, newsImpact }) {
  let spread = symbol === 'EUR/USD' ? 0.0002 : 0.001;
  let volatilityAdjustment = 0;
  let severity = 'INFO';
  let message = 'Normal simulated market conditions.';

  if (Math.abs(newsImpact) > 0.01 || volatility > (symbol === 'EUR/USD' ? 0.002 : 0.02)) {
    spread *= 2.2;
    volatilityAdjustment = newsImpact * 0.3;
    severity = 'WARNING';
    message = `${symbol}: Simulated high-volatility event. Wider spread and caution advised.`;
  }

  await run(`INSERT INTO ai_logs (symbol, event_type, message, severity) VALUES (?, 'MARKET_ANALYSIS', ?, ?)`, [symbol, message, severity]);
  return { spread, volatilityAdjustment, warning: message, severity };
}

module.exports = { brokerAiStep };
