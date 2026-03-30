# AdsHub Server

Dynamic ad server — Blogger as database, Render as backend.

## How it works
- **New post = Ad live**
- **Delete post = Ad off**
- Cache refreshes every 5 minutes

## Blogger Post Format

Create a new post in HTML mode:

```
ADIMAGE: https://blogger.googleusercontent.com/...
ADLINK: https://amazon.com/dp/XXXXX?tag=tawhidinsan-20
ADZONE: banner
ADTYPE: display
ADTITLE: Sony WH-1000XM5 Headphones
ADDESC: Industry-leading noise cancellation with 30hr battery life.
ADCTA: Shop Now
ADBRAND: Sony
ADWIDTH: 300
ADHEIGHT: 200
```

**ADZONE:** banner | main | popup | sticky | video  
**ADTYPE:** display | native

## Publisher Integration

```html
<!-- Step 1: Add to <head> once -->
<script src="https://adshub-server.onrender.com/sdk.js"></script>

<!-- Step 2: Place anywhere you want an ad -->
<div class="adshub" data-key="YOUR_ZONE_KEY"></div>
```

## Render Environment Variables

```
MAIN_KEY   = your_random_key
BANNER_KEY = your_random_key
POPUP_KEY  = your_random_key
STICKY_KEY = your_random_key
VIDEO_KEY  = your_random_key
```

## Endpoints

| Endpoint | Description |
|---|---|
| `/sdk.js` | Publisher SDK |
| `/ad?key=KEY` | Serve ad HTML |
| `/click?id=xx&url=xx` | Track click + redirect |
| `/stats` | Performance data |
| `/refresh` | Clear cache |
