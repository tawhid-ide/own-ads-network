# AdsHub Server

Dynamic ad network — Blogger as database, Render as backend.

**Post publish = Ad live | Post delete = Ad off**

---

## How It Works

```
Blogger (adshub999.blogspot.com)
         ↓ RSS feed
Render (adshub-server.onrender.com)
         ↓ sdk.js
App / Website / Game
```

---

## 1. Render Deploy Guide

### Step 1 — GitHub repo ready
Make sure these files are in root:
```
index.js
package.json
README.md
```

### Step 2 — Render setup
1. render.com → **New Web Service**
2. Connect GitHub repo: `Ad-s-hub-`
3. Settings:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`

### Step 3 — Environment Variables
Render Dashboard → your service → **Environment** → Add these:

```
MAIN_KEY   = mk_a1b2c3d4
BANNER_KEY = bk_e5f6g7h8
POPUP_KEY  = pk_i9j0k1l2
STICKY_KEY = sk_m3n4o5p6
VIDEO_KEY  = vk_q7r8s9t0
```
> Use any random strings. Keep them secret.

### Step 4 — Deploy
**Manual Deploy → Deploy latest commit**

### Step 5 — Verify
Visit: `https://adshub-server.onrender.com`
Should return: `{"status":"AdsHub Server Running ✅"}`

---

## 2. Blogger Post Format (Ad Creation)

Go to **adshub999.blogspot.com** → New Post → **HTML mode** → paste:

```
ADIMAGE: https://blogger.googleusercontent.com/...your_image_url...
ADLINK: https://amazon.com/dp/XXXXX?tag=tawhidinsan-20
ADZONE: banner
ADTYPE: display
ADTITLE: Product Name Here
ADDESC: Short description of the product. Keep it under 100 chars.
ADCTA: Shop Now
ADBRAND: Brand Name
ADWIDTH: 300
ADHEIGHT: 200
```

**ADZONE options:**
| Key | Zone | type |
|---|---|---|
| main | Hero / top of page | display |
| banner | In-content / mid-page | 
| popup | Modal / interstitial |
| sticky | Fixed bottom bar |
| video | Before/after video |

**ADTYPE options:**
| Value | Style |
|---|---|
| display | Image + Title + Description + CTA button |
| native | Small image + text side by side |

> ✅ Publish = Ad live immediately (within 5 min cache)
> ❌ Delete = Ad off
> 🔄 Force update: visit `/refresh`

---

## 3. Publisher Integration

### HTML / Website / Blogger
```html
<!-- Step 1: Add once inside <head> -->
<script src="https://adshub-server.onrender.com/sdk.js"></script>

<!-- Step 2: Place anywhere you want an ad -->
<div class="adshub" data-key="bk_e5f6g7h8"></div>
```

### React / Next.js
```jsx
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://adshub-server.onrender.com/sdk.js';
  document.head.appendChild(script);
}, []);

// In JSX:
<div className="adshub" data-key="bk_e5f6g7h8"></div>
```

### Android WebView
```java
webView.loadUrl("javascript:(function(){" +
  "var s=document.createElement('script');" +
  "s.src='https://adshub-server.onrender.com/sdk.js';" +
  "document.head.appendChild(s);" +
"})()");
```

---

## 4. AI Prompt Guide (Monetize Any App/Website)

When building any app or website with AI, add this to your prompt:

```
## Monetization (AdsHub Ad Network)

Do NOT use Google AdSense or AdMob.
Use my custom ad network: AdsHub.

SDK (add once in <head>):
<script src="https://adshub-server.onrender.com/sdk.js"></script>

Ad placement (use the appropriate key per zone):

BANNER AD (in-content / mid-page):
<div class="adshub" data-key="bk_e5f6g7h8"></div>

MAIN AD (hero / top of page):
<div class="adshub" data-key="mk_a1b2c3d4"></div>

POPUP AD (modal / interstitial):
<div class="adshub" data-key="pk_i9j0k1l2"></div>

STICKY AD (fixed bottom bar):
<div class="adshub" data-key="sk_m3n4o5p6"></div>

VIDEO AD (before/after video content):
<div class="adshub" data-key="vk_q7r8s9t0"></div>

Rules:
- Ads load automatically, no extra JS needed
- If an ad fails to load, the slot silently hides
- Place ads where user engagement is highest
- Do not block main content with ads
```

---

## 5. Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Server status |
| `/sdk.js` | GET | Publisher SDK script |
| `/ad?key=KEY` | GET | Serve ad HTML by zone key |
| `/click?id=xx&url=xx` | GET | Track click + redirect |
| `/stats` | GET | All ads performance data |
| `/refresh` | GET | Force clear cache |

---

## 6. Zone Keys Quick Reference

> Replace with your actual keys from Render Environment Variables

| Zone | Key Variable | Usage |
|---|---|---|
| Main | MAIN_KEY | Hero section, top banner |
| Banner | BANNER_KEY | In-content, mid-page |
| Popup | POPUP_KEY | Modal, interstitial |
| Sticky | STICKY_KEY | Fixed bottom bar |
| Video | VIDEO_KEY | Pre/post video |

---

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| Ad not showing | Check key is correct, check Blogger post format |
| Old ad still showing | Visit `/refresh` |
| Server slow first load | Free Render plan sleeps after inactivity — normal |
| No ads in zone | Make sure ADZONE in post matches the zone |
