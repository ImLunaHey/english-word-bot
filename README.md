# english-word-bot

A Bluesky bot. Posts a random English word every 10 minutes, rendered as
a generated PNG with a stylised background. Words are drawn from the
[`word-list`](https://www.npmjs.com/package/word-list) npm package and
tracked in a local file so they never repeat.

## Run it

```bash
npm install
BLUESKY_USERNAME=…  BLUESKY_PASSWORD=…  npm start
```

Optional:

- `POSTED_WORD_LIST_PATH` — where to persist already-posted words
  (defaults to `./postedWords.txt`)

## How it works

- `node-cron` fires every 10 minutes (`*/10 * * * *`)
- Picks a random word, retries if it's already in the posted set
- Renders the word as SVG → PNG via sharp (`image.ts`)
- Posts via `@skyware/bot` with descriptive alt text

## Deploy

`railway.json` is included for one-click Railway deploys.
