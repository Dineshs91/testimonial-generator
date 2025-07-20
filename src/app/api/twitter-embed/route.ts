import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tweetUrl } = await request.json();
    
    if (!tweetUrl) {
      return NextResponse.json({ error: 'Tweet URL is required' }, { status: 400 });
    }

    const encodedUrl = encodeURIComponent(tweetUrl);
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodedUrl}&hide_thread=false&theme=light`;
    
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TestimonialGenerator/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`oEmbed API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({ html: data.html }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching Twitter embed:', error);
    
    // Return fallback embed
    const { tweetUrl } = await request.json();
    const fallbackHtml = `<blockquote class="twitter-tweet" data-theme="light">
  <a href="${tweetUrl}"></a>
</blockquote>`;
    
    return NextResponse.json({ html: fallbackHtml }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}

// Allow CORS for the widget
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 