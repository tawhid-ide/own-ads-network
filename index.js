const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ========== ZONE KEYS (Render Environment Variables) ==========
const ZONE_KEYS = {
  [process.env.MAIN_KEY]:   'main',
  [process.env.BANNER_KEY]: 'banner',
  [process.env.POPUP_KEY]:  'popup',
  [process.env.STICKY_KEY]: 'sticky',
  [process.env.VIDEO_KEY]:  'video',
};

// ========== BLOGGER FEED ==========
const BLOGGER_FEED = 'https://adshub999.blogspot.com/feeds/posts/default';
const CACHE_TTL = 5 * 60 * 1000;
let cache = { ads: [], lastFetch: 0 };

// ========== STATS ==========
const stats = {};
function getStats(id) {
  if (!stats[id]) stats[id] = { impressions: 0, clicks: 0 };
  return stats[id];
}

// ========== FETCH ALL ADS FROM BLOGGER ==========
async function fetchAds() {
  if (Date.now() - cache.lastFetch < CACHE_TTL && cache.ads.length > 0) return cache.ads;

  const ads = [];
  let startIndex = 1;

  while (true) {
    const url = `${BLOGGER_FEED}?alt=json&max-results=500&start-index=${startIndex}`;
    const res = await fetch(url);
    const data = await res.json();
    const entries = data.feed.entry || [];

    for (const entry of entries) {
      const content = entry.content?.$t || entry.summary?.$t || '';
      const id = entry.id?.$t?.split('post-')[1] || Math.random().toString(36).substr(2,9);

      const adimage = extract(content, 'ADIMAGE');
      const adlink  = extract(content, 'ADLINK');
      const adzone  = extract(content, 'ADZONE') || 'banner';
      const adtype  = extract(content, 'ADTYPE') || 'display'; // display | native
      const adtitle = extract(content, 'ADTITLE') || 'Sponsored';
      const addesc  = extract(content, 'ADDESC') || '';
      const adcta   = extract(content, 'ADCTA') || 'Shop Now';
      const adbrand = extract(content, 'ADBRAND') || '';
      const adwidth  = parseInt(extract(content, 'ADWIDTH') || '300');
      const adheight = parseInt(extract(content, 'ADHEIGHT') || '250');

      if (adimage && adlink) {
        ads.push({ id, adzone, adtype, adimage, adlink, adtitle, addesc, adcta, adbrand, adwidth, adheight });
      }
    }

    if (entries.length < 500) break;
    startIndex += 500;
  }

  cache = { ads, lastFetch: Date.now() };
  console.log(`Loaded ${ads.length} ads`);
  return ads;
}

function extract(text, key) {
  const match = text.match(new RegExp(key + ':\\s*([^\\n<]+)'));
  return match ? match[1].trim() : null;
}

// ========== AD HTML RENDERER ==========
function renderAd(ad, clickUrl) {
  if (ad.adtype === 'native') {
    return `
<div style="font-family:system-ui,sans-serif;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;max-width:${ad.adwidth}px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
  <a href="${clickUrl}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:12px;padding:12px;">
    <img src="${ad.adimage}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;flex-shrink:0;" />
    <div style="flex:1;min-width:0;">
      <div style="font-size:13px;font-weight:600;color:#1a1a1a;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ad.adtitle}</div>
      ${ad.addesc ? `<div style="font-size:12px;color:#555;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${ad.addesc}</div>` : ''}
      <span style="display:inline-block;background:#ff9900;color:#fff;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;">${ad.adcta}</span>
    </div>
  </a>
  <div style="padding:4px 12px 6px;display:flex;align-items:center;gap:4px;">
    <span style="font-size:9px;background:#f0f0f0;color:#888;padding:2px 5px;border-radius:3px;letter-spacing:.5px;">AD</span>
    ${ad.adbrand ? `<span style="font-size:10px;color:#999;">${ad.adbrand}</span>` : ''}
  </div>
</div>`;
  }

  // Display Ad
  return `
<div style="font-family:system-ui,sans-serif;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;max-width:${ad.adwidth}px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
  <a href="${clickUrl}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block;">
    <img src="${ad.adimage}" style="width:100%;height:${ad.adheight}px;object-fit:cover;display:block;" />
    <div style="padding:12px 14px;">
      <div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:5px;">${ad.adtitle}</div>
      ${ad.addesc ? `<div style="font-size:13px;color:#555;margin-bottom:10px;line-height:1.4;">${ad.addesc}</div>` : ''}
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="display:inline-block;background:#ff9900;color:#fff;font-size:13px;font-weight:600;padding:7px 18px;border-radius:25px;">${ad.adcta}</span>
        <span style="font-size:9px;background:#f0f0f0;color:#888;padding:2px 6px;border-radius:3px;letter-spacing:.5px;">SPONSORED</span>
      </div>
    </div>
  </a>
</div>`;
}

// ========== ROUTES ==========

app.get('/', (req, res) => {
  res.json({ status: 'AdsHub Server Running ✅', cached_ads: cache.ads.length });
});

// GET /ad?key=YOUR_ZONE_KEY&app=myapp&format=html|json
app.get('/ad', async (req, res) => {
  try {
    const key = req.query.key;
    const format = req.query.format || 'html';

    if (!key || !ZONE_KEYS[key]) {
      return res.status(401).json({ error: 'Invalid or missing key' });
    }

    const zone = ZONE_KEYS[key];
    const ads = await fetchAds();
    const zoneAds = ads.filter(a => a.adzone === zone);

    if (zoneAds.length === 0) return res.status(404).json({ error: 'No ads for this zone' });

    const ad = zoneAds[Math.floor(Math.random() * zoneAds.length)];
    getStats(ad.id).impressions++;

    const clickUrl = `https://adshub-server.onrender.com/click?id=${ad.id}&url=${encodeURIComponent(ad.adlink)}`;

    if (format === 'json') {
      return res.json({ id: ad.id, image: ad.adimage, title: ad.adtitle, desc: ad.addesc, cta: ad.adcta, click_url: clickUrl, width: ad.adwidth, height: ad.adheight });
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(renderAd(ad, clickUrl));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /click?id=xx&url=https://...
app.get('/click', (req, res) => {
  const { id, url } = req.query;
  if (id) getStats(id).clicks++;
  if (url) res.redirect(decodeURIComponent(url));
  else res.status(400).json({ error: 'No URL' });
});

// GET /stats
app.get('/stats', async (req, res) => {
  const ads = await fetchAds();
  const result = ads.map(ad => ({
    id: ad.id, title: ad.adtitle, zone: ad.adzone, type: ad.adtype,
    impressions: getStats(ad.id).impressions,
    clicks: getStats(ad.id).clicks,
    ctr: getStats(ad.id).impressions > 0
      ? ((getStats(ad.id).clicks / getStats(ad.id).impressions) * 100).toFixed(2) + '%' : '0%'
  }));
  res.json({ total_ads: ads.length, performance: result });
});

// Force cache refresh
app.get('/refresh', (req, res) => {
  cache.lastFetch = 0;
  res.json({ message: 'Cache cleared ✅' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AdsHub running on port ${PORT}`));
