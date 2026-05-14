const router = require('express').Router();
const { getLatestPrices } = require('../engines/marketSimulation');
const { db } = require('../db/init');

router.get('/prices', async (_, res) => res.json({ data: await getLatestPrices() }));
router.get('/ai-insights', (_, res) => {
  db.all(`SELECT * FROM ai_logs ORDER BY id DESC LIMIT 20`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: rows });
  });
});

module.exports = router;
