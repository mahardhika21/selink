
'use server';

interface LinkMetadata {
  thumbnailUrl: string | null;
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
  // Allows for optional spaces around the equals sign for more robust parsing
  const regex = new RegExp(`${attributeName}\\s*=\\s*["']([^"']+)["']`, 'i');
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

  let imageUrl = ogImage || twitterImage;

  if (imageUrl) {
    try {
      const absoluteUrl = new URL(imageUrl, baseUrl).href;
      new URL(absoluteUrl); // Validate the absolute URL
      return absoluteUrl;
    } catch (e) {
      console.warn(`Invalid or unresolvable preview image URL found: ${imageUrl} with base ${baseUrl}`);
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
  
  const sortedFavicons = potentialFavicons.sort((a, b) => {
    const priority = (pf: { rel: string; type?: string; sizes?: string }) => {
      if (pf.rel === 'icon' && pf.type === 'image/svg+xml') return 1;
      if (pf.rel === 'icon' && pf.type === 'image/png' && pf.sizes && (pf.sizes.includes('32x32') || pf.sizes.includes('64x64'))) return 2;
      if (pf.rel === 'icon' && pf.type === 'image/png') return 3;
      if (pf.rel === 'icon') return 4; 
      if (pf.rel === 'shortcut icon') return 5; 
      if (pf.rel === 'apple-touch-icon') return 6;
      return 7;
    };
    return priority(a) - priority(b);
  });

  if (sortedFavicons.length > 0) {
    for (const fav of sortedFavicons) {
      try {
        const absoluteUrl = new URL(fav.href, baseUrl).href;
        new URL(absoluteUrl); 
        return absoluteUrl;
      } catch (e) {
        // Try next potential favicon if current one is invalid
      }
    }
    console.warn(`All potential favicon hrefs were invalid or unresolvable for base ${baseUrl}`);
  }
  return null;
}


export async function getLinkMetadata(url: string): Promise<LinkMetadata> {
  const defaultMetadata: LinkMetadata = {
    thumbnailUrl: null,
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
      console.warn(`Invalid URL provided to getLinkMetadata after normalization: ${url}`);
      return defaultMetadata;
  }

  const html = await getHtml(normalizedUrl);
  if (!html) {
    return defaultMetadata;
  }

  let thumbnailUrl: string | null = extractPreviewImageUrl(html, normalizedUrl);
  if (thumbnailUrl) {
    try {
      new URL(thumbnailUrl); 
    } catch (e) {
      console.warn(`Invalid thumbnail URL extracted: ${thumbnailUrl}. Setting thumbnail to null.`);
      thumbnailUrl = null; 
    }
  }

  const pageTitle = extractPageTitle(html);
  
  const registeredHostnames = await getRegisteredHostnames();
  let faviconUrl: string | null = extractFaviconUrl(html, normalizedUrl);
  if (faviconUrl) {
    try {
      const faviconHostname = new URL(faviconUrl).hostname;
      if (!registeredHostnames.includes(faviconHostname)) {
        console.warn(`Favicon hostname ${faviconHostname} not registered for favicon. Clearing favicon.`);
        faviconUrl = null;
      }
    } catch (e) {
      console.warn(`Invalid favicon URL ${faviconUrl}. Clearing favicon.`);
      faviconUrl = null;
    }
  }

  return {
    thumbnailUrl: thumbnailUrl,
    pageTitle: pageTitle,
    faviconUrl: faviconUrl,
  };
}

export async function getRegisteredHostnames(): Promise<string[]> {
  const hostnames = [
    'placehold.co', 
    'i.ytimg.com',
    'cdn.dribbble.com',
    'media.cnn.com',
    'akcdn.detik.net.id',
    'awsimages.detik.net.id',
    'cdn0-production-images-kly.akamaized.net',
    'ichef.bbci.co.uk',
    'cdn.prod.website-files.com',
    'animateai.pro',
    'siteforge.io',
    'pebblely.com',
    'yastatic.net',
    'v0chat.vercel.sh',
    's.pinimg.com',
    's2.coinmarketcap.com',
    'preview-kly.akamaized.net',
    'cdn1-production-images-kly.akamaized.net',
    'sc.cnbcfm.com',
    'cdn.cnnindonesia.com',
    'www.youtube.com',
    'huggingface.co',
    'github.githubassets.com',
    'cdn.oaistatic.com',
    'flathub.org',
    'spaceberry.studio',
    'upload.wikimedia.org',
    'img.alicdn.com',
    'cdn.usegalileo.ai',
    'www.deepl.com',
    'i.pinimg.com',
    'd2.alternativeto.net',
    'osmo.b-cdn.net',
    'framerusercontent.com',
    'animejs.com',
    'peoplesgdarchive.org',
    'www.notion.so',
  ];
  return hostnames.sort();
}
