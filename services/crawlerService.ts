/**
 * Advanced CORS proxy configuration with multiple fallback options
 */
const PROXY_CONFIGS = [
  {
    name: "AllOrigins",
    generator: (target: string) =>
      `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
  },
  {
    name: "CorsProxy",
    generator: (target: string) =>
      `https://corsproxy.io/?${encodeURIComponent(target)}`,
  },
  {
    name: "ThingProxy",
    generator: (target: string) =>
      `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(target)}`,
  },
  {
    name: "ProxyCors",
    generator: (target: string) => `https://proxy.cors.sh/${target}`,
  },
];

/**
 * Attempts to fetch a URL with retry logic and multiple strategies
 */
const fetchWithRetry = async (
  url: string,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<Response> => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }

    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, delayMs * (attempt + 1))
      );
    }
  }

  throw lastError;
};

/**
 * Fetches the raw HTML content of a URL using a CORS proxy.
 * Implements a fallback strategy to try multiple proxies if one is blocked.
 */
export const fetchPageContent = async (
  url: string
): Promise<{ text: string; html: string; title: string }> => {
  let lastError: Error | null = null;
  const errors: Array<{ proxy: string; error: string }> = [];

  // Strategy 1: Try direct fetch first (some sites don't have CORS restrictions)
  try {
    console.log(`[Fetch] Attempting direct fetch: ${url}`);
    const response = await fetchWithRetry(url, 1, 500);
    const html = await response.text();

    if (html && html.length > 50) {
      console.log(`[Fetch] ✓ Direct fetch succeeded`);
      return parseHtmlContent(html, url);
    }
  } catch (error) {
    console.log(
      `[Fetch] Direct fetch failed (expected for CORS-protected sites)`
    );
    errors.push({ proxy: "Direct", error: String(error) });
  }

  // Strategy 2: Try each proxy with retry logic
  for (const proxyConfig of PROXY_CONFIGS) {
    try {
      const proxyUrl = proxyConfig.generator(url);
      console.log(`[Fetch] Attempting via ${proxyConfig.name}...`);

      const response = await fetchWithRetry(proxyUrl, 2, 800);
      const html = await response.text();

      // Validate response
      if (!html || html.length < 50) {
        throw new Error("Empty or invalid response");
      }

      // Check if we got an error page instead of actual content
      if (html.includes("Access Denied") || html.includes("403 Forbidden")) {
        throw new Error("Proxy returned access denied page");
      }

      console.log(`[Fetch] ✓ Success via ${proxyConfig.name}`);
      return parseHtmlContent(html, url);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`[Fetch] ${proxyConfig.name} failed:`, errorMsg);
      errors.push({ proxy: proxyConfig.name, error: errorMsg });
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    // Small delay between proxy attempts to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // All strategies failed
  console.error("[Fetch] All fetch strategies exhausted:", errors);
  throw new Error(
    `Unable to access this page after trying ${
      PROXY_CONFIGS.length + 1
    } methods. ` +
      `The website may have strong anti-bot protection or all proxy services are temporarily unavailable.`
  );
};

/**
 * Parses HTML content and extracts text, maintaining the title and meta description
 */
const parseHtmlContent = (
  html: string,
  url: string
): { text: string; html: string; title: string } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove scripts, styles, and other non-content elements
  const scripts = doc.querySelectorAll(
    "script, style, noscript, iframe, svg, header, footer, nav, aside"
  );
  scripts.forEach((script) => script.remove());

  const title = doc.title || url;

  // Extract meta description
  const metaDesc =
    doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
    "";

  let bodyText = (doc.body.textContent || "").replace(/\s+/g, " ").trim();

  const fullText = metaDesc ? `${metaDesc}\n\n${bodyText}` : bodyText;

  return { text: fullText, html, title };
};

/**
 * Extracts links from the HTML content to simulate crawling
 */
export const extractLinks = (html: string, baseUrl: string): string[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const anchors = doc.querySelectorAll("a[href]");

  const links = new Set<string>();
  let baseOrigin: string;

  try {
    baseOrigin = new URL(baseUrl).origin;
  } catch (e) {
    return [];
  }

  anchors.forEach((a) => {
    const href = a.getAttribute("href");
    if (href) {
      try {
        const fullUrl = new URL(href, baseUrl).href;
        // Only crawl internal links
        if (
          fullUrl.startsWith(baseOrigin) &&
          !fullUrl.includes("#") &&
          !fullUrl.match(/\.(pdf|jpg|png|gif|zip)$/i)
        ) {
          links.add(fullUrl);
        }
      } catch (e) {
        // Invalid URL, ignore
      }
    }
  });

  return Array.from(links);
};

// Helper for proxy fetching text content for sitemaps and XML files
const fetchTextViaProxy = async (
  url: string,
  onProgress?: (message: string) => void
): Promise<string | null> => {
  const errors: Array<{ proxy: string; error: string }> = [];

  // Try direct fetch first for XML files (often publicly accessible)
  try {
    console.log(`[Sitemap] Attempting direct fetch: ${url}`);
    onProgress?.(`Trying to access sitemap directly...`);
    const response = await fetchWithRetry(url, 1, 500);
    if (response.ok) {
      const text = await response.text();
      if (text && text.includes("<?xml")) {
        console.log(`[Sitemap] ✓ Direct fetch succeeded`);
        return text;
      }
    }
  } catch (e) {
    console.log(`[Sitemap] Direct fetch failed, trying proxies...`);
    errors.push({
      proxy: "Direct",
      error: e instanceof Error ? e.message : String(e),
    });
  }

  // Try each proxy with better error handling
  for (const proxyConfig of PROXY_CONFIGS) {
    try {
      const proxyUrl = proxyConfig.generator(url);
      console.log(`[Sitemap] Attempting via ${proxyConfig.name}...`);
      onProgress?.(`Attempting via ${proxyConfig.name} proxy...`);

      const response = await fetchWithRetry(proxyUrl, 2, 800);
      if (response.ok) {
        const text = await response.text();

        // Validate it's actually XML content
        if (
          text &&
          (text.includes("<?xml") ||
            text.includes("<urlset") ||
            text.includes("<sitemapindex"))
        ) {
          console.log(`[Sitemap] ✓ Success via ${proxyConfig.name}`);
          return text;
        } else {
          throw new Error("Response doesn't appear to be valid XML");
        }
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.warn(`[Sitemap] ${proxyConfig.name} failed:`, errorMsg);
      errors.push({ proxy: proxyConfig.name, error: errorMsg });
    }

    // Small delay between attempts
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.warn(`[Sitemap] All attempts failed for ${url}:`, errors);
  return null;
};

// Recursive sitemap parser to handle Sitemap Indexes
const parseSitemapRecursive = async (
  sitemapUrl: string,
  origin: string,
  visited = new Set<string>(),
  onProgress?: (message: string) => void
): Promise<string[]> => {
  if (visited.has(sitemapUrl)) return [];
  visited.add(sitemapUrl);

  onProgress?.(`Parsing sitemap: ${sitemapUrl.split("/").pop()}`);
  const xmlText = await fetchTextViaProxy(sitemapUrl, onProgress);
  if (!xmlText) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  const foundUrls: string[] = [];

  // 1. Handle Sitemap Index (nested sitemaps)
  const sitemapLocs = Array.from(doc.querySelectorAll("sitemap > loc"));
  if (sitemapLocs.length > 0) {
    onProgress?.(`Found ${sitemapLocs.length} nested sitemap(s), parsing...`);
    const promises = sitemapLocs.map((node) => {
      const url = node.textContent?.trim();
      if (url) return parseSitemapRecursive(url, origin, visited, onProgress);
      return Promise.resolve([]);
    });
    const results = await Promise.all(promises);
    return results.flat();
  }

  // 2. Handle Standard Urlset
  const urlLocs = Array.from(doc.querySelectorAll("url > loc"));
  urlLocs.forEach((node) => {
    const loc = node.textContent?.trim();
    if (loc && loc.startsWith(origin)) {
      if (!loc.match(/\.(pdf|jpg|png|gif|zip)$/i)) {
        foundUrls.push(loc);
      }
    }
  });

  return foundUrls;
};

// Try to fetch sitemap from common locations
const fetchSitemapUrls = async (
  targetUrl: string,
  onProgress?: (message: string) => void
): Promise<string[]> => {
  const origin = new URL(targetUrl).origin;
  const candidates = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/page-sitemap.xml`,
  ];

  for (const url of candidates) {
    onProgress?.(`Checking for sitemap at ${url.split("/").pop()}`);
    const urls = await parseSitemapRecursive(
      url,
      origin,
      new Set(),
      onProgress
    );
    if (urls.length > 0) {
      return Array.from(new Set(urls));
    }
  }
  return [];
};

/**
 * Main discovery function with improved error handling and user feedback
 */
export const discoverUrls = async (
  targetUrl: string,
  onProgress?: (message: string) => void
): Promise<string[]> => {
  console.log(`[Discovery] Starting URL discovery for: ${targetUrl}`);

  // 1. Try Sitemap (most efficient method)
  try {
    console.log(`[Discovery] Attempting sitemap discovery...`);
    onProgress?.(`Searching for sitemaps...`);
    const sitemapUrls = await fetchSitemapUrls(targetUrl, onProgress);
    if (sitemapUrls.length > 0) {
      console.log(
        `[Discovery] ✓ Discovered ${sitemapUrls.length} URLs via sitemap`
      );
      return sitemapUrls.sort();
    }
    console.log(`[Discovery] No sitemap found or sitemap was empty`);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.warn(`[Discovery] Sitemap discovery failed: ${errorMsg}`);
  }

  // 2. Fallback: Homepage Crawl
  try {
    console.log(`[Discovery] Falling back to homepage link extraction...`);
    const { html } = await fetchPageContent(targetUrl);
    const crawledLinks = extractLinks(html, targetUrl);
    const uniqueLinks = Array.from(new Set([targetUrl, ...crawledLinks]));
    console.log(
      `[Discovery] ✓ Found ${uniqueLinks.length} URLs via homepage crawl`
    );
    return uniqueLinks.sort();
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error(`[Discovery] Homepage crawl failed: ${errorMsg}`);

    // Last resort: return just the target URL
    console.log(
      `[Discovery] Returning target URL only - user can still attempt to scan it`
    );
    return [targetUrl];
  }
};
