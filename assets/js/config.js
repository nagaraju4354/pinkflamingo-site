/* ==========================================================================
   PINK FLAMINGO BUZZ — SITE CONFIG
   This is the ONLY file you need to edit to update reels, founders and contact.
   (A .js file is used instead of .json so the site also works when opened
   straight from disk via file://, where fetch() of JSON is blocked.)
   ========================================================================== */
window.PFB_CONFIG = {
  contact: {
    email: "pinkflamingobuzz@gmail.com",     // shown on the site AND where contact-form enquiries are delivered
    phone: "",                                // leave empty to hide
    instagram: "pinkflamingobuzz",
    city: "Hyderabad, India"
  },

  /* ---------------------------------------------------------------------
     CLIENT WORK — Instagram reel shortcodes (the part after /reel/).
     Add / remove / reorder freely. Each renders as an identical card.
     --------------------------------------------------------------------- */
  reels: [
    "DZnPUR_trBT", "DfuQ15BNzBn", "DfEt13nN9Xs", "DeYZD57Ndb3", "Deq7-ZbNfZr",
    "DeHdkudN9Rd", "Dc_a6JItXC8", "Da694RMtRkj", "DaNmoF1tfft", "DZ1rG-Atc8u",
    "DYhw046NGU8", "DWndvB0jfvH", "DWY-XY6jROV", "DVll12YjTg8", "Df7PVHjycXt",
    "Df63OvOSiGp", "Df4s_7cSqVg", "Derbf7bSvN7", "DcsGXCKSdhH", "DZ9N_jly0hT"
  ],

  /* ---------------------------------------------------------------------
     CO-FOUNDERS
     - photo: path to an image in assets/img/ (e.g. "assets/img/neelima.jpg").
              Leave "" to show a branded initials avatar.
     - followers / posts / following: numbers shown on the card. Leave null
              to hide them. If liveStats.endpoint is set (see below), these
              are overwritten with live numbers on every page load.
     --------------------------------------------------------------------- */
  founders: [
    {
      handle: "its_neelimaaa",
      name: "Neelima Tirumala",
      role: "Co-founder · Digital creator",
      bio: "Lifestyle stories, skincare, fashion and travel from Hyderabad. Creator turned agency founder who knows brand collabs from both sides.",
      photo: "assets/img/founder-neelima.webp",
      followers: 100000,   // snapshot from Instagram, Nov 2026
      posts: 882,
      following: 1182
    },
    {
      handle: "soulful_funnygirl",
      name: "Nandu Reddy",
      role: "Co-founder · Fashion & beauty creator",
      bio: "Fashion, beauty and skincare creator from Hyderabad. Outfit inspo and GRWM content that turns brand stories into moments audiences share.",
      photo: "assets/img/founder-nandu.webp",
      followers: 83000,    // snapshot from Instagram, Nov 2026
      posts: 160,
      following: 1915
    }
  ],

  /* ---------------------------------------------------------------------
     LIVE INSTAGRAM STATS (optional, recommended)
     Point this at the serverless function in /serverless (Cloudflare Worker
     or Netlify/Vercel). It must return JSON like:
       { "username": "...", "name": "...", "followers_count": 12345,
         "follows_count": 321, "media_count": 456, "profile_picture_url": "https://..." }
     for GET  <endpoint>?username=<handle>
     Leave "" to use the static numbers above.
     --------------------------------------------------------------------- */
  liveStats: {
    endpoint: ""
  }
};
