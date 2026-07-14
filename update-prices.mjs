#!/usr/bin/env node
/**
 * Fetches current quotes from Alpha Vantage for the 12 tracked tickers and
 * writes them to data/prices.json. Run manually with:
 *
 *   ALPHAVANTAGE_API_KEY=yourkey node scripts/update-prices.mjs
 *
 * In CI, ALPHAVANTAGE_API_KEY comes from a GitHub Actions secret — see
 * .github/workflows/update-prices.yml.
 *
 * Alpha Vantage's free tier is rate-limited (roughly 5 requests/minute,
 * ~25/day). This script fetches 12 tickers with a 13s gap between calls,
 * which comfortably fits inside the per-minute limit and, run once a day,
 * inside the daily limit too. Don't lower the delay or run it repeatedly
 * in a short window without a paid key.
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TICKERS = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "JPM", "UNH", "XOM", "TSLA", "KO", "WMT"];
const API_KEY = process.env.ALPHAVANTAGE_API_KEY;
const DELAY_MS = 13000;

if (!API_KEY) {
  console.error("Missing ALPHAVANTAGE_API_KEY environment variable.");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchQuote(ticker) {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
    ticker
  )}&apikey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  if (json.Note) throw new Error(`Rate limited: ${json.Note}`);
  if (json.Information) throw new Error(`API message: ${json.Information}`);

  const q = json["Global Quote"];
  const priceRaw = q && q["05. price"];
  if (!priceRaw) throw new Error(`No quote data in response: ${JSON.stringify(json).slice(0, 200)}`);

  const price = parseFloat(priceRaw);
  const changePercentRaw = (q["10. change percent"] || "").replace("%", "");
  const changePercent = changePercentRaw ? parseFloat(changePercentRaw) : null;

  if (!Number.isFinite(price)) throw new Error(`Unparseable price: ${priceRaw}`);

  return { price, changePercent: Number.isFinite(changePercent) ? changePercent : null };
}

async function main() {
  const quotes = {};
  const errors = {};

  for (let i = 0; i < TICKERS.length; i++) {
    const ticker = TICKERS[i];
    try {
      quotes[ticker] = await fetchQuote(ticker);
      console.log(`✓ ${ticker}: $${quotes[ticker].price}${quotes[ticker].changePercent != null ? ` (${quotes[ticker].changePercent}%)` : ""}`);
    } catch (err) {
      console.error(`✗ ${ticker}: ${err.message}`);
      errors[ticker] = err.message;
    }
    if (i < TICKERS.length - 1) await sleep(DELAY_MS);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    quotes,
    ...(Object.keys(errors).length ? { errors } : {}),
  };

  const outPath = path.join(__dirname, "..", "data", "prices.json");
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(output, null, 2) + "\n");

  const okCount = Object.keys(quotes).length;
  console.log(`\nWrote data/prices.json — ${okCount}/${TICKERS.length} quotes succeeded.`);

  if (okCount === 0) {
    console.error("No quotes succeeded — failing the run so the workflow shows red.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
