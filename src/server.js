const express = require('express');
const cors = require('cors');
const { initDb } = require('./simulator/db/init');
const { startMarketSimulation } = require('./simulator/engines/marketSimulation');
const marketRoutes = require('./simulator/routes/marketRoutes');
const tradeRoutes = require('./simulator/routes/tradeRoutes');
const accountRoutes = require('./simulator/routes/accountRoutes');

const app = express();
app.use(cors());
app.use(express.json());

initDb();
startMarketSimulation();

app.get('/health', (_, res) => res.json({ status: 'ok', mode: 'SIMULATED_ONLY' }));
app.use('/market', marketRoutes);
app.use('/trade', tradeRoutes);
app.use('/account', accountRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Broker Simulator API listening on ${PORT}`);
});
