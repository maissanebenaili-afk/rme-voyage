# RME Voyage — Global Innovation Radar (v1, 2026-09-27)

Scope: 30 entries (RAD-01 … RAD-30) + 5 "1+1+1=10" combinations.
Method: every entry was checked with WebSearch/WebFetch, the GitHub repository search API (licence + last push) or the Hugging Face Hub (model/dataset cards) on 2026-09-27. When something could not be confirmed it is marked **UNKNOWN**. Figures are quoted from the source cited next to them; secondary sources (press, blogs) are flagged as such.

Scoring scale: LOW / MEDIUM / HIGH / UNKNOWN.
- **Cost** = cost to RME (LOW is good).
- **Risk** = legal, trust or technical risk (LOW is good).

Classification key: STEAL-THE-IDEA (take the mechanism as it is, rebuilt from scratch) · ADAPT (change it to fit MRE use) · COMBINE (only worth it when paired with something else) · IMPROVE (RME already does this, so do it better) · WATCH (not yet) · IGNORE.

Hard rules that apply to every entry: never copy code, UI or branding; never claim to be official (Marhaba, OPE, ONCF, ports); keep the Trust Layer label on every card; next actions stay suggestions and never auto-execute.

---

## Summary table

| ID | Name | Region | Class | Utility | Feasibility (0€) | Licence/rights |
|---|---|---|---|---|---|---|
| RAD-01 | WeChat Mini Programs (no-install entry via QR/link) | China | ADAPT | HIGH | HIGH | Mechanism only |
| RAD-02 | LINE MINI App + Service Message | Japan | ADAPT | MEDIUM | HIGH | Mechanism only |
| RAD-03 | Grab "everyday everything" super-app | SE Asia | IMPROVE | MEDIUM | HIGH | Mechanism only |
| RAD-04 | Kakao T unified mobility (incl. parking prediction) | Korea | WATCH | MEDIUM | LOW | Mechanism only |
| RAD-05 | Duolingo streak + Streak Freeze | USA/global | ADAPT | MEDIUM | HIGH | Mechanism only |
| RAD-06 | Google Maps "search along route / add stop" | Global | STEAL-THE-IDEA | HIGH | HIGH | OSM data ODbL |
| RAD-07 | Spotify daylist (time-of-day context) | Global | ADAPT | MEDIUM | HIGH | Mechanism only |
| RAD-08 | Citymapper GO (step-aware trip mode) | UK/global | STEAL-THE-IDEA | HIGH | MEDIUM | Mechanism only |
| RAD-09 | Wise transparent pricing (mid-market + visible fee) | UK/global | IMPROVE | HIGH | HIGH | Mechanism only |
| RAD-10 | M-Pesa agents + Moroccan m-wallets | Kenya/Morocco | WATCH | MEDIUM | LOW | n/a |
| RAD-11 | Waze community reports with confidence decay | Global | COMBINE | HIGH | MEDIUM | Mechanism only |
| RAD-12 | Google Now → Discover proactive cards | Global | ADAPT | HIGH | HIGH | Mechanism only |
| RAD-13 | SharePlay co-watching (synchronised moments) | USA/global | ADAPT | MEDIUM | MEDIUM | Media rights: HIGH risk |
| RAD-14 | Google Lens camera translate ("show me") | Global | ADAPT | MEDIUM | MEDIUM | Mechanism only |
| RAD-15 | Browser Web Speech API (STT, `processLocally`) | Web | IMPROVE | HIGH | HIGH | Browser API |
| RAD-16 | whisper.cpp WASM + Darija fine-tunes | Global/Morocco | WATCH | HIGH | LOW | MIT / MIT / Apache-2.0 |
| RAD-17 | Vosk offline STT | Global | IGNORE (for Darija) | LOW | MEDIUM | Apache-2.0 (per model) |
| RAD-18 | Piper TTS (moved to piper1-gpl) | Global | WATCH | MEDIUM | MEDIUM | GPL-3.0 engine; per-voice licences |
| RAD-19 | Kokoro-82M TTS | Global | WATCH | LOW | MEDIUM | Apache-2.0 |
| RAD-20 | Transformers.js | Web | COMBINE | MEDIUM | MEDIUM | Apache-2.0 |
| RAD-21 | WebLLM | Web | WATCH | LOW | LOW | Apache-2.0 |
| RAD-22 | Darija NLP on Hugging Face (Atlas-Chat, DarijaBERT, DODa, DarijaMMLU) | Morocco | WATCH / COMBINE | HIGH | MEDIUM | Mixed (Gemma, MIT, UNKNOWN) |
| RAD-23 | Tesseract.js OCR (ara + fra) | Web | COMBINE | MEDIUM | HIGH | Apache-2.0 |
| RAD-24 | OSRM / Valhalla / OSM tiles / Overpass | Global | IMPROVE | HIGH | MEDIUM | BSD-2 / MIT / ODbL + policies |
| RAD-25 | Open-Meteo | Global | IMPROVE | HIGH | HIGH | CC BY 4.0 data, non-commercial free tier |
| RAD-26 | Spain NAP (GTFS/NeTEx) + ONCF community GTFS | Spain/Morocco | ADAPT | MEDIUM | MEDIUM | MITRAMS licence / ODbL |
| RAD-27 | Open events and sports data (OpenAgenda, football-data.org) | France/EU | WATCH | MEDIUM | MEDIUM | Varies |
| RAD-28 | Opération Marhaba (FM5/FH2MRE) + Spain OPE official channels | Morocco/Spain | ADAPT (link-out only) | HIGH | HIGH | Public info; no API found |
| RAD-29 | Tanger Med "fixed ticket" rule + ferry operators | Morocco/Spain | ADAPT | HIGH | HIGH | Public info; no open data found |
| RAD-30 | data.gov.ma (CKAN, 695 datasets) | Morocco | ADAPT | MEDIUM | HIGH | ODbL (per dataset) |

---

## 1. Mechanisms from big platforms (abstracted)

### RAD-01 — WeChat Mini Programs
- **Region:** China
- **Who/what:** Lightweight apps that run inside WeChat without being installed, opened by QR scan, search or link.
- **Mechanism:** No install, so an app opens at the exact moment and place of need (a QR code in a restaurant or station) and the user is already signed in. Official docs: "services with native app experiences in WeChat".
- **RME adaptation (smallest):** "Moment links". These are deep links such as `/m/port-tanger-med` or `/m/checklist-depart` that open one focused card (already a PWA/Next route). Users share them on WhatsApp, where MRE families already are. No QR printing needed at first.
- **Class:** ADAPT
- **Utility:** HIGH. Sharing one card is how MRE families already pass info around (WhatsApp).
- **Differentiation:** MEDIUM. Deep links are common, but "one card for one moment" is not.
- **Feasibility:** HIGH. These are Next.js routes plus OG images.
- **Cost:** LOW. Vercel Hobby static/ISR.
- **Risk:** LOW
- **Licence/rights:** Mechanism only; no WeChat code, API or branding.
- **Smallest experiment:** Ship 3 moment links with OG previews and count opens per share (UTM `?s=wa`).
- **Sources:** https://developers.weixin.qq.com/miniprogram/en/dev/framework/
- *Alipay mini-programs and Meituan were NOT separately verified. They are not included as evidence.*

### RAD-02 — LINE MINI App (LIFF) + Service Message API
- **Region:** Japan
- **Who/what:** Web apps running inside LINE, built on LIFF. There is no install, and the server can send "service messages" (receipts and confirmations) back into the chat.
- **Mechanism:** An action inside the web app is confirmed afterwards by a message in the user's chat thread. That message is the proof of what happened.
- **RME adaptation:** A "Confirmation" step: after a user accepts a next action (for example "save ferry reminder"), RME makes a shareable summary card with an ICS file for the calendar. Nothing is sent automatically.
- **Class:** ADAPT
- **Utility:** MEDIUM. It closes the CONFIRMATION step of the principle.
- **Differentiation:** MEDIUM
- **Feasibility:** HIGH. ICS generation plus the Web Share API.
- **Cost:** LOW
- **Risk:** LOW
- **Licence/rights:** Mechanism only.
- **Smallest experiment:** An "Add to calendar" ICS on ferry departure cards. Measure the click rate.
- **Sources:** https://developers.line.biz/en/docs/line-mini-app/discover/introduction/ · https://developers.line.biz/en/docs/line-mini-app/discover/specifications/

### RAD-03 — Grab super-app
- **Region:** Southeast Asia
- **Who/what:** One app across 8 countries for rides, food, payments and more ("everyday everything app"). Official page: 465 cities in 8 countries.
- **Mechanism:** One home screen with many high-frequency verticals, and one identity and wallet shared across them.
- **RME adaptation:** RME already has many verticals. The lesson is to put **one intent-first home** ("Je pars quand ?") ahead of a grid of tools.
- **Class:** IMPROVE
- **Utility:** MEDIUM
- **Differentiation:** LOW. The super-app pattern is well known.
- **Feasibility:** HIGH
- **Cost:** LOW
- **Risk:** MEDIUM. The payments side of this pattern is regulated and out of scope for RME.
- **Licence/rights:** Mechanism only.
- **Smallest experiment:** A/B the home page: tool grid vs one intent question. Measure time to first useful card.
- **Sources:** https://www.grab.com/sg/about/superapp/ · https://www.grab.com/sg/

### RAD-04 — Kakao T (Kakao Mobility)
- **Region:** Korea
- **Who/what:** Launched in 2017 as one app for taxi, bike, parking (including availability prediction), navigation and designated drivers.
- **Mechanism:** Every transport need of a car owner is merged into one app, and parking availability is predicted.
- **RME adaptation:** Later, a port-arrival "queue/parking" card. There is **no verified open data** on port queues (see RAD-29), so it cannot be built yet.
- **Class:** WATCH
- **Utility:** MEDIUM
- **Differentiation:** HIGH if data existed.
- **Feasibility:** LOW. No data source.
- **Cost:** UNKNOWN
- **Risk:** MEDIUM. Wrong predictions would damage trust.
- **Licence/rights:** Mechanism only.
- **Smallest experiment:** None until a data source exists. The COMMUNITY reports in RAD-11 could become that source.
- **Sources:** https://en.wikipedia.org/wiki/Kakao_T (secondary) · https://play.google.com/store/apps/details?id=com.kakao.taxi&hl=en_US

### RAD-05 — Duolingo streak and Streak Freeze
- **Region:** USA / global
- **Who/what:** A daily streak counter, plus a "freeze" that protects the streak for one day.
- **Mechanism and metrics (Duolingo's own blog):**
  - Learners who reach a 7-day streak are "3.6 times more likely to complete their course".
  - Allowing 2 freezes gave "+0.38%" daily active learners.
  - The streak animation gave "+1.7%" 7-day retention for new learners.
  - It relies on loss aversion plus "a little slack".
- **RME adaptation:** A "J-14 → J-0" pre-departure countdown in which each checklist day ticked keeps the chain going, with one "joker" (freeze). It stops at departure and does not run all year.
- **Class:** ADAPT
- **Utility:** MEDIUM. The app is used seasonally, so a year-round streak would not fit.
- **Differentiation:** MEDIUM
- **Feasibility:** HIGH. localStorage and the existing checklist.
- **Cost:** LOW
- **Risk:** MEDIUM. Streak mechanics can become a dark pattern; keep it opt-in with no guilt notifications.
- **Licence/rights:** Mechanism only.
- **Smallest experiment:** Countdown chain on the checklist. Measure % of checklist items completed before D-day, with vs without the chain.
- **Sources:** https://blog.duolingo.com/how-duolingo-streak-builds-habit

### RAD-06 — Google Maps "add a stop along the route"
- **Region:** Global
- **Who/what:** While navigating, search for fuel, food and similar along the route. Each result shows the detour time and, for fuel, the price.
- **Mechanism:** Search is filtered by the route corridor and sorted by added time, not by distance from the user.
- **RME adaptation:** For an OSRM route already computed, show the next fuel / mosque / rest area within a corridor, with "+X min". Data comes from OSM through a cached, rate-limited Overpass query or pre-built extracts.
- **Class:** STEAL-THE-IDEA
- **Utility:** HIGH. A 2,000+ km drive needs fuel, prayer and rest stops.
- **Differentiation:** HIGH when combined with prayer times (see COMBO-1).
- **Feasibility:** HIGH
- **Cost:** LOW
- **Risk:** MEDIUM. The public Overpass instance says "commercial use should use self-hosted or paid servers". Regular apps should stay under about 100 queries and 10 MB per day, so results must be pre-computed per corridor and cached.
- **Licence/rights:** OSM data is ODbL (attribution "© OpenStreetMap contributors").
- **Smallest experiment:** Pre-compute stops for the top 3 corridors (for example Paris→Algeciras) as static JSON. Measure taps on "add stop".
- **Sources:** https://techcrunch.com/2015/10/20/google-maps-now-lets-you-add-a-stop-along-your-route-check-gas-prices (secondary) · https://wiki.openstreetmap.org/wiki/Overpass_API

### RAD-07 — Spotify daylist
- **Region:** Global
- **Who/what:** One playlist that changes several times a day, with a new title and colour to match the time of day.
- **Mechanism:** The same surface (one playlist) shows different content depending on the time of day and day of week. Spotify newsroom: "70% of daylist users tune in week after week".
- **RME adaptation:** The home card changes with the MOMENT:
  - pre-trip evening: checklist;
  - driving morning: route, weather and prayer;
  - near port: Marhaba/port info;
  - match night: sports.
- **Class:** ADAPT
- **Utility:** MEDIUM
- **Differentiation:** MEDIUM
- **Feasibility:** HIGH. Rules on time, trip state and geolocation, with no ML.
- **Cost:** LOW
- **Risk:** LOW
- **Licence/rights:** Mechanism only.
- **Smallest experiment:** 4 rule-based home variants. Measure the tap-through rate of the first card.
- **Sources:** https://newsroom.spotify.com/2023-09-12/ever-changing-playlist-daylist-music-for-all-day/ · https://newsroom.spotify.com/2024-09-04/daylist-new-languages-expanding-worldwide/

### RAD-08 — Citymapper GO
- **Region:** UK / global
- **Who/what:** A trip-assistant mode. A lock-screen notification works out which step of the trip the user is at and alerts them when to get off.
- **Mechanism:** The trip becomes a state machine (step N of M), and the notification always shows only the current step.
- **RME adaptation:** "Mode Voyage" with the steps home → border → port check-in → boarding → arrival. A persistent notification (Capacitor local notifications) shows the current step and one next action.
- **Class:** STEAL-THE-IDEA
- **Utility:** HIGH
- **Differentiation:** HIGH. No verified MRE equivalent was found (not exhaustively searched).
- **Feasibility:** MEDIUM. Needs Capacitor plugins and step logic.
- **Cost:** LOW
- **Risk:** MEDIUM. Driver distraction; show nothing while moving, or voice only.
- **Licence/rights:** Mechanism only.
- **Smallest experiment:** A manual "next step" button with a notification (no GPS). Measure how many steps users advance per trip.
- **Sources:** https://citymapper.com/news/597/go-your-personal-trip-assistant

### RAD-09 — Wise transparent pricing
- **Region:** UK / global
- **Who/what:** Money transfers at the mid-market rate, with the fee shown upfront before the user confirms.
- **Mechanism:** Cost is split into (fee + FX margin) against the mid-market rate, and the result is the amount received.
- **RME adaptation:** The transfer comparator ranks providers by **MAD received for €X**, and shows the FX margin against the mid-market rate as a labelled number (MEASURED where RME computed it, OFFICIAL where it is the provider's quote).
- **Class:** IMPROVE
- **Utility:** HIGH
- **Differentiation:** MEDIUM
- **Feasibility:** HIGH. RME already has currency data.
- **Cost:** LOW
- **Risk:** MEDIUM. Provider quotes change and are hard to get for free, so stale data must be labelled with a timestamp.
- **Licence/rights:** Mechanism only. Provider rates may have terms of use (UNKNOWN per provider).
- **Smallest experiment:** Add a "marge de change vs taux moyen" column. Measure comparator dwell time and outbound clicks.
- **Sources:** https://wise.com/us/pricing/ · https://wise.com/us/mid-market-rate
- *Revolut not separately verified.*

### RAD-10 — M-Pesa agents and Moroccan m-wallets
- **Region:** Kenya / Morocco
- **Who/what:** M-Pesa turns cash into e-money and back through retail agents. In Morocco, m-wallets are growing.
- **Mechanism and figures:**
  - M-Pesa: a physical agent network (superagent → sub-agent) handles cash-in/cash-out, and agents earn a commission.
  - Morocco, from the BAM 2024 report as quoted by FNH: m-wallets grew from 10.4M to 13.7M; 21 active solutions, 12 of them from payment institutions; transactions grew from 9.7M to 19.7M, worth about 3.9 bn MAD.
- **RME adaptation:** An information-only card: "cash pickup vs wallet" option in the transfer comparator when data exists. No payments in RME.
- **Class:** WATCH
- **Utility:** MEDIUM
- **Differentiation:** MEDIUM
- **Feasibility:** LOW. No public API for wallet fees was found.
- **Cost:** UNKNOWN
- **Risk:** HIGH if RME touched money flows; LOW if information only.
- **Licence/rights:** n/a
- **Smallest experiment:** Manually curate 3 wallet offers (labelled COMMUNITY/OFFICIAL with a date).
- **Sources:** https://www.safaricom.co.ke/main-mpesa/m-pesa-services/transactions/deposit-at-agent · https://documents1.worldbank.org/curated/en/832831500443778267/pdf/117403-WP-KE-Tool-6-7-Case-Study-M-PESA-Kenya-Series-IFC-mobile-money-toolkit-PUBLIC.pdf · https://fnh.ma/article/actualite-financiere-maroc/paiement-mobile-cash-mutation (press, citing BAM) · https://www.bkam.ma/Systemes-et-moyens-de-paiement/Publications/Statistiques-des-moyens-de-paiement-scripturaux
- *The M-Pesa agent count (≈298,890) came from a search snippet only and was not verified on a primary page, so it is not used.*

### RAD-11 — Waze community reports with confidence decay
- **Region:** Global
- **Who/what:** Drivers report hazards, and later drivers confirm them ("Thumbs up") or dismiss them ("Not there"). How long a report stays visible depends on those reactions.
- **Mechanism:** Crowd reports carry a confidence score and a time-to-live that others' votes extend or shorten.
- **RME adaptation:** The Trust Layer's COMMUNITY label gets **freshness plus confirmations**, for example "Attente port Tanger Med ~2 h · signalé il y a 40 min · 3 confirmations". Reports expire by default.
- **Class:** COMBINE (Trust Layer + moments)
- **Utility:** HIGH. There is no official live queue data (RAD-29).
- **Differentiation:** HIGH
- **Feasibility:** MEDIUM. Needs a free datastore (for example the Vercel KV/Edge Config free tier: UNKNOWN limits, not checked here).
- **Cost:** LOW to UNKNOWN
- **Risk:** MEDIUM. Abuse and false reports; needs rate limiting and moderation.
- **Licence/rights:** Mechanism only. The data is user-generated, so RME's own terms of service are needed.
- **Smallest experiment:** One report type ("attente au port", 3 values). Measure reports per day during the peak and the confirmation ratio.
- **Sources:** https://support.google.com/waze/answer/13739290?hl=en · https://en.wikipedia.org/wiki/Waze (secondary)

### RAD-12 — Google Now → Google Discover proactive cards
- **Region:** Global
- **Who/what:** Launched in Android 4.1 (2012), it showed cards predicted from context. The branding was retired and the function lives on in the Google app / Discover.
- **Mechanism:** Context (time, place, calendar) triggers a card before the user searches.
- **RME adaptation:** "Carte du moment". Local rules raise one card, for example: "Départ dans 3 jours → météo Algeciras + checklist"; "Heure de prière dans 20 min sur ta route → prochaine mosquée". Each card has one suggested next action and never auto-executes.
- **Class:** ADAPT
- **Utility:** HIGH
- **Differentiation:** MEDIUM
- **Feasibility:** HIGH. It is rule-based.
- **Cost:** LOW
- **Risk:** LOW to MEDIUM. Too many cards feel intrusive; cap at 1 per day.
- **Licence/rights:** Mechanism only.
- **Smallest experiment:** 5 rules, one card on the home page. Measure the accept / dismiss ratio.
- **Sources:** https://en.wikipedia.org/wiki/Google_Now (secondary)

### RAD-13 — SharePlay (co-watching / collective moments)
- **Region:** USA / global
- **Who/what:** Synchronised playback in FaceTime (up to 33 participants per Apple's page, as quoted in search results). Developers use the GroupActivities API.
- **Mechanism:** Shared state (play/pause/position) synchronised across devices.
- **RME adaptation:** Synchronise **the match state, not the video**. A "Match live" room where MRE in Europe and family in Morocco see the same score, minute and reactions, plus TV-channel info from the existing sports hub. RME never streams the match itself.
- **Class:** ADAPT
- **Utility:** MEDIUM
- **Differentiation:** HIGH. It suits the diaspora.
- **Feasibility:** MEDIUM. Needs realtime; a free realtime tier is UNKNOWN here. A polling fallback works on Vercel.
- **Cost:** LOW to UNKNOWN
- **Risk:** HIGH if video is involved (broadcast rights); LOW for score and reactions only.
- **Licence/rights:** Score data needs a source. Free football-data.org does **not** include AFCON/Botola (RAD-27).
- **Smallest experiment:** A 30-second-polling "match room" with emoji reactions for one national-team match. Measure concurrent users and reactions per minute.
- **Sources:** https://support.apple.com/guide/iphone/shareplay-watch-listen-play-iphb657eb791/ios · https://developer.apple.com/videos/play/wwdc2021/10225/

### RAD-14 — Google Lens camera translate ("show me")
- **Region:** Global
- **Who/what:** Point the camera at text and the translation is overlaid in place. Google Lens replaced Translate's camera mode (per 9to5Google, 2022).
- **Mechanism:** Camera → OCR → translate → overlay, with no typing.
- **RME adaptation:** "Montre-moi" for documents and signs: photo of a form, sign or ticket → Tesseract.js OCR (ara/fra, on device) → Hadak explains. Nothing is uploaded unless the user confirms.
- **Class:** ADAPT
- **Utility:** MEDIUM
- **Differentiation:** MEDIUM
- **Feasibility:** MEDIUM. OCR quality on phone photos is UNKNOWN until tested.
- **Cost:** LOW
- **Risk:** MEDIUM. Photos of personal documents contain personal data, so processing stays local by default.
- **Licence/rights:** Mechanism only (see RAD-23 for the OCR licence).
- **Smallest experiment:** OCR 20 real photos (ferry ticket, road sign, customs form). Measure character accuracy and time on a mid-range phone.
- **Sources:** https://9to5google.com/2022/12/05/google-lens-translate-camera/ (secondary) · https://support.google.com/camerafromgoogle/answer/9723213?hl=en

---

## 2. Free/open building blocks (licence and maintenance checked 2026-09-27)

Repository metadata comes from the GitHub search API (SPDX licence id, `pushed_at`, `archived`):

| Repo | SPDX | Last push | Archived | Stars |
|---|---|---|---|---|
| ggml-org/whisper.cpp | MIT | 2026-09-24 | no | 53,948 |
| alphacep/vosk-api | Apache-2.0 | 2026-08-09 | no | 15,149 |
| rhasspy/piper | MIT | 2025-08-26 | **yes** | 11,290 |
| OHF-Voice/piper1-gpl | GPL-3.0 | 2026-09-17 | no | 5,690 |
| hexgrad/kokoro | Apache-2.0 | 2025-08-06 | no | 9,022 |
| huggingface/transformers.js | Apache-2.0 | 2026-09-25 | no | 16,324 |
| mlc-ai/web-llm | Apache-2.0 | 2026-09-15 | no | 19,195 |
| naptha/tesseract.js | Apache-2.0 | 2026-05-17 | no | 38,738 |
| Project-OSRM/osrm-backend | BSD-2-Clause | 2026-09-13 | no | 8,111 |
| valhalla/valhalla | MIT (COPYING file; API returned NOASSERTION) | 2026-09-23 | no | 6,261 |
| open-meteo/open-meteo | AGPL-3.0 (server code) | 2026-09-26 | no | 6,253 |

### RAD-15 — Browser Web Speech API (speech recognition)
- **Region:** Web
- **Who/what:** Built-in browser speech-to-text (STT); RME already uses the browser's speech synthesis for TTS.
- **Mechanism, per MDN:**
  - SpeechRecognition is **not Baseline** ("does not work in some of the most widely-used browsers").
  - In Chrome, audio is sent to a server, so it does not work offline.
  - There is a `processLocally` property to require on-device recognition.
- **RME adaptation:** A voice-first button for Hadak:
  - use `processLocally` when it is available;
  - label the privacy mode ("audio envoyé au navigateur/serveur");
  - fall back to typing.
- **Class:** IMPROVE
- **Utility:** HIGH. The user is hands-busy while travelling.
- **Differentiation:** LOW
- **Feasibility:** HIGH
- **Cost:** LOW
- **Risk:** MEDIUM. Privacy disclosure; Darija recognition quality is UNKNOWN (browser language tags such as `ar-MA` exist in practice but quality was not tested).
- **Licence/rights:** Browser API.
- **Smallest experiment:** Test 30 Darija/French utterances with `lang=ar-MA` vs `fr-FR` on Chrome Android. Measure word error rate by hand.
- **Sources:** https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

### RAD-16 — whisper.cpp (WASM) + Darija ASR fine-tunes
- **Region:** Global / Morocco
- **Who/what:**
  - whisper.cpp is a C/C++ port of Whisper. Its WASM example runs in the browser.
  - Darija fine-tunes exist on Hugging Face.
- **Mechanism and facts:**
  - WASM runs models "up to size `small`"; the tiny model is 74 MB; it needs WASM SIMD; "x2 or x3 real-time for tiny and base".
  - `anaszil/whisper-large-v3-turbo-darija`: a LoRA adapter, **MIT** per its card.
  - `boumehdi/wav2vec2-large-xlsr-moroccan-darija`: **Apache-2.0**, fine-tuned on 57 h, reported WER 0.085 (self-reported).
- **RME adaptation:** No on-device Darija model yet. The Darija fine-tunes are large (large-v3-turbo base), so they do not fit the WASM "≤small" limit. Watch for a small Darija model.
- **Class:** WATCH
- **Utility:** HIGH (Darija voice input)
- **Differentiation:** HIGH
- **Feasibility:** LOW for in-browser Darija today; MEDIUM for FR/ES with tiny/base.
- **Cost:** LOW for in-browser; a self-hosted server is not zero-budget.
- **Risk:** MEDIUM. 74 MB+ downloads on mobile data.
- **Licence/rights:** whisper.cpp MIT; the fine-tunes as listed above. Base Whisper weights: MIT per OpenAI (not re-verified here: UNKNOWN in this session).
- **Smallest experiment:** An offline FR voice note with whisper.wasm tiny on 3 phones. Measure load time and real-time factor.
- **Sources:** https://github.com/ggml-org/whisper.cpp/tree/master/examples/whisper.wasm · https://huggingface.co/anaszil/whisper-large-v3-turbo-darija · https://huggingface.co/boumehdi/wav2vec2-large-xlsr-moroccan-darija

### RAD-17 — Vosk
- **Region:** Global
- **Who/what:** Offline speech recognition toolkit.
- **Facts (from the models page):**
  - `vosk-model-small-fr-0.22`: 41 MB, Apache-2.0.
  - `vosk-model-small-es-0.42`: 39 MB, Apache-2.0.
  - Arabic: `ar-mgb2-0.4` 318 MB, Apache-2.0; Tunisian `small-ar-tn` 158 MB, Apache-2.0.
  - **No Moroccan/Darija model.**
- **RME adaptation:** Not for Darija. It could be an FR/ES offline fallback inside the Capacitor app only.
- **Class:** IGNORE (for Darija) / WATCH (FR offline)
- **Utility:** LOW
- **Differentiation:** LOW
- **Feasibility:** MEDIUM. Needs a native plugin; a browser build is UNKNOWN (not checked).
- **Cost:** LOW
- **Risk:** LOW
- **Licence/rights:** Apache-2.0 for the models listed; some models are AGPL or CC-BY-NC-SA, so check each model before use.
- **Smallest experiment:** None recommended.
- **Sources:** https://alphacephei.com/vosk/models

### RAD-18 — Piper TTS
- **Region:** Global
- **Who/what:** Fast local neural TTS. `rhasspy/piper` is **archived**; development continues in `OHF-Voice/piper1-gpl` (**GPL-3.0**).
- **Facts:** The `rhasspy/piper-voices` repo lists 35 languages including **ar, fr, es**. The repo carries an MIT tag, but each voice is trained on its own dataset, so **per-voice licence = check each model card (UNKNOWN in bulk)**.
- **RME adaptation:** A server-side or native Arabic/French voice as an alternative to the browser voice. GPL-3.0 matters if RME ever distributes the engine inside the APK; calling it as a separate service is a different case. This needs legal reading.
- **Class:** WATCH
- **Utility:** MEDIUM
- **Differentiation:** LOW
- **Feasibility:** MEDIUM
- **Cost:** MEDIUM. Needs a host; Vercel functions are unsuitable.
- **Risk:** MEDIUM (licence)
- **Licence/rights:** GPL-3.0 engine (new repo) / MIT (archived); voices per card.
- **Smallest experiment:** Listen-test the `ar` voice against the browser voice with 10 Hadak answers (5-person preference poll).
- **Sources:** https://huggingface.co/rhasspy/piper-voices/tree/main · GitHub API (table above)

### RAD-19 — Kokoro-82M
- **Region:** Global
- **Who/what:** An 82M-parameter TTS model under Apache-2.0. An ONNX version (`onnx-community/Kokoro-82M-v1.0-ONNX`) can run with Transformers.js.
- **Facts:**
  - 9 languages; **no Arabic**.
  - French has only 1 female voice with "<11 hours" of training data.
  - Spanish has 1 female and 2 male voices.
- **RME adaptation:** Only as a nicer FR/ES female voice. It cannot cover Darija/Arabic.
- **Class:** WATCH
- **Utility:** LOW
- **Differentiation:** LOW
- **Feasibility:** MEDIUM. The model download size in the browser is UNKNOWN (not measured).
- **Cost:** LOW
- **Risk:** LOW
- **Licence/rights:** Apache-2.0 weights.
- **Smallest experiment:** Blind A/B of the FR voice against the Web Speech voice.
- **Sources:** https://huggingface.co/hexgrad/Kokoro-82M · https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md

### RAD-20 — Transformers.js
- **Region:** Web
- **Who/what:** Runs Hugging Face models in the browser with ONNX Runtime (WASM CPU by default, WebGPU optional). It supports ASR, TTS, translation, classification and vision.
- **Mechanism:** Inference on the device, so there is no server cost and no data leaves the phone.
- **RME adaptation:** Small on-device tasks, for example intent classification ("route/prière/argent/match") to pick the next action before calling the LLM router. This saves free LLM quota.
- **Class:** COMBINE
- **Utility:** MEDIUM
- **Differentiation:** MEDIUM
- **Feasibility:** MEDIUM
- **Cost:** LOW
- **Risk:** LOW to MEDIUM (bundle size)
- **Licence/rights:** Apache-2.0 library; each model has its own licence.
- **Smallest experiment:** A zero-shot intent classifier on 50 real Hadak queries. Measure accuracy and latency.
- **Sources:** https://huggingface.co/docs/transformers.js/index

### RAD-21 — WebLLM
- **Region:** Web
- **Who/what:** An in-browser LLM engine that needs **WebGPU**. It supports Llama, Phi, Gemma, Mistral and Qwen2 (0.5B–7B).
- **RME adaptation:** An offline Hadak fallback on a ferry with no signal, in theory. WebGPU availability on target Android phones and the multi-hundred-MB downloads make this impractical now.
- **Class:** WATCH
- **Utility:** LOW
- **Differentiation:** MEDIUM
- **Feasibility:** LOW
- **Cost:** LOW
- **Risk:** MEDIUM. Quality in Darija is UNKNOWN; it may hallucinate offline with no Trust Layer source.
- **Licence/rights:** Apache-2.0 engine; model licences vary.
- **Smallest experiment:** Check WebGPU availability on 5 test phones.
- **Sources:** https://github.com/mlc-ai/web-llm

### RAD-22 — Darija NLP on Hugging Face
- **Region:** Morocco
- **Facts, verified on the model/dataset cards:**
  - `MBZUAI-Paris/Atlas-Chat-2B/9B/27B`: Darija instruction-tuned models based on Gemma-2. **Licence: `gemma`** (gated acknowledgement).
  - `SI2M-Lab/DarijaBERT`: Darija BERT. **Licence field absent → UNKNOWN**.
  - `imomayiz/darija-english` (part of DODa): licence tag "cc" with **no specific CC variant → UNKNOWN**.
  - `MBZUAI-Paris/DarijaMMLU`: **MIT**. It is machine-translated benchmark data, useful for evaluation only.
- **RME adaptation:**
  1. Use DarijaMMLU and similar data to build a small **Hadak Darija eval set** to score the free LLM providers in the router.
  2. If a free hosted endpoint for Atlas-Chat exists, add it to the router. No such free endpoint was verified here (UNKNOWN).
- **Class:** WATCH / COMBINE
- **Utility:** HIGH (Darija quality is core to Hadak)
- **Differentiation:** HIGH
- **Feasibility:** MEDIUM
- **Cost:** LOW for the eval; UNKNOWN for hosting
- **Risk:** MEDIUM (licence terms on Gemma derivatives)
- **Licence/rights:** as listed above.
- **Smallest experiment:** 30 Darija travel questions, blind-rated across the current router providers.
- **Sources:** https://huggingface.co/MBZUAI-Paris/Atlas-Chat-9B · https://huggingface.co/SI2M-Lab/DarijaBERT · https://huggingface.co/datasets/imomayiz/darija-english · https://huggingface.co/datasets/MBZUAI-Paris/DarijaMMLU

### RAD-23 — Tesseract.js OCR
- **Region:** Web
- **Who/what:** Tesseract OCR compiled to WebAssembly (Apache-2.0, last push 2026-05-17).
- **Facts:** Arabic (`ara`) and French (`fra`) are listed as supported in the Tesseract data-file table. The **licence of the tessdata files was not confirmed on the page consulted → UNKNOWN**.
- **RME adaptation:** Powers "Montre-moi" (RAD-14): OCR a ticket to pre-fill the ferry departure time in Mode Voyage, after the user confirms.
- **Class:** COMBINE
- **Utility:** MEDIUM
- **Differentiation:** MEDIUM
- **Feasibility:** HIGH
- **Cost:** LOW
- **Risk:** LOW (local processing)
- **Licence/rights:** Apache-2.0 library; tessdata UNKNOWN.
- **Smallest experiment:** OCR 10 ferry e-tickets and extract the date and time with a regex. Measure the exact-match rate.
- **Sources:** https://tesseract-ocr.github.io/tessdoc/Data-Files-in-different-versions.html · GitHub API (table above)

### RAD-24 — OSRM / Valhalla / OSM tiles / Overpass
- **Region:** Global
- **Facts:**
  - **OSRM demo server:** "reasonable, non-commercial" use only, ≤1 request/s, no uptime guarantee, and it "may be withdrawn at any time".
  - **OSM tile server policy:** visible attribution, a unique User-Agent, cache ≥7 days, and **no offline or prefetch use**.
  - **Overpass:** see RAD-06.
  - **Valhalla:** MIT, actively maintained. Its multimodal/ferry costing was not verified here.
- **RME adaptation:**
  1. Cache OSRM results per corridor (route + ferry port pairs), so the demo server is not hit on every request.
  2. Add a correct User-Agent and attribution.
  3. Never offer "download map for offline" using OSM tiles.
- **Class:** IMPROVE (compliance and hardening)
- **Utility:** HIGH
- **Differentiation:** LOW
- **Feasibility:** MEDIUM
- **Cost:** LOW (self-hosting is not zero)
- **Risk:** HIGH if the demo server is withdrawn during the summer peak, so a cached fallback is essential.
- **Licence/rights:** OSRM BSD-2-Clause; Valhalla MIT; OSM data ODbL.
- **Smallest experiment:** Serve the top 20 corridor routes from static JSON. Measure the cache hit rate over one week.
- **Sources:** https://github.com/Project-OSRM/osrm-backend/wiki/API%20Usage%20Policy · https://operations.osmfoundation.org/policies/tiles/ · https://github.com/valhalla/valhalla/blob/master/COPYING · https://wiki.openstreetmap.org/wiki/Overpass_API

### RAD-25 — Open-Meteo
- **Region:** Global
- **Facts (terms page):**
  - Free API limits: <10,000 calls/day, 5,000/hour, 600/minute.
  - Data is **CC BY 4.0**.
  - **Free use is non-commercial only.** Their examples of commercial use include "subscription/ad-supported apps".
  - The server code is AGPL-3.0.
- **RME adaptation:** Keep it, add the CC BY attribution, and cache per port/city. **If RME ever adds ads or a subscription, the free tier stops applying.**
- **Class:** IMPROVE
- **Utility:** HIGH
- **Differentiation:** LOW
- **Feasibility:** HIGH
- **Cost:** LOW (0 € while non-commercial)
- **Risk:** MEDIUM (the monetisation condition)
- **Licence/rights:** CC BY 4.0 data; non-commercial free tier.
- **Smallest experiment:** An "Attente météo au détroit" card from wind at Tarifa/Algeciras, labelled MEASURED (forecast). Crossing-cancellation thresholds are UNKNOWN, so show raw wind only.
- **Sources:** https://open-meteo.com/en/terms

### RAD-26 — Spain NAP (GTFS/NeTEx) + ONCF community GTFS
- **Region:** Spain / Morocco
- **Facts:**
  - **Spain NAP** (nap.transportes.gob.es, MITRAMS): a national access point for GTFS/NeTEx.
    - Licence allows commercial and non-commercial reuse.
    - It **requires "Powered by MITRAMS" with a link**, citing the source, and not distorting the data.
    - Whether it contains Strait **ferry** schedules was **not verified (UNKNOWN)**.
  - **ONCF GTFS** on Mobility Database (mdb-3049):
    - a **Community feed, not official**, hosted on a personal GitHub;
    - ODbL-1.0;
    - service dates 2024-01-01 → **2025-12-31, so already expired**;
    - 1 validation error.
  - **ONCF has no official open API** found. There is an official ONCF TRAFIC app and the oncf-voyages.ma site.
- **RME adaptation:**
  1. Arrival card "Train depuis Tanger Ville" that **links out** to oncf-voyages.ma (OFFICIAL link) rather than using the stale feed.
  2. Explore NAP for Spanish bus/train legs to Algeciras/Almería.
- **Class:** ADAPT
- **Utility:** MEDIUM
- **Differentiation:** MEDIUM
- **Feasibility:** MEDIUM
- **Cost:** LOW
- **Risk:** MEDIUM. Stale community timetables would break trust, so they must never be labelled OFFICIAL.
- **Licence/rights:** MITRAMS open licence with attribution; ODbL for the community feed.
- **Smallest experiment:** Search the NAP catalogue for "Algeciras" and count usable GTFS feeds (manual, 30 min).
- **Sources:** https://nap.transportes.gob.es/ · https://nap.transportes.gob.es/licencia-datos · https://nap.transportes.gob.es/faqs · https://mobilitydatabase.org/feeds/gtfs/mdb-3049 · https://www.oncf-voyages.ma/ · https://play.google.com/store/apps/details?id=ma.oncf.oncftrafic&hl=fr&gl=US

### RAD-27 — Open event and sports data
- **Region:** France / EU
- **Facts:**
  - **OpenAgenda:** a public REST API for reading events. Search results state that published agenda data is under an open licence, but the **exact licence per agenda was not verified → UNKNOWN**.
  - **football-data.org free tier:** 12 competitions, 10 calls/min, including Champions League, Premier League, Ligue 1, La Liga, World Cup and Euro. **AFCON, CAF qualifiers and Botola are NOT in the free tier** (paid tiers only; Botola is not listed at all). Commercial terms were not stated (UNKNOWN).
- **RME adaptation:** Sports hub "moments" for the free-tier competitions (where many MRE players play in Europe). Morocco national-team fixtures would need another source, so link out.
- **Class:** WATCH
- **Utility:** MEDIUM
- **Differentiation:** MEDIUM
- **Feasibility:** MEDIUM
- **Cost:** LOW
- **Risk:** MEDIUM (coverage gaps for Moroccan competitions)
- **Licence/rights:** as above.
- **Smallest experiment:** Check which Moroccan internationals' clubs are covered by the free tier (manual list).
- **Sources:** https://developers.openagenda.com/ · https://www.football-data.org/pricing · https://www.football-data.org/coverage

---

## 3. Moroccan / MRE-specific

### RAD-28 — Opération Marhaba (official channels) + Spain Operación Paso del Estrecho (OPE)
- **Region:** Morocco / Spain / France / Italy
- **Facts:**
  - **Marhaba 2026:** run by the Fondation Mohammed V pour la Solidarité (fm5.ma) from **10 June to 15 September 2026**, with **26 welcome spaces**: 20 in Morocco and 6 abroad (Genoa; Sète and Marseille; Motril, Almería and Algeciras). About 1,400 staff.
    - These facts come from the FH2MRE page. The FH2MRE page also lists contact phone numbers; RME should **link to that page** rather than copy numbers that may change.
  - **Spain OPE 2026:**
    - Coordinated by the Ministry of the Interior / Protección Civil, **15 June–15 September**, 37th edition.
    - A new internal digital system combines biometrics (EES) with real-time traffic, port, weather and incident data. The announcement mentions **no public app or data feed**.
    - Official advice: "planificar al máximo… incluida la compra de billetes cerrados".
- **RME adaptation:** An "Infos officielles" card that **only links out** to fm5.ma, fh2mre.ma and proteccioncivil.es, labelled OFFICIAL with the date checked. RME must say clearly that it is **not** affiliated.
- **Class:** ADAPT (link-out only)
- **Utility:** HIGH
- **Differentiation:** MEDIUM
- **Feasibility:** HIGH
- **Cost:** LOW
- **Risk:** HIGH if RME appears official, so the wording must be careful and use no logos.
- **Licence/rights:** Public information; no API; logos must not be used.
- **Smallest experiment:** A static card with 3 links and "vérifié le JJ/MM". Measure outbound clicks during the season.
- **Sources:** https://www.fm5.ma/fr · https://www.fh2mre.ma/fondation/actualites/lancement-de-loperation-marhaba-2026-accueil-des-marocains-residant-a-letranger/ · https://www.proteccioncivil.es/coordinacion/campanas/operaci%C3%B3n-paso-del-estrecho · https://www.proteccioncivil.es/-/interior-aprueba-un-novedoso-sistema-digital-de-gesti%C3%B3n-para-operaci%C3%B3n-paso-del-estrecho-2026

### RAD-29 — Tanger Med "fixed ticket" rule + ferry operators
- **Region:** Morocco / Spain
- **Facts (press: Morocco World News, 12 Aug 2026, citing the Tanger Med Port Authority):**
  - Travellers must have a **confirmed departure date and time** before entering the port.
  - This applied before at Tangier, Tarifa, Nador and Ceuta, and was **extended in 2026 to Tanger Med and Algeciras**.
  - Travellers can check or change bookings via the operators' websites, apps or customer service.
- **Operator landscape:** reshaped in 2025–26. Baleària took over part of Armas Trasmediterránea's Strait operations; DFDS (formerly FRS Iberia/Maroc) runs Algeciras–Tanger Med/Ceuta. This is from press and Wikipedia and is secondary.
- **No public open data** (GTFS/API) from these operators was found.
- **RME adaptation:** A checklist rule plus a moment card. "Tu as un billet à date/heure fixe ?" appears D-3 before a crossing via Tanger Med/Algeciras, with the next action "Vérifier ma réservation" linking to the operator's site. Label it OFFICIAL (port authority, via press) with the date.
- **Class:** ADAPT
- **Utility:** HIGH. Without a fixed ticket, travellers are turned away at the port.
- **Differentiation:** HIGH
- **Feasibility:** HIGH
- **Cost:** LOW
- **Risk:** MEDIUM. The rule may change each season, so re-verify it every year.
- **Licence/rights:** Public information.
- **Smallest experiment:** Add the checklist item for the 2027 season. Measure how many users tick it.
- **Sources:** https://www.moroccoworldnews.com/2026/08/334318/tangier-med-introduces-fixed-ticket-system-to-ease-operation-marhaba-2026-traffic/ · https://www.elestrechodigital.com/en/2026/09/01/baleaira-and-dfds-are-reshaping-the-ferry-market-in-the-strait-of-gibraltar · https://en.wikipedia.org/wiki/FRS_Iberia/Maroc

### RAD-30 — data.gov.ma (Moroccan open data portal)
- **Region:** Morocco
- **Facts:**
  - The portal **exists** ("Portail National des données ouvertes", Agence de Développement du Digital).
  - The home page showed "0 jeux de données" when fetched without JS. However, its **CKAN API** (`/data/api/3/action/package_search`) returns **695 datasets**.
  - Sample datasets are licensed **ODbL**, for example:
    - "Liste des ports au Royaume du Maroc" (Ministère de l'Équipement et de l'Eau, 2022);
    - NARSA registrations/permits statistics (2021–2023, updated 2025-05);
    - tourism indicators;
    - "Annuaire des guides touristiques".
  - The searches "ferroviaire", "marhaba", "gtfs", "aeroport" and "douane" returned **0 results**.
- **RME adaptation:** Import the ODbL ports list for port cards (with attribution). Do not expect live or transport data there.
- **Class:** ADAPT
- **Utility:** MEDIUM
- **Differentiation:** LOW
- **Feasibility:** HIGH
- **Cost:** LOW
- **Risk:** LOW. The data is old (2022); label it with the date.
- **Licence/rights:** ODbL per dataset (verified on sample records via the API).
- **Smallest experiment:** Pull the ports dataset and compare it with RME's port list.
- **Sources:** https://data.gov.ma/ · https://data.gov.ma/data/api/3/action/package_search?rows=0

---

## 4. New interaction paradigms: where they land

| Paradigm | Radar entries | Verdict for RME now |
|---|---|---|
| Voice-first assistant | RAD-15, RAD-16, RAD-18, RAD-19 | Web Speech STT + browser TTS now (IMPROVE); Darija on-device ASR is WATCH |
| Camera "show me" | RAD-14 + RAD-23 | ADAPT: local OCR, then Hadak explains, and nothing is uploaded without confirmation |
| Proactive contextual cards | RAD-07, RAD-12, RAD-08 | ADAPT: rule-based "carte du moment", max 1 per day, never auto-executes |
| Ambient / collective moments | RAD-13, RAD-11 | ADAPT: sync match *state*, not video; community port reports with decay |

---

## 5. Five "1+1+1=10" combinations for RME

### COMBO-1 — Route + Prayer times + Stops along route ("Arrêt prière")
- **Ingredients:** OSRM route (RAD-24) + existing prayer times + OSM mosques and fuel stations in the corridor (RAD-06).
- **Why ×10:** No single ingredient answers "où m'arrêter pour Dohr sans perdre de temps et en faisant le plein ?".
- **Smallest prototype:** For one corridor (Paris→Algeciras), a static JSON of OSM mosques and fuel stations within about 5 km of the route. At each prayer time, compute the vehicle's estimated position and suggest the nearest pair. Next action "Ajouter l'arrêt" is a suggestion only.
- **Measure:** % of trips where a suggestion is accepted, and user-reported "arrêt utile" (thumbs up/down). Log the Trust labels: OSM = COMMUNITY, prayer calculation = INFERRED/OFFICIAL according to its source.

### COMBO-2 — Fixed-ticket rule + OCR + Mode Voyage ("Billet prêt ?")
- **Ingredients:** Tanger Med / Algeciras fixed-ticket rule (RAD-29) + Tesseract.js ticket OCR (RAD-23) + Citymapper-style steps (RAD-08) + ICS confirmation (RAD-02).
- **Smallest prototype:** Photo of a ferry ticket → local OCR extracts date and time → the user confirms → a step "Arrivée au port avant HH:MM" plus an ICS file.
- **Measure:** OCR exact-match rate on real tickets, % of users who confirm, and a reduction in "je ne savais pas" feedback (survey).

### COMBO-3 — Community port reports + Trust Layer + Open-Meteo wind ("Détroit maintenant")
- **Ingredients:** Waze-style decaying reports (RAD-11) + Trust Layer labels + Open-Meteo wind at Tarifa/Algeciras (RAD-25) + official link-outs (RAD-28).
- **Smallest prototype:** One card with three labelled lines, each carrying its own time:
  - "Vent Tarifa: 38 km/h (MEASURED/forecast, 14:00)";
  - "Attente signalée: ~2 h (COMMUNITY, 3 confirmations, il y a 40 min)";
  - "Infos officielles → FM5 / Protección Civil (OFFICIAL link)".
- **Measure:** Reports per peak day, confirmation ratio, expiry before contradiction, and card revisit rate.

### COMBO-4 — Hadak voice + on-device intent classifier + next action ("Parle, je propose")
- **Ingredients:** Web Speech STT with `processLocally` when available (RAD-15) + Transformers.js intent classifier (RAD-20) + existing next-action engine + browser TTS.
- **Why ×10:** Voice while driving, and routing happens without spending LLM quota. The answer is one spoken suggestion that needs a spoken or tapped "oui".
- **Smallest prototype:** 6 intents (route, prière, météo, argent, match, checklist). The classifier picks a card and TTS reads one line. The LLM is called only when confidence is below a threshold.
- **Measure:** Intent accuracy on 50 real utterances (FR / Darija), LLM calls avoided (%), and median time from speaking to a suggestion.

### COMBO-5 — Match moment + Diaspora room + Transfer reminder ("Le Match ensemble")
- **Ingredients:** Sports hub + synchronised match state room (RAD-13) + daylist-style moment home (RAD-07) + streak-style participation marks (RAD-05, light).
- **Smallest prototype:**
  - Room for one national-team match. The score comes from a manually updated admin field, because free football-data.org lacks AFCON (RAD-27).
  - 30-second polling, emoji reactions, and "où regarder" (TV info from the hub).
  - The home switches to this card 2 h before kick-off.
- **Measure:** Peak concurrent users, reactions per minute, share-link opens (RAD-01 moment links), and 7-day return after the match.
- **Note:** The transfer idea was dropped from this combo on purpose. Mixing money prompts into an emotional moment would be a dark pattern.

---

## 6. Top 5 by utility × feasibility at 0 €

1. **RAD-29 Fixed-ticket rule card** (HIGH × HIGH). Cost is a checklist item and a link.
2. **RAD-06 Stops along route** (HIGH × HIGH). Pre-computed OSM corridors respecting the Overpass limits.
3. **RAD-12 Proactive "carte du moment"** (HIGH × HIGH). Rule-based, and it maps directly onto MOMENT → NEXT ACTION.
4. **RAD-09 Wise-style "MAD received + FX margin"** (HIGH × HIGH). Improves the existing comparator.
5. **RAD-15 Voice-first with Web Speech STT** (HIGH × HIGH). Must disclose the server-side processing.

Runners-up: RAD-28 (official link-out card), RAD-25 (Open-Meteo, while non-commercial), RAD-11 (community reports: high utility but moderation effort).

## 7. Could not verify (explicit UNKNOWNs)

- Alipay mini-programs, Meituan and Revolut: not separately verified, so no claims are made.
- Whether the Spain NAP contains Strait ferry timetables.
- Any public API or open data from ferry operators (Baleària, DFDS, others) or live port-queue data: none found.
- Official ONCF open data/API: none found. The only GTFS is a community feed that expired 2025-12-31.
- Tessdata file licence; per-voice Piper licences; DarijaBERT licence (missing); DODa "cc" variant; OpenAgenda per-agenda licence; football-data.org commercial terms.
- Darija quality of browser STT (`ar-MA`); browser download sizes for Kokoro; WebGPU availability on target phones.
- Free realtime/KV tier limits on Vercel Hobby (not checked in this session).
- The M-Pesa agent count (search snippet only).
