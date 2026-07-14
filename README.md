# A Decade on Wall Street — live edition

A static dashboard covering 12 major US companies over 2015–2026, with current
prices refreshed automatically once a day by a GitHub Actions job. No server
to run or pay for — GitHub hosts both the automation and the page for free.

## How it works

- `index.html` — the dashboard itself. Plain HTML/CSS/JS, no build step.
- `data/prices.json` — the live price data. Starts empty; gets overwritten
  by the automation below.
- `scripts/update-prices.mjs` — a Node script that calls the Alpha Vantage
  API for all 12 tickers and writes the result into `data/prices.json`.
- `.github/workflows/update-prices.yml` — a GitHub Actions workflow that
  runs the script on a schedule (weekdays, shortly after the US market
  opens) and commits the updated file back to the repo.

Because `index.html` fetches `data/prices.json` at page load, every visit
picks up whatever the most recent scheduled run wrote — that's the whole
"automatic" part. If the fetch fails for any reason, the page quietly falls
back to the static July 2026 snapshot baked into `index.html`, so it never
breaks.

## Setup (about 10 minutes)

1. **Get a free Alpha Vantage API key** (skip if you already have one):
   [alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)

2. **Create a new GitHub repository** and push these files into it.
   ```bash
   cd stock-dashboard-live
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

3. **Add your API key as a repo secret** (this keeps it out of your code):
   - On GitHub: your repo → **Settings** → **Secrets and variables** →
     **Actions** → **New repository secret**
   - Name: `ALPHAVANTAGE_API_KEY`
   - Value: your key from step 1

4. **Enable GitHub Pages:**
   - Your repo → **Settings** → **Pages**
   - Source: **Deploy from a branch** → Branch: `main` → `/ (root)`
   - Save. Your dashboard will be live at
     `https://YOUR-USERNAME.github.io/YOUR-REPO/` within a minute or two.

5. **Trigger the first update manually** (don't wait for the schedule):
   - Your repo → **Actions** tab → **Update stock prices** workflow →
     **Run workflow** → **Run workflow**
   - It takes ~3 minutes (12 tickers, spaced out to respect Alpha
     Vantage's rate limit). Once it finishes, refresh the live page.

After that, it runs itself — weekdays, shortly after US market open.

## Adjusting the schedule

The cron line lives in `.github/workflows/update-prices.yml`:
```yaml
- cron: "35 13 * * 1-5"
```
That's UTC, weekdays only. `13:35 UTC` sits a few minutes after the US
market opens (9:30am ET) — but because US and Australian daylight saving
don't switch on the same dates, the Sydney-local landing time drifts by
about an hour across the year (roughly 11:30pm–12:35am). If you want a
fixed Sydney clock time instead, or a run at market *close* rather than
open, tell me the target and I'll adjust the cron expression.

You can also trigger it manually anytime from the **Actions** tab, but
keep it to once or twice a day — Alpha Vantage's free key is capped at a
small number of requests per day, and one run already uses 12 of them.

## Limitations worth knowing

- **This is daily, not real-time.** The price you see is whatever the
  last scheduled run captured — could be up to ~24 hours stale, more over
  a weekend.
- **Free-tier rate limits are real.** If you see gaps in `data/prices.json`
  under `"errors"`, it's usually the daily cap being hit — check the
  Actions log for that run.
- **The decade analysis itself stays static.** CAGR, the growth chart, and
  the screener rankings are fixed to the 2015–2025 historical dataset on
  purpose — only "current price" and the ticker tape move.
