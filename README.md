# Page Pulse — High Performance Web Auditor

Page Pulse is a web application designed to audit URLs for essential HTTP, SEO, performance, and structure metrics in real time.

Built for **Digital Heroes Training Task**. [https://digitalheroesco.com](https://digitalheroesco.com)  

Live Demo: [https://page-pulse-dh.vercel.app](https://page-pulse-dh.vercel.app) 

---

## 🛠️ Tech Stack & Setup

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Lucide Icons + Glassmorphism / Cyberpunk Aesthetics
- **Parsing**: Cheerio (Server-side HTML scraping)
- **Testing**: Vitest
- **Exporting**: jsPDF (Native vector PDF report generation)

### Installation & Local Run

```bash
# 1. Clone the repository & install dependencies
npm install

# 2. Run unit tests
npm run test

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 API Contract (`POST /api/audit`)

### Request Body
```json
{
  "url": "https://example.com"
}
```

### Response `200 OK`
```json
{
  "statusCode": 200,
  "responseTimeMs": 142,
  "title": "Example Domain",
  "metaDescription": "Example domain for illustrative examples in documents.",
  "h1Count": 1,
  "imagesMissingAltCount": 0,
  "wordCount": 125
}
```

### Strict Error Responses (Never Crashes)

- **`400 Bad Request`**: Malformed URL or non-string input.
- **`422 Unprocessable Entity`**: Target server responded with non-HTML content (e.g. `application/json` or binary).
- **`502 Bad Gateway`**: Host unreachable, network failure, or DNS resolution failure.
- **`504 Gateway Timeout`**: Target URL took longer than **8 seconds** to respond.

---

## 💡 3 Key Design Decisions & Technical Reasoning

### 1. Isolated Pure Parser Function (`lib/parser.ts`)
- **Reasoning**: Decoupling Cheerio DOM manipulation from Next.js request/response handling guarantees that parsing logic is 100% testable in isolation without mocking HTTP contexts.

### 2. Direct Vector PDF Rendering via `jsPDF`
- **Reasoning**: DOM-to-canvas rendering libraries like `html2canvas` often fail due to CORS asset security, canvas font rendering quirks, or layout overflow. Direct vector drawing in `jsPDF` ensures lightning-fast, crisp, 100% reliable PDF exports across all browsers.

### 3. Native `fetch` with `AbortController` (8s Timeout)
- **Reasoning**: Using native `fetch` with an explicit `AbortController` signal prevents backend Node.js worker pool exhaustion when auditing slow or unresponsive servers.

---

## 🧪 Testing Suite (`lib/parser.test.ts`)

Run tests with:
```bash
npm run test
```

### Covered Test Scenarios:
1. **Happy Path**: Complete valid HTML with all expected tags (`<title>`, `<meta>`, `<h1>`, `<img>` with alt).
2. **Failure Case 1 (Missing Tags & Empty HTML)**: Handles missing metadata, missing tags, and empty/broken HTML without crashing.
3. **Failure Case 2 (Missing or Blank `alt` Attributes)**: Accurately identifies `<img>` tags missing `alt`, empty `alt=""`, or whitespace-only `alt="   "`.
4. **Edge Case (Code Noise Filtering)**: Ignores `<script>`, `<style>`, and `<svg>` contents when calculating body word count.
