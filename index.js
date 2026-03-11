const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ========== AD DATABASE ==========
// Blogger-এ যে ads upload করবে সেগুলো এখানে add করবে
const ads = [
  {
    id: "ad001",
    title: "Product 1",
    image: "https://adshub999.blogspot.com/IMAGE_URL_1", // Blogger image URL
    link: "https://amazon.com/dp/PRODUCT_ID?tag=tawhidinsan-20",
    width: 300,
    height: 250,
    zone: "banner", // banner / square / leaderboard
    active: true,
    impressions: 0,
    clicks: 0
  },
  {
    id: "ad002",
    title: "Product 2",
    image: "https://adshub999.blogspot.com/IMAGE_URL_2",
    link: "https://amazon.com/dp/PRODUCT_ID2?tag=tawhidinsan-20",
    width: 728,
    height: 90,
    zone: "leaderboard",
    active: true,
    impressions: 0,
    clicks: 0
  }
];

// ========== STATS (in-memory, resets on restart) ==========
// Production-এ MongoDB/Supabase use করবে
const stats = {};

function getStats(adId) {
  if (!stats[adId]) stats[adId] = { impressions: 0, clicks: 0 };
  return stats[adId];
}

// ========== ROUTES ==========

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'AdsHub Server Running ✅', ads: ads.length });
});

// Get ad by zone
// App/Website এই endpoint call করবে
// GET /ad?zone=banner&app=myapp
app.get('/ad', (req, res) => {
  const zone = req.query.zone || 'banner';
  const appId = req.query.app || 'unknown';

  // Filter active ads by zone
  const zoneAds = ads.filter(a => a.active && a.zone === zone);

  if (zoneAds.length === 0) {
    return res.status(404).json({ error: 'No ads available for this zone' });
  }

  // Random ad select
  const ad = zoneAds[Math.floor(Math.random() * zoneAds.length)];

  // Track impression
  getStats(ad.id).impressions++;

  // Return ad data
  res.json({
    id: ad.id,
    title: ad.title,
    image: ad.image,
    click_url: `https://adserver-xxxx.onrender.com/click?id=${ad.id}&url=${encodeURIComponent(ad.link)}`,
    width: ad.width,
    height: ad.height
  });
});

// Track click + redirect
// GET /click?id=ad001&url=https://amazon.com/...
app.get('/click', (req, res) => {
  const { id, url } = req.query;

  if (id) {
    getStats(id).clicks++;
  }

  if (url) {
    res.redirect(decodeURIComponent(url));
  } else {
    res.status(400).json({ error: 'No URL provided' });
  }
});

// Dashboard - stats দেখার জন্য
// GET /stats
app.get('/stats', (req, res) => {
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

// Get all zones
app.get('/zones', (req, res) => {
  const zones = [...new Set(ads.map(a => a.zone))];
  res.json({ zones });
});

// ========== START ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AdsHub Server running on port ${PORT}`);
});