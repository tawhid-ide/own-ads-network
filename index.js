const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ========== ZONE KEYS ==========
const ZONE_KEYS = {
  [process.env.STICKY_KEY]:     'sticky',
  [process.env.SQUARE_KEY]:     'square',
  [process.env.FULLSCREEN_KEY]: 'fullscreen',
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

// ========== FETCH ADS ==========
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

      const admedia = extract(content, 'ADMEDIA'); // image or video URL
      const adlink  = extract(content, 'ADLINK');
      const adzone  = extract(content, 'ADZONE');  // sticky | square | fullscreen
      const adtitle = extract(content, 'ADTITLE') || '';
      const addesc  = extract(content, 'ADDESC')  || '';
      const adcta   = extract(content, 'ADCTA')   || 'Shop Now';
      const adbrand = extract(content, 'ADBRAND') || '';

      // detect if media is video
      const isVideo = admedia && /\.(mp4|webm|ogg)$/i.test(admedia.split('?')[0]);

      if (admedia && adlink && adzone) {
        ads.push({ id, adzone, admedia, adlink, adtitle, addesc, adcta, adbrand, isVideo });
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

// ========== MEDIA HTML ==========
function mediaHtml(ad, styles) {
  if (ad.isVideo) {
    return `<video src="${ad.admedia}" autoplay muted loop playsinline style="${styles}"></video>`;
  }
  return `<img src="${ad.admedia}" style="${styles}" />`;
}

// ========== AD RENDERERS ==========
function renderAd(ad, clickUrl) {

  // ── STICKY ──────────────────────────────────────────────────
  if (ad.adzone === 'sticky') {
    return `
<a href="${clickUrl}" target="_blank" rel="noopener"
   style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;padding:6px 10px;background:#fff;border-top:1px solid #e0e0e0;font-family:system-ui,sans-serif;">
  ${mediaHtml(ad, 'width:60px;height:60px;object-fit:cover;border-radius:6px;flex-shrink:0;')}
  <div style="flex:1;min-width:0;">
    ${ad.adtitle ? `<div style="font-size:13px;font-weight:600;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ad.adtitle}</div>` : ''}
    ${ad.addesc  ? `<div style="font-size:11px;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ad.addesc}</div>` : ''}
  </div>
  <span style="background:#ff9900;color:#fff;font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;white-space:nowrap;flex-shrink:0;">${ad.adcta}</span>
</a>
<div style="display:flex;align-items:center;gap:4px;padding:2px 10px 4px;background:#fff;">
  <span style="font-size:9px;background:#f0f0f0;color:#888;padding:1px 5px;border-radius:3px;letter-spacing:.5px;">AD</span>
  ${ad.adbrand ? `<span style="font-size:10px;color:#aaa;">${ad.adbrand}</span>` : ''}
</div>`;
  }

  // ── SQUARE (300×250) ─────────────────────────────────────────
  if (ad.adzone === 'square') {
    return `
<div style="font-family:system-ui,sans-serif;width:300px;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <a href="${clickUrl}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block;">
    ${mediaHtml(ad, 'width:300px;height:180px;object-fit:cover;display:block;')}
    <div style="padding:10px 12px 12px;">
      ${ad.adtitle ? `<div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">${ad.adtitle}</div>` : ''}
      ${ad.addesc  ? `<div style="font-size:12px;color:#555;margin-bottom:8px;line-height:1.4;">${ad.addesc}</div>` : ''}
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="background:#ff9900;color:#fff;font-size:12px;font-weight:600;padding:6px 16px;border-radius:20px;">${ad.adcta}</span>
        <span style="font-size:9px;background:#f0f0f0;color:#888;padding:2px 5px;border-radius:3px;letter-spacing:.5px;">SPONSORED</span>
      </div>
    </div>
  </a>
</div>`;
  }

  // ── FULLSCREEN ───────────────────────────────────────────────
  if (ad.adzone === 'fullscreen') {
    return `
<div style="font-family:system-ui,sans-serif;position:relative;width:100%;height:100vh;background:#000;overflow:hidden;">
  <a href="${clickUrl}" target="_blank" rel="noopener" style="display:block;width:100%;height:100%;text-decoration:none;color:#fff;">
    ${mediaHtml(ad, 'width:100%;height:100%;object-fit:cover;display:block;opacity:0.85;')}
    <div style="position:absolute;bottom:0;left:0;right:0;padding:24px 20px 40px;background:linear-gradient(transparent,rgba(0,0,0,0.85));">
      ${ad.adtitle ? `<div style="font-size:22px;font-weight:700;margin-bottom:6px;">${ad.adtitle}</div>` : ''}
      ${ad.addesc  ? `<div style="font-size:14px;opacity:0.85;margin-bottom:16px;line-height:1.5;">${ad.addesc}</div>` : ''}
      <span style="display:inline-block;background:#ff9900;color:#fff;font-size:15px;font-weight:600;padding:12px 28px;border-radius:30px;">${ad.adcta}</span>
    </div>
    <div style="position:absolute;top:16px;right:16px;">
      <span style="font-size:10px;background:rgba(255,255,255,0.2);color:#fff;padding:3px 8px;border-radius:4px;letter-spacing:.5px;">SPONSORED</span>
    </div>
  </a>
</div>`;
  }

  return '';
}

// ========== ROUTES ==========

app.get('/', (req, res) => {
  res.json({ status: 'AdsHub Server Running ✅', cached_ads: cache.ads.length });
});

// SDK.JS
app.get('/sdk.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
(function() {
  var BASE = 'https://adshub-server-jzsp.onrender.com';
  function loadAds() {
    var slots = document.querySelectorAll('.adshub[data-key]');
    slots.forEach(function(slot) {
      var key = slot.getAttribute('data-key');
      if (!key || slot.dataset.loaded) return;
      slot.dataset.loaded = 'true';
      fetch(BASE + '/ad?key=' + encodeURIComponent(key))
        .then(function(r) { return r.text(); })
        .then(function(html) {
          if (html.trim()) slot.innerHTML = html;
          else slot.style.display = 'none';
        })
        .catch(function() { slot.style.display = 'none'; });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAds);
  } else {
    loadAds();
  }
})();
`);
});

// GET /ad?key=ZONE_KEY
app.get('/ad', async (req, res) => {
  try {
    const key = req.query.key;
    if (!key || !ZONE_KEYS[key]) return res.status(401).send('');
    const zone = ZONE_KEYS[key];
    const ads = await fetchAds();
    const zoneAds = ads.filter(a => a.adzone === zone);
    if (zoneAds.length === 0) return res.status(404).send('');
    const ad = zoneAds[Math.floor(Math.random() * zoneAds.length)];
    getStats(ad.id).impressions++;
    const clickUrl = `https://adshub-server-jzsp.onrender.com/click?id=${ad.id}&url=${encodeURIComponent(ad.adlink)}`;
    res.setHeader('Content-Type', 'text/html');
    res.send(renderAd(ad, clickUrl));
  } catch (err) {
    res.status(500).send('');
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
    id: ad.id, zone: ad.adzone, title: ad.adtitle,
    media_type: ad.isVideo ? 'video' : 'image',
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
    
