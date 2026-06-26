const BLOG_ID = "1386150708509302279"; // ← নিজের Blogger Blog ID বসান
const CACHE_TTL = 300;          // 5 মিনিট ক্যাশ

async function fetchAds() {
  const url = `https://www.blogger.com/feeds/${BLOG_ID}/posts/default?alt=json&max-results=50`;
  const response = await fetch(url);
  const data = await response.json();

  const entries = data.feed?.entry || [];
  if (!entries.length) return [];

  return entries.map(entry => {
    const content = entry.content?.$t || "";
    const bgMatch = content.match(/<img[^>]+class="ad-bg"[^>]+src="([^"]+)"/);
    const background_image = bgMatch ? bgMatch[1] : null;
    const card_html = content.replace(/<img[^>]+class="ad-bg"[^>]*\/?>/i, "").trim();

    return {
      background_image,
      card_html,
      title: entry.title?.$t || "",
      link: entry.link?.find(l => l.rel === "alternate")?.href || "",
    };
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": `public, max-age=${CACHE_TTL}`,
    };

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    let cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) return cachedResponse;

    try {
      const ads = await fetchAds();
      if (!ads.length) {
        return new Response(JSON.stringify({ error: "No ads found" }), { status: 404, headers });
      }
      const randomAd = ads[Math.floor(Math.random() * ads.length)];

      const response = new Response(JSON.stringify({
        background_image: randomAd.background_image,
        card_html: randomAd.card_html,
      }), { headers });

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }
}
