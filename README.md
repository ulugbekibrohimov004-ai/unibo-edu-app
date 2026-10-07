# UNIBO Edu — Telegram Mini App

Bu repoda faqat ilovaning statik sahifasi turadi (GitHub Pages). Sahifa `unibo-edu` loyihasidagi
`scripts/build_webapp.py` bilan yasaladi.

> **Muhim:** `index.html` generator chiqishi. Bu repoda qo'lda qilingan o'zgarishlar
> (o'z hostingidagi shrift, WebP rasmlar, CSP, `clampInt`, favicon) keyingi build'da yo'qolmasligi uchun
> `build_webapp.py` shablonida ham takrorlanishi kerak.

## Tuzilma

| Yo'l | Vazifasi |
| --- | --- |
| `index.html` | butun ilova (CSS, JS, `CATALOG`) |
| `assets/` | logo va hero rasm (WebP, ekran o'lchamiga mos) |
| `fonts/` | o'z hostingimizdagi Onest (lotin + kirill) |
| `videos/` | namuna darslar: 720p H.264, `faststart`, ~64 kbps AAC |
| `scripts/check.mjs` | tekshiruv: `node scripts/check.mjs` (CI ham shuni ishga tushiradi) |

## Server shartnomasi (bot tomoni uchun)

Mini App `tg.sendData()` bilan faqat **mijoz tomonida** tekshirilgan ma'lumot yuboradi. Quyidagilarga
ishonib bo'lmaydi, bot ularni o'zi qayta tekshirishi **shart**:

- **Balans** (`?b=`) va **sovg'a huquqi** (`?fd=`): URL parametrlari faqat ko'rsatish uchun. Narx va
  yetarli balansni bot hisoblashi kerak.
- **Bepul limit** (`?ft=`): "kuniga 1 ta" qoidasini bot o'zi hisoblab, oshganini rad etishi kerak.
  Mini App qiymatni `0..freeTools` oralig'ida cheklaydi, xolos.
- **18+ tasdig'i** (`adult: true`): oddiy checkbox, tekshiruv emas. Kerak bo'lsa bot o'zi so'rashi kerak.
- **`sendData` cheklovi:** Telegram uni faqat pastki klaviatura (`KeyboardButton web_app`) orqali
  ochilgan ilovada qabul qiladi. Inline/menyu tugmasi orqali ochilganda (`initData` bo'ladi) yuborish
  o'chirilgan. Bunday ochilishni qo'llab-quvvatlash uchun backend endpoint kerak: u `initData` imzosini
  (HMAC, bot tokeni bilan) tekshiradi.

## Media

Yangi video qo'shganda:

```sh
ffmpeg -i in.mp4 -vf scale=-2:720 -c:v libx264 -preset medium -crf 28 -profile:v main \
  -pix_fmt yuv420p -c:a aac -b:a 64k -ac 2 -movflags +faststart videos/nom.mp4
```

Rasmlarni WebP qilib, ekranda ko'rinadigan o'lchamning ~3 baravariga cheklang (`scripts/check.mjs`
300 KB dan kattasini rad etadi, videoni 25 MB dan kattasini rad etadi).
