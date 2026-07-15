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

import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TICKERS = [
  "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "JPM", "UNH", "XOM", "TSLA", "KO", "WMT",
  "V", "BAC", "LLY", "PFE", "PG", "HD", "MCD", "DIS", "CAT", "NEE", "LIN", "AMT", "AVGO",
];
const API_KEY = process.env.ALPHAVANTAGE_API_KEY;
const DELAY_MS = 13000;
const MAX_HISTORY_DAYS = 400; // ~18 months of weekdays — plenty for sparklines/streaks, keeps the file small

if (!API_KEY) {
  console.error("Missing ALPHAVANTAGE_API_KEY environment variable.");
  process.exit(1);
}

// NOTE: at 25 tickers, one full run uses the entire free-tier daily quota
// (~25 requests/day) and takes ~5 minutes (25 requests x 13s spacing).
// There's no headroom left for a same-day manual re-run — if this run
// fails partway, wait until tomorrow's quota resets rather than retrying.

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

async function readJsonSafe(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
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

  const generatedAt = new Date().toISOString();
  const today = generatedAt.slice(0, 10); // YYYY-MM-DD, UTC

  const output = {
    generatedAt,
    quotes,
    ...(Object.keys(errors).length ? { errors } : {}),
  };

  const dataDir = path.join(__dirname, "..", "data");
  await mkdir(dataDir, { recursive: true });

  // Today's snapshot — same as before, unchanged behavior for anything reading prices.json.
  const pricesPath = path.join(dataDir, "prices.json");
  await writeFile(pricesPath, JSON.stringify(output, null, 2) + "\n");

  // Running history — this is the new part. One entry per day, keyed by date.
  // Re-running on the same day replaces that day's entry rather than duplicating it.
  const historyPath = path.join(dataDir, "history.json");
  const history = await readJsonSafe(historyPath, []);
  const withoutToday = history.filter((entry) => entry.date !== today);
  const updatedHistory = [...withoutToday, { date: today, quotes }]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-MAX_HISTORY_DAYS);
  await writeFile(historyPath, JSON.stringify(updatedHistory, null, 2) + "\n");

  const okCount = Object.keys(quotes).length;
  console.log(`\nWrote data/prices.json — ${okCount}/${TICKERS.length} quotes succeeded.`);
  console.log(`Wrote data/history.json — ${updatedHistory.length} day(s) of history tracked.`);

  if (okCount === 0) {
    console.error("No quotes succeeded — failing the run so the workflow shows red.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
