# Coffee Shelf

A personal specialty-coffee journal for iPhone. Photograph a bag, an AI model reads the label
(roaster, origin, process, roast, tasting notes — English, Spanish, Russian and more), you rate it
after brewing, and every new bag gets a predicted rating based on what you've liked before.
English and Russian UI.

Static PWA — no server. Data lives in IndexedDB on the phone. Label reading calls the model
directly from the device with your own key, chosen in Settings:

- **Google Gemini (default, free)** — key from aistudio.google.com, no card. Free-tier requests
  have daily limits and may be used by Google to improve its products.
- **Anthropic Claude (paid)** — key from console.anthropic.com.
- **Without AI** — Tesseract.js reads the text on the phone (English, Spanish, Russian; ~10 MB
  download on first use), then `src/parse.ts` fills the fields from the coffee dictionary in
  `src/lexicon.ts`. The user reviews the result in the editor.

Manual entry is a switch on the Scan screen rather than a setting: type the details and set the
taste profile with dots; known tasting notes can fill the profile automatically.

`src/extract.ts` holds the shared prompt, schema and mapping; `src/gemini.ts` and `src/claude.ts`
only handle the API calls.

## Run locally

```sh
npm install
npm run dev
```

## Deploy

Push to `main` on GitHub, then in the repo go to **Settings → Pages → Source: GitHub Actions**.
The workflow in `.github/workflows/deploy.yml` builds with the right `/<repo>/` base path.

On the iPhone: open the Pages URL in Safari → Share → **Add to Home Screen**, then add your API key
in the app's Settings.

## Google Drive backup (optional)

Set `GOOGLE_CLIENT_ID` in `src/config.ts` to an OAuth "Web application" client ID (Google Cloud
Console, Drive API enabled, redirect URI = the app URL). Settings then offers **Sign in with
Google**: the phone talks to Google directly — still no backend — and keeps one backup file in the
hidden app-data folder (`drive.appdata` scope). Backups run a few seconds after changes while the
browser token is valid (~1 h); after that the Shelf shows a one-tap reminder. A new device is asked
whether to restore or replace before anything is overwritten.

## In the shop

Scan a bag → **Add to comparison** → scan the next one (up to 6). **Compare** on the Scan screen
shows the bags side by side, best predicted match first, with SCA score, origin, process, roast,
notes and the reasons behind each prediction. The comparison is kept on the device until cleared.
Coffees already on the shelf can join the comparison too (**Add from shelf** in Compare, or **Add
to comparison** on a coffee's page); rated ones show your own rating instead of a prediction.

## How predictions work (`src/recommend.ts`)

Each coffee becomes a feature vector: 13 flavor categories based on the SCA flavor wheel,
process, origin region, roast level, acidity/body/sweetness, and altitude.

- **From 3 ratings:** similarity-weighted average of your ratings for the closest coffees,
  shrunk toward your average when nothing similar has been rated.
- **From 6 ratings:** a ridge regression over the same features is blended in. Its weights drive
  the "+ / −" reasons on each prediction and the Taste tab.

## Icons

`public/icon.svg` is the source; `npm run icons` regenerates the PNGs.
