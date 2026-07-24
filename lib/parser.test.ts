import { describe, it, expect } from 'vitest';
import { parseHtmlMetrics } from './parser';

describe('parseHtmlMetrics', () => {
  // 1. Happy path (valid HTML with all tags)
  it('correctly parses valid HTML with all expected tags and attributes', () => {
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
    expect(metrics.wordCount).toBeGreaterThan(10);
  });

  // 2. Failure edge case 1: Missing metadata tags & empty HTML structure
  it('handles missing metadata tags and empty or broken HTML gracefully', () => {
    const minimalHtml = `<html><body><p>Hello world</p></body></html>`;

    const metrics = parseHtmlMetrics(minimalHtml, 200, 45);

    expect(metrics.title).toBeNull();
    expect(metrics.metaDescription).toBeNull();
    expect(metrics.h1Count).toBe(0);
    expect(metrics.imagesMissingAltCount).toBe(0);
    expect(metrics.wordCount).toBe(2);
  });

  // 3. Failure edge case 2: Images missing alt or having empty alt attributes
  it('accurately counts images missing alt tags or containing whitespace-only alt attributes', () => {
    const htmlWithBadImages = `
      <html>
        <head><title>Test Page</title></head>
        <body>
          <h1>Multiple Headers</h1>
          <h1>Second Header</h1>
          <img src="/img1.png" />
          <img src="/img2.png" alt="" />
          <img src="/img3.png" alt="   " />
          <img src="/img4.png" alt="Valid Description" />
        </body>
      </html>
    `;

    const metrics = parseHtmlMetrics(htmlWithBadImages, 200, 80);

    expect(metrics.title).toBe('Test Page');
    expect(metrics.h1Count).toBe(2);
    expect(metrics.imagesMissingAltCount).toBe(3);
  });
});
