# Pink Flamingo Buzz — static website

Pure HTML/CSS/JS, no build step, no backend. Open `index.html` in a browser, or upload the whole
folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, Hostinger…).

## Edit content
Everything you'll change lives in **`assets/js/config.js`**:
- `reels` — Instagram reel shortcodes (the part after `/reel/`). Add, remove or reorder; every card is the same size.
- `founders` — name, handle, bio, photo, follower/post/following numbers.
- `contact` — email (also where contact-form enquiries are delivered via FormSubmit), phone (leave empty to hide), agency Instagram handle.

Founder photos: drop images into `assets/img/` (square, ~600×600) and set `photo: "assets/img/neelima.jpg"`.

## Founder follower counts: how "dynamic" works
Instagram does not allow a static site to read follower counts directly (no public API, and scraping
breaks Instagram's terms and gets blocked). Three levels are built in:

1. **Always on — "See live stats" button.** Opens Instagram's own profile embed, which shows the
   current photo, follower count and latest posts straight from Instagram. Zero setup.
   (Instagram's profile embed is not formally documented, so if Instagram ever disables it the button still opens the profile.)
2. **Static numbers** — fill `followers`, `posts`, `following` in `config.js`. Quick, but manual.
3. **Fully live on the card (recommended)** — deploy `serverless/instagram-stats-worker.js` (Cloudflare Worker, free tier)
   using the official Instagram Graph API *Business Discovery* endpoint, then set
   `liveStats.endpoint` in `config.js` to the worker URL. Counts and profile photos then refresh on every visit
   (cached 1 hour) and a green "live" dot appears on the avatar. Needs a Meta developer app + token; founders'
   accounts must be Creator/Business accounts.

## Reels
Each reel uses Instagram's official embed (`/reel/<code>/embed/`), lazy-loaded as it scrolls into view so the page stays fast.
Reels play inside the card; private or deleted reels will show Instagram's "unavailable" message.
