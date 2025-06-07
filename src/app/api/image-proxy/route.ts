
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('URL parameter is missing', { status: 400 });
  }

  try {
    new URL(imageUrl);
  } catch (error) {
    return new NextResponse('Invalid URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch image via proxy: ${imageUrl}, status: ${response.status}`);
      return new NextResponse(null, { status: response.status }); // Return null body with original error status
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg'; 

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable', 
      },
    });
  } catch (error) {
    console.error(`Error proxying image ${imageUrl}:`, error);
    return new NextResponse(null, { status: 500 }); // Return null body for generic server errors
  }
}
