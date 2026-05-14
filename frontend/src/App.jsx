import React, { useEffect, useState } from 'react';
import './styles.css';

const API = 'http://localhost:4000';

export default function App() {
  const [prices, setPrices] = useState([]);
  const [account, setAccount] = useState(null);
  const [trades, setTrades] = useState([]);
  const [ai, setAi] = useState([]);
  const [symbol, setSymbol] = useState('EUR/USD');
  const [side, setSide] = useState('BUY');

  async function refresh() {
    const [p, a, t, i] = await Promise.all([
      fetch(`${API}/market/prices`).then(r => r.json()),
      fetch(`${API}/account`).then(r => r.json()),
      fetch(`${API}/account/trades`).then(r => r.json()),
      fetch(`${API}/market/ai-insights`).then(r => r.json())
    ]);
    setPrices(p.data || []); setAccount(a); setTrades(t.data || []); setAi(i.data || []);
  }

  useEffect(() => { refresh(); const timer = setInterval(refresh, 2000); return () => clearInterval(timer); }, []);

  async function openTrade() {
    await fetch(`${API}/trade/open`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ symbol, side, lotSize: 1, leverage: 20 }) });
    refresh();
  }

  async function closeTrade(id) {
    await fetch(`${API}/trade/close`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tradeId: id }) });
    refresh();
  }

  return <div className='terminal'>
    <h1>Broker Simulator Platform</h1>
    <div className='grid'>
      <section><h3>Market Ticks</h3>{prices.map(p => <div key={p.symbol}>{p.symbol} | Bid {p.bid.toFixed(5)} Ask {p.ask.toFixed(5)}</div>)}</section>
      <section><h3>Account</h3>{account && <div>Equity: ${account.equity.toFixed(2)}<br/>Free Margin: ${account.free_margin.toFixed(2)}</div>}</section>
      <section><h3>Order Ticket</h3>
        <select value={symbol} onChange={e => setSymbol(e.target.value)}><option>EUR/USD</option><option>BTC/USD</option></select>
        <select value={side} onChange={e => setSide(e.target.value)}><option>BUY</option><option>SELL</option></select>
        <button onClick={openTrade}>Open Simulated Trade</button>
      </section>
      <section><h3>Open Trades</h3>{trades.filter(t=>t.status==='OPEN').map(t => <div key={t.id}>#{t.id} {t.symbol} {t.side} <button onClick={()=>closeTrade(t.id)}>Close</button></div>)}</section>
      <section><h3>AI Insights</h3>{ai.slice(0,8).map(log => <div key={log.id}>[{log.severity}] {log.message}</div>)}</section>
    </div>
  </div>;
}
