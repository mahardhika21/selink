
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

function getAttributeValue(attributesString: string, attributeName: string): string | null {
  const regex = new RegExp(`${attributeName}=["']([^"']+)["']`, 'i');
  const match = attributesString.match(regex);
  return match ? match[1] : null;
}

function extractPreviewImageUrl(html: string, baseUrl: string): string | null {
  const metaTagMatches = html.matchAll(/<meta\s+([^>]+)>/gi);
  let ogImage: string | null = null;
  let twitterImage: string | null = null;

  for (const match of metaTagMatches) {
    const attrsString = match[1];
    const property = getAttributeValue(attrsString, 'property');
    const name = getAttributeValue(attrsString, 'name');
    const content = getAttributeValue(attrsString, 'content');

    if (content) {
      if (property === 'og:image' || name === 'og:image') {
        ogImage = content;
      }
      if (property === 'twitter:image' || name === 'twitter:image') {
        twitterImage = content;
      }
    }
  }

  let imageUrl = ogImage || twitterImage; // Prioritize og:image

  if (imageUrl) {
    if (imageUrl.startsWith('/')) {
      try {
        const urlObj = new URL(baseUrl);
        imageUrl = `${urlObj.origin}${imageUrl}`;
      } catch (e) {
         console.warn(`Invalid base URL for relative preview image: ${baseUrl}`);
         return null;
      }
    }
    try {
      new URL(imageUrl); // Validate if it's a proper URL
      return imageUrl;
    } catch (e) {
      console.warn(`Invalid preview image URL found: ${imageUrl}`);
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
  const linkTagMatches = html.matchAll(/<link\s+([^>]+)>/gi);
  const potentialFavicons: { href: string; rel: string; type?: string; sizes?: string }[] = [];

  for (const match of linkTagMatches) {
    const attrsString = match[1];
    const href = getAttributeValue(attrsString, 'href');
    const rel = getAttributeValue(attrsString, 'rel');
    
    if (href && rel) {
      const lowerRel = rel.toLowerCase();
      if (['icon', 'shortcut icon', 'apple-touch-icon'].includes(lowerRel)) {
        potentialFavicons.push({
          href: href,
          rel: lowerRel,
          type: getAttributeValue(attrsString, 'type')?.toLowerCase(),
          sizes: getAttributeValue(attrsString, 'sizes'),
        });
      }
    }
  }
  
  // Prioritize favicons: svg > png > specific sizes > other icon > shortcut icon > apple-touch-icon
  const sortedFavicons = potentialFavicons.sort((a, b) => {
    const priority = (pf: { rel: string; type?: string; sizes?: string }) => {
      if (pf.rel === 'icon' && pf.type === 'image/svg+xml') return 1;
      if (pf.rel === 'icon' && pf.type === 'image/png' && pf.sizes && (pf.sizes.includes('32x32') || pf.sizes.includes('64x64'))) return 2;
      if (pf.rel === 'icon' && pf.type === 'image/png') return 3;
      if (pf.rel === 'icon') return 4; // other icon types
      if (pf.rel === 'shortcut icon') return 5; // Often .ico
      if (pf.rel === 'apple-touch-icon') return 6;
      return 7;
    };
    return priority(a) - priority(b);
  });

  if (sortedFavicons.length > 0) {
    try {
      return new URL(sortedFavicons[0].href, baseUrl).href;
    } catch (e) {
      // Try the next one if the first is invalid
      for (let i = 1; i < sortedFavicons.length; i++) {
        try {
          return new URL(sortedFavicons[i].href, baseUrl).href;
        } catch (e2) {
          // continue
        }
      }
      console.warn(`All potential favicon hrefs were invalid for base ${baseUrl}`);
    }
  }
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

  const thumbnailUrl = extractPreviewImageUrl(html, normalizedUrl);
  const pageTitle = extractPageTitle(html);
  const faviconUrl = extractFaviconUrl(html, normalizedUrl);

  return {
    thumbnailUrl: thumbnailUrl || placeholderThumbnail,
    pageTitle: pageTitle,
    faviconUrl: faviconUrl,
  };
}

