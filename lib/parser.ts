import * as cheerio from 'cheerio';

export interface AuditMetrics {
  statusCode: number;
  responseTimeMs: number;
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  imagesMissingAltCount: number;
  wordCount: number;
}

export function parseHtmlMetrics(
  html: string,
  statusCode: number = 200,
  responseTimeMs: number = 0
): AuditMetrics {
  if (!html || typeof html !== 'string') {
    return {
      statusCode,
      responseTimeMs,
      title: null,
      metaDescription: null,
      h1Count: 0,
      imagesMissingAltCount: 0,
      wordCount: 0,
    };
  }

  const $ = cheerio.load(html);

  // Extract <title>
  const rawTitle = $('title').first().text().trim();
  const title = rawTitle.length > 0 ? rawTitle : null;

  // Extract <meta name="description"> — the `i` flag covers case-insensitivity, single selector sufficient
  const rawMetaDesc = $('meta[name="description" i]').attr('content');
  const metaDescription = rawMetaDesc && rawMetaDesc.trim().length > 0 ? rawMetaDesc.trim() : null;

  // H1 count
  const h1Count = $('h1').length;

  // Count <img> tags missing alt attribute or where alt is empty/whitespace
  let imagesMissingAltCount = 0;
  $('img').each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined || alt === null || alt.trim() === '') {
      imagesMissingAltCount++;
    }
  });

  // Approximate body text word count — remove noise-generating tags first
  $('script, style, noscript, svg').remove();
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;

  return {
    statusCode,
    responseTimeMs,
    title,
    metaDescription,
    h1Count,
    imagesMissingAltCount,
    wordCount,
  };
}
