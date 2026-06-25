// Google Analytics (GA4) Measurement ID – আপনার ID দিন
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";   // ← নিজের ID বসান

// অ্যাড কন্টেইনার তৈরি
function createAdContainer() {
  const container = document.createElement("div");
  container.id = "ad-container";
  container.style.position = "relative";
  container.style.width = "100%";
  container.style.height = "400px";
  container.style.overflow = "hidden";

  const bgImg = document.createElement("img");
  bgImg.id = "ad-bg";
  bgImg.style.position = "absolute";
  bgImg.style.width = "100%";
  bgImg.style.height = "100%";
  bgImg.style.objectFit = "cover";
  container.appendChild(bgImg);

  const cardDiv = document.createElement("div");
  cardDiv.id = "ad-card";
  cardDiv.style.position = "absolute";
  cardDiv.style.bottom = "20px";
  cardDiv.style.left = "20px";
  cardDiv.style.right = "20px";
  cardDiv.style.background = "rgba(255,255,255,0.9)";
  cardDiv.style.padding = "20px";
  cardDiv.style.borderRadius = "10px";
  container.appendChild(cardDiv);

  return container;
}

// Google Analytics gtag লোড করা (যদি আগে থেকে সাইটে না থাকে)
function loadGA() {
  if (window.gtag) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){dataLayer.push(arguments);};
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
}

// অ্যাড লোড ও রেন্ডার
async function loadAd() {
  try {
    const res = await fetch("https://YOUR_WORKER_URL.workers.dev"); // ← Worker URL দিন
    const data = await res.json();

    const bg = document.getElementById("ad-bg");
    const card = document.getElementById("ad-card");
    if (bg) bg.src = data.background_image;
    if (card) card.innerHTML = data.card_html;

    // ইম্প্রেশন ইভেন্ট GA-তে পাঠানো
    if (window.gtag) {
      gtag('event', 'ad_impression', {
        event_category: 'ad',
        event_label: data.background_image || 'ad',
        value: 1
      });
    }
  } catch (e) {
    console.error("Ad load failed", e);
  }
}

// পেজ লোড হলে অ্যাড বসানো
(function init() {
  const container = createAdContainer();
  // যেখানে অ্যাড দেখাতে চান সেখানে অ্যাপেন্ড করুন, অথবা নির্দিষ্ট আইডিতে
  const target = document.getElementById("ad-slot") || document.body;
  target.appendChild(container);
  loadGA();
  loadAd();
})();
