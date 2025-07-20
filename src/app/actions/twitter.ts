'use server';

export async function fetchTwitterEmbed(tweetUrl: string): Promise<string> {
  try {
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
    return data.html;
  } catch (error) {
    console.error('Error fetching Twitter embed:', error);
    // Fallback to basic embed
    return `<blockquote class="twitter-tweet" data-theme="light">
  <a href="${tweetUrl}"></a>
</blockquote>`;
  }
} 