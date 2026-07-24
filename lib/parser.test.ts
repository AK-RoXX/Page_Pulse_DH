import { describe, it, expect } from 'vitest';
import { parseHtmlMetrics } from './parser';

describe('parseHtmlMetrics', () => {
  // ── 1. Happy Path ───────────────────────────────────────────────────────────
  it('happy path: correctly extracts all metrics from valid HTML with complete tags', () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Page Pulse - AI Website Audit Tool</title>
          <meta name="description" content="High performance website auditor and SEO metrics tool." />
        </head>
        <body>
          <h1>Welcome to Page Pulse</h1>
          <p>Analyze performance, meta descriptions, missing alt tags, and text content fast.</p>
          <img src="/logo.png" alt="Page Pulse Logo" />
          <img src="/banner.png" alt="Banner Graphic" />
        </body>
      </html>
    `;

    const metrics = parseHtmlMetrics(sampleHtml, 200, 150);

    expect(metrics.statusCode).toBe(200);
    expect(metrics.responseTimeMs).toBe(150);
    expect(metrics.title).toBe('Page Pulse - AI Website Audit Tool');
    expect(metrics.metaDescription).toBe('High performance website auditor and SEO metrics tool.');
    expect(metrics.h1Count).toBe(1);
    expect(metrics.imagesMissingAltCount).toBe(0);
    expect(metrics.wordCount).toBe(15);
  });

  // ── 2. Failure Case 1: Missing metadata & minimal/empty HTML ──────────────────
  it('failure case 1: handles missing metadata tags, empty input, and malformed HTML gracefully without crashing', () => {
    const minimalHtml = `<html><body><p>Hello world</p></body></html>`;
    const metricsMinimal = parseHtmlMetrics(minimalHtml, 200, 45);

    expect(metricsMinimal.title).toBeNull();
    expect(metricsMinimal.metaDescription).toBeNull();
    expect(metricsMinimal.h1Count).toBe(0);
    expect(metricsMinimal.imagesMissingAltCount).toBe(0);
    expect(metricsMinimal.wordCount).toBe(2);

    // Empty/non-string HTML safety test
    const metricsEmpty = parseHtmlMetrics('', 500, 0);
    expect(metricsEmpty.title).toBeNull();
    expect(metricsEmpty.metaDescription).toBeNull();
    expect(metricsEmpty.h1Count).toBe(0);
    expect(metricsEmpty.imagesMissingAltCount).toBe(0);
    expect(metricsEmpty.wordCount).toBe(0);
  });

  // ── 3. Failure Case 2: Missing or empty alt attributes on images ───────────────
  it('failure case 2: accurately counts images with missing, empty, or whitespace-only alt attributes', () => {
    const htmlWithBadImages = `
      <html>
        <head><title>Test Page</title></head>
        <body>
          <h1>Multiple Headers</h1>
          <h1>Second Header</h1>
          <!-- Missing alt attribute -->
          <img src="/img1.png" />
          <!-- Empty alt attribute -->
          <img src="/img2.png" alt="" />
          <!-- Whitespace-only alt attribute -->
          <img src="/img3.png" alt="   " />
          <!-- Valid alt attribute -->
          <img src="/img4.png" alt="Valid Description" />
        </body>
      </html>
    `;

    const metrics = parseHtmlMetrics(htmlWithBadImages, 200, 80);

    expect(metrics.title).toBe('Test Page');
    expect(metrics.h1Count).toBe(2);
    expect(metrics.imagesMissingAltCount).toBe(3);
  });

  // ── 4. Edge Case: Code Noise Filtering in Word Count ─────────────────────────
  it('edge case: filters out <script>, <style>, and <svg> noise when calculating body word count', () => {
    const noisyHtml = `
      <html>
        <head>
          <style>body { color: red; margin: 0; padding: 0; }</style>
        </head>
        <body>
          <h1>Headline Here</h1>
          <script>console.log("var x = 10; function test() {}");</script>
          <svg><path d="M10 10 L20 20"></path></svg>
          <p>Real visible content for users to read.</p>
        </body>
      </html>
    `;

    const metrics = parseHtmlMetrics(noisyHtml, 200, 100);

    expect(metrics.wordCount).toBe(9);
  });
});
