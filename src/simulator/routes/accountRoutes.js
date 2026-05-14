const router = require('express').Router();
const { db } = require('../db/init');

router.get('/', (_, res) => {
  db.get(`SELECT * FROM balances WHERE user_id = 1`, [], (err, row) => err ? res.status(500).json({ error: err.message }) : res.json(row));
});

router.get('/trades', (_, res) => {
  db.all(`SELECT * FROM trades ORDER BY id DESC`, [], (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json({ data: rows }));
});

module.exports = router;
