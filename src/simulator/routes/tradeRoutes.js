const router = require('express').Router();
const { openTrade, closeTrade } = require('../services/tradingEngine');
const { db } = require('../db/init');

router.post('/open', async (req, res) => {
  try { res.json(await openTrade(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

router.post('/close', async (req, res) => {
  try { res.json(await closeTrade(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

router.get('/all', (_, res) => {
  db.all(`SELECT * FROM trades ORDER BY id DESC`, [], (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json({ data: rows }));
});

module.exports = router;
