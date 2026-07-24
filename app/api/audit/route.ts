import { NextRequest, NextResponse } from 'next/server';
import { parseHtmlMetrics } from '@/lib/parser';

export async function POST(req: NextRequest) {
  let body: { url?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload in request body.' },
      { status: 400 }
    );
  }

  const { url } = body;

  if (!url || typeof url !== 'string') {
    return NextResponse.json(
      { error: 'URL field is required and must be a string.' },
      { status: 400 }
    );
  }

  let parsedUrl: URL;
  try {
    // Standardize URL protocol if user omitted it
    const formattedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    parsedUrl = new URL(formattedUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Unsupported protocol');
    }
  } catch {
    return NextResponse.json(
      { error: 'Malformed URL provided. Please provide a valid HTTP or HTTPS URL.' },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const startTime = Date.now();

  try {
    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PagePulseBot/1.0 (+https://digitalheroesco.com)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('text/html')) {
      return NextResponse.json(
        {
          error: `Target server responded with unsupported Content-Type: '${contentType}'. Expected 'text/html'.`,
        },
        { status: 422 }
      );
    }

    const html = await response.text();
    const metrics = parseHtmlMetrics(html, response.status, responseTimeMs);

    return NextResponse.json(metrics, { status: 200 });
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. The target URL took longer than 8 seconds to respond.' },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to reach network host. Network failure or DNS resolution issue.' },
      { status: 502 }
    );
  }
}
