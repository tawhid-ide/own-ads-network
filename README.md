================================================
BLOGGER POST FORMAT (আপডেটেড)
================================================

TITLE: যেকোনো নাম (e.g. Sony Headphones Display Ad)

BODY (HTML mode-এ paste করো):
------------------------------------------------
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
------------------------------------------------

ADZONE OPTIONS:   banner | main | popup | sticky | video
ADTYPE OPTIONS:   display | native

RULES:
✅ Post Publish = Ad Live
❌ Post Delete = Ad বন্ধ
🔄 /refresh = সাথে সাথে update

================================================
AD SNIPPET (website/app/game এ paste করো)
================================================

<!-- Display/Native Ad -->
<div id="adshub-slot"></div>
<script>
  fetch('https://adshub-server.onrender.com/ad?key=YOUR_KEY_HERE&app=MY_APP')
    .then(r => r.text())
    .then(html => { document.getElementById('adshub-slot').innerHTML = html; });
</script>

================================================
RENDER ENVIRONMENT VARIABLES
================================================
MAIN_KEY   = (যেকোনো random string, e.g. mk_a1b2c3d4)
BANNER_KEY = (যেকোনো random string, e.g. bk_e5f6g7h8)
POPUP_KEY  = (যেকোনো random string, e.g. pk_i9j0k1l2)
STICKY_KEY = (যেকোনো random string, e.g. sk_m3n4o5p6)
VIDEO_KEY  = (যেকোনো random string, e.g. vk_q7r8s9t0)
================================================
