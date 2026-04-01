# AdsHub Server

Dynamic ad network — Blogger as database, Render as backend.

**Post publish = Ad live | Post delete = Ad off**

---

## How It Works

```
Blogger (adshub999.blogspot.com)
         ↓ RSS feed (5 min cache)
Render (adshub-server-jzsp.onrender.com)
         ↓ sdk.js
App / Website / Game
```

---

## 1. Render Deploy Guide

### Files needed in GitHub root:
```
index.js
package.json
README.md
```

### Render Setup:
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `node index.js`

### Environment Variables:
```
STICKY_KEY     = sk_m3n4o5p6
SQUARE_KEY     = sq_a1b2c3d4
FULLSCREEN_KEY = fs_e5f6g7h8
```

### Deploy:
Manual Deploy → Deploy latest commit

### Verify:
`https://adshub-server-jzsp.onrender.com` → `{"status":"AdsHub Server Running ✅"}`

---

## 2. Ad Types

| Type | Size | Use Case |
|---|---|---|
| `sticky` | 320×50 / 320×100 / 728×90 / 970×90 | Fixed bottom bar |
| `square` | 300×250 (standard) | Inside content, most used |
| `fullscreen` | Responsive | Popup/interstitial overlay |

---

## 3. Blogger Post Format

Go to **adshub999.blogspot.com** → New Post → **HTML mode** → paste:

### Sticky Ad
```
ADMEDIA: https://blogger.googleusercontent.com/...
ADLINK: https://amzn.to/xxxxx?tag=tawhidinsan-20
ADZONE: sticky
ADTITLE: Product Name
ADDESC: Short description
ADCTA: Shop Now
ADBRAND: Brand Name
```

### Square Ad
```
ADMEDIA: https://blogger.googleusercontent.com/...
ADLINK: https://amzn.to/xxxxx?tag=tawhidinsan-20
ADZONE: square
ADTITLE: Product Name
ADDESC: Short description
ADCTA: Shop Now
ADBRAND: Brand Name
```

### Fullscreen Ad
```
ADMEDIA: https://blogger.googleusercontent.com/...
ADLINK: https://amzn.to/xxxxx?tag=tawhidinsan-20
ADZONE: fullscreen
ADTITLE: Product Name
ADDESC: Short description
ADCTA: Shop Now
ADBRAND: Brand Name
```

### Video Ad (any type)
`ADMEDIA` তে `.mp4` / `.webm` / `.ogg` URL দাও — বাকি সব same।
Image URL → image দেখাবে | Video URL → autoplay muted loop video দেখাবে

> ✅ Publish = Ad live | ❌ Delete = Ad off | 🔄 `/refresh` = force update

---

## 4. Publisher Integration

### SDK (add once in `<head>`):
```html
<script src="https://adshub-server-jzsp.onrender.com/sdk.js"></script>
```

### Ad Slots (place in `<body>`):
```html
<!-- Sticky -->
<div class="adshub" data-key="sk_m3n4o5p6"></div>

<!-- Square -->
<div class="adshub" data-key="sq_a1b2c3d4"></div>

<!-- Fullscreen -->
<div class="adshub" data-key="fs_e5f6g7h8"></div>
```

### Sticky Ad wrapper (fixed bottom):
```html
<div style="position:fixed;bottom:0;left:0;right:0;z-index:999;background:#fff;border-top:1px solid #eee;">
  <div class="adshub" data-key="sk_m3n4o5p6"></div>
</div>
```
> Add `padding-bottom: 80px` to body so sticky doesn't cover content.

---

## 5. AI Prompt (copy this to monetize any app/website)

```
## Monetization — AdsHub Ad Network

IMPORTANT: Follow these steps EXACTLY. Do not skip or reorder.

STEP 1 — Inside the <head> tag, add this line:
<script src="https://adshub-server-jzsp.onrender.com/sdk.js"></script>

This MUST be inside <head>...</head>. NOT in <body>. NOT at the bottom.

Correct placement:
<head>
  <meta charset="UTF-8">
  <title>My App</title>
  <script src="https://adshub-server-jzsp.onrender.com/sdk.js"></script>
</head>

STEP 2 — Inside <body>, place ad slots:

Square (standard, use most):
<div class="adshub" data-key="sq_a1b2c3d4"></div>

Sticky bottom bar:
<div style="position:fixed;bottom:0;left:0;right:0;z-index:999;">
  <div class="adshub" data-key="sk_m3n4o5p6"></div>
</div>

Fullscreen/interstitial:
<div class="adshub" data-key="fs_e5f6g7h8"></div>

RULES:
- SDK script MUST be in <head>
- class="adshub" and data-key must be exact
- Do NOT add any extra JavaScript for ads
- Add padding-bottom:80px to body when using sticky ad
- Do NOT use Google AdSense, AdMob, or any other network
```

---

## 6. Endpoints

| Endpoint | Description |
|---|---|
| `/` | Server status |
| `/sdk.js` | Publisher SDK |
| `/ad?key=KEY` | Serve ad HTML |
| `/click?id=xx&url=xx` | Track click + redirect |
| `/stats` | Performance data |
| `/refresh` | Force clear cache |

---

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| Ad not showing | Check SDK is in `<head>`, check key is correct |
| Wrong/old ad showing | Visit `/refresh` |
| Server slow (first load) | Free Render plan sleeps after 15min inactivity — normal |
| Fullscreen ad not covering screen | Wrap in `position:fixed;inset:0` div |
| Sticky covering buttons | Add `padding-bottom:80px` to body |
