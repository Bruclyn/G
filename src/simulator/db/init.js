const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../../sql/broker_simulator.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

async function initDb() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS balances (
    user_id INTEGER PRIMARY KEY,
    equity REAL NOT NULL DEFAULT 10000,
    free_margin REAL NOT NULL DEFAULT 10000,
    used_margin REAL NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL,
    lot_size REAL NOT NULL,
    leverage INTEGER NOT NULL,
    open_price REAL NOT NULL,
    close_price REAL,
    margin_used REAL NOT NULL,
    pnl REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'OPEN',
    opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS market_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    bid REAL NOT NULL,
    ask REAL NOT NULL,
    mid REAL NOT NULL,
    volatility REAL NOT NULL,
    trend REAL NOT NULL,
    news_impact REAL NOT NULL DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS ai_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`INSERT OR IGNORE INTO users (id, name, email) VALUES (1, 'Demo Trader', 'demo@sim.local')`);
  await run(`INSERT OR IGNORE INTO balances (user_id, equity, free_margin, used_margin) VALUES (1, 10000, 10000, 0)`);
}

module.exports = { db, run, initDb };
