const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ========== CONFIG ==========
const BLOGGER_FEED = 'https://adshub999.blogspot.com/feeds/posts/default?alt=json&max-results=500';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ========== CACHE ==========
let cache = { ads: [], lastFetch: 0 };

// ========== STATS ==========
const stats = {};
function getStats(adId) {
  if (!stats[adId]) stats[adId] = { impressions: 0, clicks: 0 };
  return stats[adId];
}

// ========== FETCH ALL ADS FROM BLOGGER ==========
async function fetchAdsFromBlogger() {
  const now = Date.now();
  if (now - cache.lastFetch < CACHE_TTL && cache.ads.length > 0) {
    return cache.ads; // Cache hit
  }

  console.log('Fetching ads from Blogger...');
  const ads = [];
  let startIndex = 1;
  const batchSize = 500;

  while (true) {
    const url = `https://adshub999.blogspot.com/feeds/posts/default?alt=json&max-results=${batchSize}&start-index=${startIndex}`;
    const res = await fetch(url);
    const data = await res.json();
    const entries = data.feed.entry || [];

    for (const entry of entries) {
      const content = entry.content?.$t || entry.summary?.$t || '';
      const title = entry.title?.$t || 'Ad';
      const id = entry.id?.$t?.split('post-')[1] || Math.random().toString(36).substr(2, 9);

      // Parse fields from post body
      const adimage  = extract(content, 'ADIMAGE');
      const adlink   = extract(content, 'ADLINK');
      const adzone   = extract(content, 'ADZONE') || 'banner';
      const adwidth  = parseInt(extract(content, 'ADWIDTH') || '300');
      const adheight = parseInt(extract(content, 'ADHEIGHT') || '250');

      if (adimage && adlink) {
        ads.push({ id, title, image: adimage, link: adlink, zone: adzone, width: adwidth, height: adheight });
      }
    }

    // If less than batchSize returned, no more pages
    if (entries.length < batchSize) break;
    startIndex += batchSize;
  }

  cache = { ads, lastFetch: Date.now() };
  console.log(`Loaded ${ads.length} ads from Blogger`);
  return ads;
}

function extract(text, key) {
  const match = text.match(new RegExp(key + ':\\s*([^\\n<]+)'));
  return match ? match[1].trim() : null;
}

// ========== ROUTES ==========

app.get('/', (req, res) => {
  res.json({ status: 'AdsHub Server Running ✅', cached_ads: cache.ads.length });
});

// GET /ad?zone=banner&app=myapp
app.get('/ad', async (req, res) => {
  try {
    const zone = req.query.zone || 'banner';
    const ads = await fetchAdsFromBlogger();
    const zoneAds = ads.filter(a => a.zone === zone);

    if (zoneAds.length === 0) {
      return res.status(404).json({ error: 'No ads for this zone' });
    }

    const ad = zoneAds[Math.floor(Math.random() * zoneAds.length)];
    getStats(ad.id).impressions++;

    res.json({
      id: ad.id,
      title: ad.title,
      image: ad.image,
      click_url: `https://adshub-server.onrender.com/click?id=${ad.id}&url=${encodeURIComponent(ad.link)}`,
      width: ad.width,
      height: ad.height
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ads', detail: err.message });
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
  const ads = await fetchAdsFromBlogger();
  const result = ads.map(ad => ({
    id: ad.id,
    title: ad.title,
    zone: ad.zone,
    impressions: getStats(ad.id).impressions,
    clicks: getStats(ad.id).clicks,
    ctr: getStats(ad.id).impressions > 0
      ? ((getStats(ad.id).clicks / getStats(ad.id).impressions) * 100).toFixed(2) + '%'
      : '0%'
  }));
  res.json({ total_ads: ads.length, performance: result });
});

// GET /zones
app.get('/zones', async (req, res) => {
  const ads = await fetchAdsFromBlogger();
  res.json({ zones: [...new Set(ads.map(a => a.zone))] });
});

// Force refresh cache
app.get('/refresh', (req, res) => {
  cache.lastFetch = 0;
  res.json({ message: 'Cache cleared, next request will refetch' });
});

// ========== START ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AdsHub Server running on port ${PORT}`));
