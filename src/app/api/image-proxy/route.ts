
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('URL parameter is missing', { status: 400 });
  }

  try {
    // Validate the URL to prevent potential SSRF issues if needed,
    // though for image proxying, it's generally about fetching the image content.
    // For simplicity, we'll assume the URL is a valid image URL for now.
    new URL(imageUrl);
  } catch (error) {
    return new NextResponse('Invalid URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        // Mimic a browser User-Agent to help with sites that might block simple fetch requests
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch image: ${imageUrl}, status: ${response.status}`);
      // You could return a default placeholder image here if you have one locally
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg'; // Default to jpeg if not specified

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable', // Cache for 1 day
      },
    });
  } catch (error) {
    console.error(`Error proxying image ${imageUrl}:`, error);
    // You could return a default placeholder image here
    return new NextResponse('Error proxying image', { status: 500 });
  }
}
