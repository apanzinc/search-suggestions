# Search Suggestions API

An API that parses search suggestions from a number of search providers. Might not live very long depending on the volatility of their APIs. Here's the list of available search providers:

-   Google ( w/ presentations )
-   Yahoo ( w/ presentations )
-   Brave ( w/ presentations )
-   Bing ( w/ presentations )
-   Duckduckgo
-   Qwant
-   Baidu

Live API: https://suggest.apanzinc.top/

## How to use

#### Endpoint
```HTTP
GET /
```

| Parameter | Role            | Requirement |
|-----------|-----------------|-------------|
| `q`       | Search query    | required    |
| `l`       | Localization    | optional    |
| `with`    | Search provider | optional    |

#### Response
```ts
type Response = {
  text: string
  desc?: string // when presentation is available
  image?: string // when presentation is available
}[]
```

### Chinese support

Pass a Chinese locale in `l` to get Simplified Chinese suggestions. All of
`zh`, `zh-CN`, `zh-Hans`, `zh_CN`, `zh-Hans-CN` and `zh-SG` resolve to
Simplified Chinese; `zh-TW`, `zh-Hant`, `zh-HK` and `zh-MO` resolve to
Traditional Chinese. Google, Bing and DuckDuckGo receive the matching region
code (`gl` / `mkt` / `kl`), and `baidu` is available as a China-focused source.

```HTTP
GET /?with=baidu&q=%E6%88%91%E5%9B%BD&l=zh-CN
```

```json
[
  { "text": "我国有多少个省" },
  { "text": "我国境内最晚直立人化石被发现" }
]
```

```HTTP
GET /?with=google&q=minecraft&l=zh-CN
```

### Websockets
Using Clouflare workers, you can also get results using websockets.

```js
const socket = new WebSocket('ws://localhost:8787')

socket.onmessage = function (event: MessageEvent) {
  console.log(JSON.parse(event.data))
}

socket.send(JSON.stringify({ q, with, lang }))
```


## Examples

```HTTP
GET /?q=can%20we%20go%20to
```

```json
[
  { "text": "can we go to heaven with tattoos" },
  { "text": "can we go to mars" },
  { "text": "can we go to saturn" },
  { "text": "can we go to your room now" }
]
```

<br />

```HTTP
GET /?with=google&q=vercel&l=fr
```

```json
[
  {
    "text": "vercel"
  },
  {
    "text": "vercelli",
    "desc": "Verceil — Ville en Italie",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQID9TX_tSffwg1RLvecGtuPHMZWbbEOSx0d6_poXT6bqChYkEazWYz6G1ilQ&s=10"
  },
  {
    "text": "vercel villedieu le camp",
    "desc": "Commune en France",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGB1DiSdJxQgJfHphVKCfENgDCeGWobdbBpErowNFfDEExoFTuRmmPfEVJuQ&s=10"
  },
  {
    "text": "vercel pricing"
  },
  {
    "text": "vercel deploy"
  }
]
```

## Development

- Install [Deno](https://deno.com/)
- Install [NodeJS](https://nodejs.org/en/download)
- Make sure npx is installed with `npx -v`

```bash
npx -v
# 10.9.2

deno install
# ...

deno task test
# Task test deno test --allow-net
# ok | 15 passed | 0 failed (2s)

deno task dev
# Task dev npx wrangler dev
# Need to install the following packages
# ...
# [wrangler:info] Ready on http://localhost:8787

wrangler deploy
```

## Deployment

This project is deployed as a Cloudflare Worker at https://suggest.apanzinc.top/ and is connected to GitHub, so every push to `main` redeploys automatically.

To deploy your own instance with Wrangler:

1. Install Node.js and npx, then log in to your Cloudflare account:

   ```bash
   npx wrangler login
   ```

2. From the repository root, deploy:

   ```bash
   npx wrangler deploy
   ```

   Wrangler reads `wrangler.toml` (`main = "src/worker.ts"`) and publishes the
   worker. It prints a public `https://<name>.<subdomain>.workers.dev` URL.

3. Verify:

   ```bash
   curl "https://<name>.<subdomain>.workers.dev/?with=baidu&q=hello&l=zh-CN"
   ```

To run locally first, use `npx wrangler dev` (serves on `http://localhost:8787`).
To give the worker your own domain, add a `routes` entry to `wrangler.toml`
before deploying.
