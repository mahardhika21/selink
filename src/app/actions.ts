
'use server';

const placeholderThumbnail = 'https://placehold.co/300x150.png';

async function getHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html',
      },
      // Add a timeout to prevent hanging indefinitely
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
    // Resolve relative URLs
    if (imageUrl.startsWith('/')) {
      const urlObj = new URL(baseUrl);
      imageUrl = `${urlObj.origin}${imageUrl}`;
    }
    try {
      // Validate if it's a proper URL
      new URL(imageUrl);
      return imageUrl;
    } catch (e) {
      console.warn(`Invalid og:image URL found: ${imageUrl}`);
      return null;
    }
  }
  return null;
}

export async function getLinkThumbnailUrl(url: string): Promise<string> {
  if (!url) return placeholderThumbnail;

  let normalizedUrl = url;
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const html = await getHtml(normalizedUrl);
  if (!html) {
    return placeholderThumbnail;
  }

  const thumbnailUrl = extractOgImage(html, normalizedUrl);
  return thumbnailUrl || placeholderThumbnail;
}
