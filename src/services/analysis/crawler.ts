import { chromium, Browser, Page } from "playwright";
import * as cheerio from "cheerio";

export interface CrawlResult {
  html: string;
  text: string;
  screenshot?: Buffer;
  loadTime: number;
  pageSize: number;
  url: string;
  finalUrl: string;
}

export interface PageMetadata {
  title: string | null;
  description: string | null;
  keywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonical: string | null;
}

export interface HeaderStructure {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
}

export interface SchemaMarkup {
  types: string[];
  data: Record<string, unknown>[];
}

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
    });
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export async function crawlPage(url: string): Promise<CrawlResult> {
  const browserInstance = await getBrowser();
  const context = await browserInstance.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    const startTime = Date.now();

    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // 추가 로딩 대기 (최대 5초)
    await page.waitForTimeout(3000);

    const loadTime = Date.now() - startTime;

    // 페이지 로딩 완료 대기
    await page.waitForLoadState("domcontentloaded");

    const html = await page.content();
    const text = await page.evaluate(() => document.body?.innerText || "");

    // 스크린샷 캡처
    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
    });

    const pageSize = Buffer.byteLength(html, "utf8");
    const finalUrl = page.url();

    return {
      html,
      text,
      screenshot,
      loadTime,
      pageSize,
      url,
      finalUrl,
    };
  } finally {
    await context.close();
  }
}

export function extractMetadata(html: string): PageMetadata {
  const $ = cheerio.load(html);

  return {
    title: $("title").text() || null,
    description: $('meta[name="description"]').attr("content") || null,
    keywords: $('meta[name="keywords"]').attr("content") || null,
    ogTitle: $('meta[property="og:title"]').attr("content") || null,
    ogDescription: $('meta[property="og:description"]').attr("content") || null,
    ogImage: $('meta[property="og:image"]').attr("content") || null,
    canonical: $('link[rel="canonical"]').attr("href") || null,
  };
}

export function extractHeaders(html: string): HeaderStructure {
  const $ = cheerio.load(html);

  const getHeaders = (tag: string): string[] => {
    const headers: string[] = [];
    $(tag).each((_, el) => {
      const text = $(el).text().trim();
      if (text) headers.push(text);
    });
    return headers;
  };

  return {
    h1: getHeaders("h1"),
    h2: getHeaders("h2"),
    h3: getHeaders("h3"),
    h4: getHeaders("h4"),
    h5: getHeaders("h5"),
    h6: getHeaders("h6"),
  };
}

export function extractSchemaMarkup(html: string): SchemaMarkup {
  const $ = cheerio.load(html);
  const schemas: Record<string, unknown>[] = [];
  const types: string[] = [];

  // JSON-LD 스키마 추출
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html();
      if (content) {
        const data = JSON.parse(content);
        schemas.push(data);

        // 타입 추출
        if (data["@type"]) {
          if (Array.isArray(data["@type"])) {
            types.push(...data["@type"]);
          } else {
            types.push(data["@type"]);
          }
        }
      }
    } catch {
      // JSON 파싱 실패 무시
    }
  });

  return {
    types: [...new Set(types)],
    data: schemas,
  };
}

export function extractLinks(html: string, baseUrl: string): { internal: string[]; external: string[] } {
  const $ = cheerio.load(html);
  const internal: string[] = [];
  const external: string[] = [];

  try {
    const base = new URL(baseUrl);

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      try {
        const url = new URL(href, baseUrl);
        if (url.hostname === base.hostname) {
          internal.push(url.href);
        } else {
          external.push(url.href);
        }
      } catch {
        // 잘못된 URL 무시
      }
    });
  } catch {
    // baseUrl 파싱 실패
  }

  return {
    internal: [...new Set(internal)],
    external: [...new Set(external)],
  };
}
