
'use server';

const placeholderThumbnail = 'https://placehold.co/300x150.png';

interface LinkMetadata {
  thumbnailUrl: string;
  pageTitle: string | null;
  faviconUrl: string | null;
}

async function getHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html',
      },
      // signal: AbortSignal.timeout(8000), // Timeout after 8 seconds
    });
    if (!response.ok) {
      console.error(`Failed to fetch URL: ${url}, status: ${response.status}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching URL ${url}:`, error);
    return null;
  }
}

function extractOgImage(html: string, baseUrl: string): string | null {
  const ogImageRegex = /<meta\s+(?:property|name)=["']og:image["']\s+content=["'](.*?)["'][^>]*>/i;
  const match = html.match(ogImageRegex);
  
  if (match && match[1]) {
    let imageUrl = match[1];
    if (imageUrl.startsWith('/')) {
      try {
        const urlObj = new URL(baseUrl);
        imageUrl = `${urlObj.origin}${imageUrl}`;
      } catch (e) {
         console.warn(`Invalid base URL for relative og:image: ${baseUrl}`);
         return null;
      }
    }
    try {
      new URL(imageUrl);
      return imageUrl;
    } catch (e) {
      console.warn(`Invalid og:image URL found: ${imageUrl}`);
      return null;
    }
  }
  return null;
}

function simpleHtmlEntityDecode(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function extractPageTitle(html: string): string | null {
  const titleRegex = /<title[^>]*>(.*?)<\/title>/i;
  const match = html.match(titleRegex);
  if (match && match[1]) {
    let titleText = match[1];
    titleText = simpleHtmlEntityDecode(titleText);
    return titleText.trim() || null;
  }
  return null;
}

function extractFaviconUrl(html: string, baseUrl: string): string | null {
  const regexes = [
    // Look for specific types first for better quality, then general 'icon', then 'shortcut icon'
    // These regexes try to capture href regardless of attribute order relative to rel, but assume href comes after rel or type if present
    /<link(?=[^>]*rel=(["'])(icon)\1)(?=[^>]*type=(["'])image\/svg\+xml\3)[^>]*href=(["'])([^"']+)\4/i,
    /<link(?=[^>]*rel=(["'])(icon)\1)(?=[^>]*type=(["'])image\/png\3)[^>]*href=(["'])([^"']+)\4/i,
    // General icon link (might be before or after href)
    /<link(?=[^>]*rel=(["'])icon\1)[^>]*href=(["'])([^"']+)\2/i,
    /<link(?=[^>]*href=(["'])([^"']+)\1)[^>]*rel=(["'])icon\3/i,
    // Shortcut icon (might be before or after href)
    /<link(?=[^>]*rel=(["'])(shortcut icon)\1)[^>]*href=(["'])([^"']+)\2/i,
    /<link(?=[^>]*href=(["'])([^"']+)\1)[^>]*rel=(["'])(shortcut icon)\3/i,
  ];

  let bestMatch: string | null = null;

  for (const regex of regexes) {
    const match = html.match(regex);
    // The actual href is in different capturing groups depending on the regex
    // For regexes with positive lookaheads capturing groups are for the lookahead contents
    // Need to find the href group correctly. Let's simplify.
  }

  // Simpler regex strategy: find link tags, then parse attributes
  const linkTagMatches = html.matchAll(/<link\s+([^>]+)>/gi);
  const potentialFavicons: { href: string; rel: string; type?: string }[] = [];

  for (const match of linkTagMatches) {
    const attrs = match[1];
    const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
    const relMatch = attrs.match(/rel=["']([^"']+)["']/i);
    const typeMatch = attrs.match(/type=["']([^"']+)["']/i);

    if (hrefMatch && relMatch) {
      const rel = relMatch[1].toLowerCase();
      if (['icon', 'shortcut icon', 'apple-touch-icon'].includes(rel)) {
        potentialFavicons.push({
          href: hrefMatch[1],
          rel: rel,
          type: typeMatch ? typeMatch[1].toLowerCase() : undefined,
        });
      }
    }
  }
  
  // Prioritize favicons: svg > png > other icon > shortcut icon > apple-touch-icon
  const sortedFavicons = potentialFavicons.sort((a, b) => {
    const priority = (pf: { rel: string; type?: string }) => {
      if (pf.rel === 'icon' && pf.type === 'image/svg+xml') return 1;
      if (pf.rel === 'icon' && pf.type === 'image/png') return 2;
      if (pf.rel === 'icon') return 3;
      if (pf.rel === 'shortcut icon') return 4; // Often .ico
      if (pf.rel === 'apple-touch-icon') return 5;
      return 6;
    };
    return priority(a) - priority(b);
  });

  if (sortedFavicons.length > 0) {
    try {
      return new URL(sortedFavicons[0].href, baseUrl).href;
    } catch (e) {
      console.warn(`Invalid favicon href: ${sortedFavicons[0].href} with base ${baseUrl}`, e);
    }
  }

  // Fallback if no <link> tag found, try common /favicon.ico (browser often does this)
  // We won't add this to the action to avoid potentially failing requests here.
  // The client can try this if needed or we can rely on browser default behavior.
  return null;
}


export async function getLinkMetadata(url: string): Promise<LinkMetadata> {
  const defaultMetadata: LinkMetadata = {
    thumbnailUrl: placeholderThumbnail,
    pageTitle: null,
    faviconUrl: null,
  };

  if (!url) return defaultMetadata;

  let normalizedUrl = url;
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }
  
  try {
      new URL(normalizedUrl);
  } catch (e) {
      console.warn(`Invalid URL provided to getLinkMetadata: ${url}`);
      return defaultMetadata;
  }

  const html = await getHtml(normalizedUrl);
  if (!html) {
    return defaultMetadata;
  }

  const thumbnailUrl = extractOgImage(html, normalizedUrl);
  const pageTitle = extractPageTitle(html);
  const faviconUrl = extractFaviconUrl(html, normalizedUrl);

  return {
    thumbnailUrl: thumbnailUrl || placeholderThumbnail,
    pageTitle: pageTitle,
    faviconUrl: faviconUrl,
  };
}
