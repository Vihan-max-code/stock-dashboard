/* =======================================================================
   SHARED DATA + LIVE PRICE LOADING
   Used by every page (index.html, explore.html, calculators.html).
   The status element ID differs slightly per page, so we look for
   "liveStatus" and just skip that part if it isn't on the page.
======================================================================= */
 
const STOCKS = [
  { ticker:"AAPL", name:"Apple", sector:"Technology", industry:"Consumer Hardware", marketCap:4631, color:"#2DD4BF",
    blurb:"iPhone-era compounding continued into the AI decade. Services revenue and a relentless buyback program turned steady unit growth into one of the market's most reliable long-run compounders.",
    prices:{2015:23.69,2016:26.65,2017:39.56,2018:37.43,2019:70.72,2020:128.93,2021:173.60,2022:127.76,2023:190.38,2024:248.83,2025:271.36,2026:315.32}},
  { ticker:"MSFT", name:"Microsoft", sector:"Technology", industry:"Software", marketCap:2861, color:"#5EEAD4",
    blurb:"The cloud pivot paid off. Azure and the shift to subscriptions reset Microsoft's growth trajectory for most of the decade, though 2026 has brought a pullback from AI-capex worries.",
    prices:{2015:48.36,2016:55.66,2017:78.32,2018:94.61,2019:149.07,2020:212.48,2021:323.98,2022:233.18,2023:368.87,2024:416.56,2025:481.48,2026:385.10}},
  { ticker:"NVDA", name:"NVIDIA", sector:"Technology", industry:"Semiconductors", marketCap:5105, color:"#14B8A6",
    blurb:"The decade's standout. GPU demand for AI training and inference turned a $0.80 stock into one worth well over $200 — with two separate 50%+ drawdowns along the way.",
    prices:{2015:0.80,2016:2.63,2017:4.78,2018:3.31,2019:5.85,2020:13.00,2021:29.32,2022:14.58,2023:49.43,2024:134.09,2025:186.27,2026:203.53}},
  { ticker:"GOOGL", name:"Alphabet", sector:"Technology", industry:"Internet Services", marketCap:4328, color:"#7DD3FC",
    blurb:"Search dominance funded a long cloud and AI build-out. A rough 2022 gave way to a sharp AI-driven rebound in 2025.",
    prices:{2015:38.56,2016:39.27,2017:52.21,2018:51.79,2019:66.38,2020:86.86,2021:143.58,2022:87.45,2023:138.46,2024:188.32,2025:312.59,2026:357.18}},
  { ticker:"AMZN", name:"Amazon", sector:"Retail", industry:"Internet Commerce", marketCap:2639, color:"#FB923C",
    blurb:"E-commerce scale plus AWS's high-margin cloud business. A brutal 2022 was followed by a sharp recovery as profitability came back into focus.",
    prices:{2015:33.79,2016:37.49,2017:58.47,2018:75.10,2019:92.39,2020:162.85,2021:166.72,2022:84.00,2023:151.94,2024:219.39,2025:230.82,2026:245.34}},
  { ticker:"META", name:"Meta Platforms", sector:"Technology", industry:"Internet Software", marketCap:1693, color:"#A78BFA",
    blurb:"From 'metaverse' skepticism in 2022 (down 64%) to an efficiency-and-AI-driven rebound that nearly tripled the stock in 2023 alone.",
    prices:{2015:103.75,2016:114.05,2017:174.92,2018:129.95,2019:203.46,2020:270.78,2021:333.42,2022:119.29,2023:350.88,2024:582.63,2025:658.92,2026:669.21}},
  { ticker:"JPM", name:"JPMorgan Chase", sector:"Finance", industry:"Investment Banking", marketCap:886, color:"#D4A857",
    blurb:"Steady compounding through a full rate cycle. Higher-for-longer interest rates after 2022 boosted net interest income.",
    prices:{2015:49.68,2016:66.83,2017:84.72,2018:79.11,2019:116.49,2020:110.04,2021:140.57,2022:122.80,2023:160.41,2024:231.46,2025:317.71,2026:335.47}},
  { ticker:"UNH", name:"UnitedHealth Group", sector:"Healthcare", industry:"Managed Care", marketCap:386, color:"#F472B6",
    blurb:"A decade-long run of steady growth was interrupted hard in 2025 — a 33% single-year decline tied to rising medical costs and margin pressure.",
    prices:{2015:98.89,2016:136.87,2017:191.40,2018:219.20,2019:263.04,2020:318.94,2021:463.11,2022:495.23,2023:499.14,2024:487.11,2025:325.70,2026:424.62}},
  { ticker:"XOM", name:"ExxonMobil", sector:"Energy", industry:"Oil & Gas Integrated", marketCap:568, color:"#E4693C",
    blurb:"Energy's boom-bust cycle on full display: a weak 2015–2020 stretch followed by an 87% surge in 2022 as energy prices spiked.",
    prices:{2015:49.62,2016:59.48,2017:57.22,2018:48.58,2019:52.10,2020:33.23,2021:52.37,2022:98.16,2023:92.02,2024:102.38,2025:118.74,2026:137.09}},
  { ticker:"TSLA", name:"Tesla", sector:"Automotive", industry:"EV Manufacturing", marketCap:1527, color:"#EF4444",
    blurb:"The most volatile name in this set — a 743% single-year gain in 2020 and a 65% single-year loss in 2022.",
    prices:{2015:16.00,2016:14.25,2017:20.76,2018:22.19,2019:27.89,2020:235.22,2021:352.26,2022:123.18,2023:248.48,2024:403.84,2025:449.72,2026:407.76}},
  { ticker:"KO", name:"Coca-Cola", sector:"Consumer Staples", industry:"Beverages", marketCap:356, color:"#FDE68A",
    blurb:"The steadiest name in the group. No single year with a loss greater than 4.4%, plus a long dividend history.",
    prices:{2015:30.96,2016:30.85,2017:35.29,2018:37.68,2019:45.44,2020:46.56,2021:51.85,2022:57.36,2023:54.81,2024:59.68,2025:68.99,2026:83.49}},
  { ticker:"WMT", name:"Walmart", sector:"Retail", industry:"Supermarket Chains", marketCap:893, color:"#94A3B8",
    blurb:"Quiet compounding through grocery execution and e-commerce, with a sharp acceleration in 2023–2024 as omnichannel investments paid off.",
    prices:{2015:16.96,2016:19.68,2017:28.85,2018:27.86,2019:36.26,2020:44.72,2021:45.60,2022:45.39,2023:51.23,2024:89.14,2025:110.97,2026:113.90}},
  { ticker:"V", name:"Visa", sector:"Finance", industry:"Payments", marketCap:626, color:"#22D3EE",
    blurb:"Payments infrastructure with a toll-booth business model — steady double-digit growth through the decade as global card spending compounded, with barely a down year.",
    prices:{2015:72.00,2016:72.99,2017:107.42,2018:125.13,2019:179.35,2020:210.06,2021:209.40,2022:202.27,2023:255.48,2024:312.51,2025:349.26,2026:357.75}},
  { ticker:"BAC", name:"Bank of America", sector:"Finance", industry:"Banking", marketCap:423, color:"#0EA5E9",
    blurb:"The most volatile of the big banks in this set. A brutal 2022, then two straight years of 28%+ gains as rate cuts and a strong consumer lifted the stock to new highs.",
    prices:{2015:13.37,2016:17.83,2017:24.20,2018:20.57,2019:30.07,2020:26.57,2021:39.76,2022:30.28,2023:31.75,2024:42.49,2025:54.41,2026:59.50}},
  { ticker:"LLY", name:"Eli Lilly", sector:"Healthcare", industry:"Pharmaceuticals", marketCap:1119, color:"#C084FC",
    blurb:"GLP-1 weight-loss and diabetes drugs turned Eli Lilly into one of the most valuable healthcare companies in the world — three consecutive years of 33%+ gains from 2023 to 2025.",
    prices:{2015:70.75,2016:63.41,2017:74.72,2018:104.95,2019:121.89,2020:159.71,2021:265.23,2022:356.05,2023:572.91,2024:763.69,2025:1071.05,2026:1181.87}},
  { ticker:"PFE", name:"Pfizer", sector:"Healthcare", industry:"Pharmaceuticals", marketCap:138, color:"#E879F9",
    blurb:"The COVID-vaccine windfall came and went. After peaking near $48 in 2021, the stock has spent four years searching for a bottom — a reminder that a blockbuster product doesn't guarantee lasting gains.",
    prices:{2015:19.25,2016:20.10,2017:23.30,2018:29.09,2019:27.08,2020:27.91,2021:46.52,2022:41.68,2023:24.48,2024:23.94,2025:24.09,2026:24.48}},
  { ticker:"PG", name:"Procter & Gamble", sector:"Consumer Staples", industry:"Household Products", marketCap:342, color:"#FDBA74",
    blurb:"The definition of boring-and-steady. Modest moves most years, funded by a portfolio of everyday household brands rather than any single hit product.",
    prices:{2015:59.43,2016:65.00,2017:73.25,2018:75.86,2019:105.98,2020:120.98,2021:145.81,2022:138.45,2023:137.26,2024:160.94,2025:141.24,2026:148.37}},
  { ticker:"HD", name:"Home Depot", sector:"Consumer Discretionary", industry:"Home Improvement Retail", marketCap:342, color:"#FB7185",
    blurb:"Home-improvement demand surged during the pandemic (+59% in 2021) then cooled hard as high mortgage rates froze the housing market — down in three of the last four years.",
    prices:{2015:102.75,2016:106.39,2017:153.87,2018:142.64,2019:186.23,2020:231.86,2021:369.83,2022:288.56,2023:325.40,2024:374.20,2025:339.27,2026:337.11}},
  { ticker:"MCD", name:"McDonald's", sector:"Consumer Discretionary", industry:"Restaurants", marketCap:195, color:"#FBBF24",
    blurb:"A steady compounder for most of the decade, though 2026 has brought the first real wobble in years as value-conscious consumers pull back on discretionary spending.",
    prices:{2015:91.47,2016:97.15,2017:140.92,2018:149.06,2019:169.89,2020:189.08,2021:241.62,2022:242.85,2023:279.42,2024:279.82,2025:301.89,2026:272.61}},
  { ticker:"DIS", name:"Disney", sector:"Communication Services", industry:"Media & Entertainment", marketCap:167, color:"#818CF8",
    blurb:"A round-trip story: streaming-era optimism drove the stock to an all-time high in 2021, then a brutal 44% drop in 2022 as streaming losses mounted. Still hasn't reclaimed those highs.",
    prices:{2015:96.12,2016:96.77,2017:101.37,2018:105.03,2019:140.23,2020:175.67,2021:150.18,2022:84.24,2023:87.83,2024:109.30,2025:112.91,2026:95.87}},
  { ticker:"CAT", name:"Caterpillar", sector:"Industrials", industry:"Construction & Mining Equipment", marketCap:429, color:"#EAB308",
    blurb:"Long dismissed as an old-economy industrial, Caterpillar has ripped higher since 2023 on data-center and infrastructure construction demand — up over 60% in both 2025 and 2026 so far.",
    prices:{2015:52.96,2016:75.26,2017:131.72,2018:108.59,2019:129.78,2020:164.78,2021:191.07,2022:226.61,2023:285.42,2024:355.79,2025:570.45,2026:933.34}},
  { ticker:"NEE", name:"NextEra Energy", sector:"Utilities", industry:"Electric Power", marketCap:183, color:"#4ADE80",
    blurb:"A clean-energy utility that compounded quietly for most of the decade before a rough 2023 (-25%) tied to rate pressure on its renewable-development unit, followed by a steady recovery.",
    prices:{2015:19.83,2016:23.48,2017:31.56,2018:36.07,2019:51.47,2020:66.94,2021:82.60,2022:75.55,2023:56.44,2024:68.55,2025:79.16,2026:88.38}},
  { ticker:"LIN", name:"Linde", sector:"Materials", industry:"Industrial Gases", marketCap:245, color:"#67E8F9",
    blurb:"An unglamorous industrial-gas supplier to hospitals, chip fabs, and now AI data centers — a low-volatility compounder that rarely makes headlines but rarely disappoints either.",
    prices:{2015:85.33,2016:100.28,2017:135.52,2018:139.60,2019:194.10,2020:244.33,2021:325.91,2022:311.60,2023:397.77,2024:410.43,2025:423.62,2026:524.06}},
  { ticker:"AMT", name:"American Tower", sector:"Real Estate", industry:"Cell Tower REIT", marketCap:84, color:"#C4B5FD",
    blurb:"A cell-tower REIT that rode the 2010s wireless build-out to a 2021 peak, then struggled with higher interest rates, since REITs are especially rate-sensitive — still well below its all-time high five years later.",
    prices:{2015:74.39,2016:82.74,2017:113.95,2018:129.13,2019:190.95,2020:190.06,2021:252.56,2022:187.73,2023:197.85,2024:173.78,2025:172.19,2026:168.59}},
  { ticker:"AVGO", name:"Broadcom", sector:"Technology", industry:"Semiconductors", marketCap:1903, color:"#F97316",
    blurb:"From a mid-cap chipmaker to a nearly $2 trillion AI infrastructure supplier — three straight years of triple-digit or near-triple-digit gains from 2023 to 2025 before cooling off in 2026.",
    prices:{2015:11.21,2016:13.86,2017:20.54,2018:20.99,2019:27.09,2020:39.24,2021:61.41,2022:53.26,2023:108.75,2024:228.90,2025:344.80,2026:384.05}},
  { ticker:"NFLX", name:"Netflix", sector:"Communication Services", industry:"Streaming", marketCap:310, color:"#E11D48",
    blurb:"The original streaming disruptor. A 51% crash in 2022 as subscriber growth stalled, then two years of strong recovery fueled by an ad-supported tier and a password-sharing crackdown — before cooling again in 2026.",
    prices:{2015:11.44,2016:12.38,2017:19.20,2018:26.77,2019:32.36,2020:54.07,2021:60.24,2022:29.49,2023:48.69,2024:89.13,2025:93.76,2026:74.35}},
  { ticker:"AMD", name:"AMD", sector:"Technology", industry:"Semiconductors", marketCap:863, color:"#34D399",
    blurb:"NVIDIA's chief rival in AI chips. A 295% year in 2016 kicked off a decade-long transformation from a struggling chipmaker to a serious data-center contender — with a monster 2026 surge as AI demand broadened.",
    prices:{2015:2.87,2016:11.34,2017:10.28,2018:18.46,2019:45.86,2020:91.71,2021:143.90,2022:64.77,2023:147.41,2024:120.79,2025:214.16,2026:500.94}},
  { ticker:"COST", name:"Costco", sector:"Retail", industry:"Warehouse Clubs", marketCap:420, color:"#D946EF",
    blurb:"Membership-model retail at its best. Steady compounding through almost any environment — even 2022's broad sell-off only dented it 19% before a quick recovery.",
    prices:{2015:135.51,2016:135.89,2017:166.29,2018:183.91,2019:267.96,2020:355.50,2021:539.72,2022:436.91,2023:651.01,2024:908.95,2025:859.92,2026:940.87}},
  { ticker:"CRM", name:"Salesforce", sector:"Technology", industry:"Cloud Software", marketCap:134, color:"#60A5FA",
    blurb:"The cloud CRM pioneer. A brutal 48% drop in 2022 was followed by a near-doubling in 2023 as profitability became the focus — but AI spending fears have weighed heavily in 2025–2026.",
    prices:{2015:77.72,2016:67.87,2017:101.34,2018:135.78,2019:161.23,2020:220.60,2021:251.92,2022:131.44,2023:260.85,2024:333.28,2025:260.00,2026:170.00}},
  { ticker:"BRK.B", name:"Berkshire Hathaway", sector:"Finance", industry:"Conglomerate", marketCap:1100, color:"#A3E635",
    blurb:"Warren Buffett's conglomerate — insurance, railroads, energy, and a massive stock portfolio. The steadiest compounder in this set alongside KO, with only one down year (2015) in the entire decade.",
    prices:{2015:132.04,2016:162.98,2017:198.22,2018:204.18,2019:226.50,2020:231.87,2021:299.00,2022:308.90,2023:356.66,2024:453.28,2025:502.65,2026:495.00}},
];
const YEARS = [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026];
 
function annualReturns(prices){ const out=[]; for(let y=2016;y<=2025;y++){ const p=prices[y-1], c=prices[y]; if(p!=null&&c!=null) out.push((c-p)/p*100); } return out; }
function cagr(prices,y0,y1){ const yrs=y1-y0; return (Math.pow(prices[y1]/prices[y0],1/yrs)-1)*100; }
function stdev(arr){ const m=arr.reduce((a,b)=>a+b,0)/arr.length; const v=arr.reduce((a,b)=>a+(b-m)**2,0)/(arr.length-1); return Math.sqrt(v); }
function fmtPct(n,d=1){ return `${n>0?"+":""}${n.toFixed(d)}%`; }
 
const ENRICHED = STOCKS.map(s => {
  const returns = annualReturns(s.prices);
  return { ...s, cagr10: cagr(s.prices,2015,2025), vol: stdev(returns), returns };
});
 
const SECTOR_GROUPS = Object.values(ENRICHED.reduce((acc,s)=>{
  acc[s.sector] = acc[s.sector] || { sector:s.sector, members:[] };
  acc[s.sector].members.push(s);
  return acc;
},{})).map(g => ({
  sector:g.sector, tickers:g.members.map(m=>m.ticker).join(", "),
  avgCagr: g.members.reduce((a,b)=>a+b.cagr10,0)/g.members.length,
})).sort((a,b)=>b.avgCagr-a.avgCagr);
 
/* ---------------------------------------------------------------------
   LIVE PRICES — fetched from data/prices.json (today's snapshot) and
   data/history.json (running daily log), both updated by
   .github/workflows/update-prices.yml via scripts/update-prices.mjs.
 
   This function is shared across all pages. Each page only has some of
   the elements/functions referenced below, so every call is guarded
   with a existence check — if a page doesn't have "tape", renderTape()
   just gets skipped on that page.
--------------------------------------------------------------------- */
let liveQuotes = {};
let liveMeta = { generatedAt: null };
let liveHistory = []; // [{ date: "YYYY-MM-DD", quotes: { TICKER: {price, changePercent} } }, ...] oldest first
 
async function loadLivePrices() {
  const statusEl = document.getElementById("liveStatus");
  try {
    const res = await fetch("data/prices.json?t=" + Date.now());
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    liveQuotes = json.quotes || {};
    liveMeta.generatedAt = json.generatedAt || null;
 
    let historyNote = "";
    try {
      const histRes = await fetch("data/history.json?t=" + Date.now());
      if (histRes.ok) {
        const parsed = await histRes.json();
        liveHistory = Array.isArray(parsed) ? parsed : [];
        if (liveHistory.length) {
          const span = liveHistory.length === 1
            ? "1 day tracked so far"
            : `${liveHistory.length} trading days tracked since ${liveHistory[0].date}`;
          historyNote = ` · ${span}`;
        }
      }
    } catch {
      liveHistory = [];
    }
 
    if (statusEl) {
      if (Object.keys(liveQuotes).length && liveMeta.generatedAt) {
        const d = new Date(liveMeta.generatedAt);
        statusEl.innerHTML = `<span class="live-dot on"></span><span>Live — prices as of ${d.toLocaleString()}${historyNote}</span>`;
      } else {
        statusEl.innerHTML = `<span class="live-dot off"></span><span>No live data yet — showing the July 2026 snapshot (first automated update runs on the next scheduled job)</span>`;
      }
    }
  } catch (err) {
    if (statusEl) statusEl.innerHTML = `<span class="live-dot off"></span><span>Couldn't load live prices (${err.message}) — showing the July 2026 snapshot</span>`;
  }
 
  if (typeof renderTape === "function" && document.getElementById("tape")) renderTape();
  if (typeof renderMoverBanner === "function" && document.getElementById("moverBanner")) renderMoverBanner();
  if (typeof renderPulse === "function" && document.getElementById("pulseSection")) renderPulse();
  if (typeof renderProfile === "function" && document.getElementById("tickerPills")) renderProfile();
  if (typeof renderWhatIf === "function" && document.getElementById("wiTicker") && document.getElementById("wiTicker").options.length) renderWhatIf();
  if (typeof renderPortfolio === "function" && document.getElementById("pfResult")) renderPortfolio();
  if (typeof renderDCA === "function" && document.getElementById("dcaResult") && document.getElementById("dcaTicker").options.length) renderDCA();
}
