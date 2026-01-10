/**
 * Fetches the raw HTML content of a URL using a CORS proxy.
 * Implements a fallback strategy to try multiple proxies if one is blocked.
 */
export const fetchPageContent = async (
  url: string
): Promise<{ text: string; html: string; title: string }> => {
  // list of proxies to try in order
  const proxies = [
    (target: string) =>
      `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
    (target: string) => `https://corsproxy.io/?${encodeURIComponent(target)}`,
  ];

  let lastError;

  for (const proxyGen of proxies) {
    try {
      const proxyUrl = proxyGen(url);
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`Proxy status: ${response.status}`);
      }

      const html = await response.text();

      // Basic validation to ensure we actually got HTML and not a proxy error page
      if (!html || html.length < 50) {
        throw new Error("Empty or invalid response");
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Remove scripts, styles, and other non-content elements to clean up the text
      const scripts = doc.querySelectorAll(
        "script, style, noscript, iframe, svg, header, footer, nav, aside"
      );
      scripts.forEach((script) => script.remove());

      const title = doc.title || url;

      // Get text content, normalizing whitespace
      // We also look for meta description as it's often important
      const metaDesc =
        doc
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "";

      let bodyText = (doc.body.textContent || "").replace(/\s+/g, " ").trim();

      // If body is extremely short, it might be a JS-rendered app that didn't hydrate.
      // We return what we have, but the analysis might be brief.

      const fullText = metaDesc ? `${metaDesc}\n\n${bodyText}` : bodyText;

      return { text: fullText, html, title };
    } catch (error) {
      console.warn(`Proxy attempt failed for ${url}:`, error);
      lastError = error;
      // Continue to next proxy
    }
  }

  console.error("All proxies failed:", lastError);
  throw new Error(
    `Could not access this page. The website likely blocks automated access.`
  );
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

// Helper for proxy fetching text content for sitemaps
const fetchTextViaProxy = async (url: string): Promise<string | null> => {
  const proxies = [
    (target: string) =>
      `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
    (target: string) => `https://corsproxy.io/?${encodeURIComponent(target)}`,
  ];

  for (const proxyGen of proxies) {
    try {
      const response = await fetch(proxyGen(url));
      if (response.ok) return await response.text();
    } catch (e) {
      // ignore and try next
    }
  }
  return null;
};

// Recursive sitemap parser to handle Sitemap Indexes
const parseSitemapRecursive = async (
  sitemapUrl: string,
  origin: string,
  visited = new Set<string>()
): Promise<string[]> => {
  if (visited.has(sitemapUrl)) return [];
  visited.add(sitemapUrl);

  const xmlText = await fetchTextViaProxy(sitemapUrl);
  if (!xmlText) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  const foundUrls: string[] = [];

  // 1. Handle Sitemap Index (nested sitemaps)
  const sitemapLocs = Array.from(doc.querySelectorAll("sitemap > loc"));
  if (sitemapLocs.length > 0) {
    const promises = sitemapLocs.map((node) => {
      const url = node.textContent?.trim();
      if (url) return parseSitemapRecursive(url, origin, visited);
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
      if (!loc.match(/\.(jpg|jpeg|png|gif|pdf|xml|css|js|zip|rar)$/i)) {
        foundUrls.push(loc);
      }
    }
  });

  return foundUrls;
};

/**
 * Attempts to fetch and parse sitemaps (including indexes)
 */
export const fetchSitemapUrls = async (baseUrl: string): Promise<string[]> => {
  let origin: string;
  try {
    origin = new URL(baseUrl).origin;
  } catch (e) {
    return [];
  }

  const candidates = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/wp-sitemap.xml`,
  ];

  for (const url of candidates) {
    const urls = await parseSitemapRecursive(url, origin);
    if (urls.length > 0) {
      return Array.from(new Set(urls));
    }
  }
  return [];
};

/**
 * Main discovery function
 */
export const discoverUrls = async (targetUrl: string): Promise<string[]> => {
  // 1. Try Sitemap
  try {
    const sitemapUrls = await fetchSitemapUrls(targetUrl);
    if (sitemapUrls.length > 0) {
      console.log(`Discovered ${sitemapUrls.length} URLs via sitemap.`);
      return sitemapUrls.sort();
    }
  } catch (e) {
    console.warn("Sitemap discovery failed, falling back to crawl.", e);
  }

  // 2. Fallback: Homepage Crawl
  try {
    console.log("Falling back to homepage crawl.");
    const { html } = await fetchPageContent(targetUrl);
    const crawledLinks = extractLinks(html, targetUrl);
    const uniqueLinks = Array.from(new Set([targetUrl, ...crawledLinks]));
    return uniqueLinks.sort();
  } catch (e) {
    console.error("Discovery failed completely", e);
    // Even if discovery fails, we return the targetUrl so the user can at least scan the homepage
    // The specific error will be caught when they try to analyze that page
    return [targetUrl];
  }
};
