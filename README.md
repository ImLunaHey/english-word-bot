# english-word-bot

A low-memory Rust Bluesky bot. Posts a random English word every 10 minutes, rendered as
a generated PNG with a stylised background. Words are drawn from the
an embedded English frequency list and
tracked in an atomically updated local file so they never repeat.

## Run it

```bash
BLUESKY_USERNAME=… BLUESKY_PASSWORD=… cargo run --release
```

Optional:

- `POSTED_WORD_LIST_PATH` — where to persist already-posted words
  (defaults to `./postedWords.txt`)
- `WORD_CACHE_PATH` — optional persistent dictionary response cache
- `POST_INTERVAL_SECONDS` — posting interval, primarily useful for development
  (defaults to `600`)

## How it works

- A sequential Tokio timer fires every 10 minutes
- Picks a random word, retries if it's already in the posted set
- Renders the word as SVG → PNG via `resvg`
- Posts via `bluesky-bot` with descriptive alt text

## Deploy

`railway.json` is included for one-click Railway deploys.

## Test it

```bash
cargo test --all-targets
cargo clippy --all-targets -- -D warnings
```

Render any named design locally with:

```bash
cargo run --bin render-sample -- receipt sample.png
```
