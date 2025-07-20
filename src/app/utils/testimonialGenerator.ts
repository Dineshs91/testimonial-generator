import type { Testimonial } from "../types/testimonial";
import { fetchTwitterEmbed } from "../actions/twitter";

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function extractTwitterData(url: string) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Validate Twitter/X domain
    const validDomains = ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'];
    if (!validDomains.includes(hostname)) {
      throw new Error('Invalid Twitter/X domain');
    }

    const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
    
    // Expected format: /username/status/tweetId
    if (pathSegments.length < 3 || pathSegments[1] !== 'status') {
      throw new Error('Invalid Twitter/X URL format');
    }

    const username = pathSegments[0];
    const tweetId = pathSegments[2];

    return {
      username,
      tweetId,
      domain: hostname,
      fullUrl: url,
      isValid: true
    };
  } catch (error) {
    return {
      username: null,
      tweetId: null,
      domain: null,
      fullUrl: url,
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid URL'
    };
  }
}

// Generate avatar based on username (for consistency)
function generateAvatar(username: string): string {
  // Use a consistent hash-based approach for avatars
  const hash = Math.abs(hashCode(username));
  const avatarServices = [
    `https://i.pravatar.cc/80?u=${username}`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    `https://images.unsplash.com/photo-${1400000000000 + (hash % 1000)}?w=80&h=80&fit=crop&crop=face`
  ];
  
  const index = hash % avatarServices.length;
  return avatarServices[index];
}

// Simple hash function for consistent avatar selection
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

// Generate Twitter embed HTML using oEmbed API via server action
export async function generateTwitterEmbed(url: string): Promise<string> {
  const twitterData = extractTwitterData(url);
  
  if (!twitterData.isValid) {
    throw new Error(`Invalid Twitter/X URL: ${twitterData.error}`);
  }

  try {
    // Use server action to avoid CORS issues
    return await fetchTwitterEmbed(url);
  } catch (error) {
    console.error('Error fetching Twitter embed:', error);
    // Fallback to basic embed
    return `<blockquote class="twitter-tweet" data-theme="light">
  <a href="${url}"></a>
</blockquote>`;
  }
}

// Load Twitter widgets script
export function loadTwitterWidgets(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.twttr) {
      resolve();
      return;
    }

    // Check if script already exists
    if (document.getElementById('twitter-widgets')) {
      // Wait for it to load
      const checkTwitter = setInterval(() => {
        if (window.twttr) {
          clearInterval(checkTwitter);
          resolve();
        }
      }, 100);
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.id = 'twitter-widgets';
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    
    script.onload = () => {
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Twitter widgets script'));
    };
    
    document.head.appendChild(script);
  });
}

// Create testimonial with Twitter embed
export async function generateTestimonial(twitterUrl: string): Promise<Testimonial> {
  const twitterData = extractTwitterData(twitterUrl);
  
  if (!twitterData.isValid) {
    throw new Error(`Invalid Twitter/X URL: ${twitterData.error}`);
  }

  const id = Date.now().toString();
  const username = twitterData.username!;
  
  // Generate the Twitter embed HTML
  const embedHtml = await generateTwitterEmbed(twitterUrl);
  
  // Create a testimonial object with embed
  return {
    id,
    name: `@${username}`,
    title: 'Twitter User',
    handle: `@${username}`,
    avatar: generateAvatar(username),
    content: embedHtml, // This will be the Twitter embed HTML
    date: formatDate(new Date()),
    platform: 'twitter',
    isEmbed: true, // Special flag to indicate this is an embed
    originalUrl: twitterUrl
  };
}

// Enhanced URL validation
export function isValidTwitterUrl(url: string): boolean {
  const twitterData = extractTwitterData(url);
  return twitterData.isValid;
}

// Extract tweet ID from URL
export function extractTweetId(url: string): string | null {
  const twitterData = extractTwitterData(url);
  return twitterData.isValid ? twitterData.tweetId : null;
}

// Extract username from URL
export function extractUsername(url: string): string | null {
  const twitterData = extractTwitterData(url);
  return twitterData.isValid ? twitterData.username : null;
}

// Function to get embedding instructions
export function getEmbedInstructions(): string {
  return `
🎯 Twitter Embed Implementation (Official & Free):

1. **Server-Side oEmbed Implementation** (Current):
   - Uses Next.js server actions to fetch Twitter embeds
   - Avoids CORS issues by calling oEmbed API server-side
   - Returns authentic Twitter embed HTML to client

2. **Benefits**:
   ✅ No API key required
   ✅ No rate limits
   ✅ No CORS issues
   ✅ Official Twitter styling
   ✅ Automatic updates
   ✅ Responsive design
   ✅ Dark/light mode support
   ✅ Handles all media types

3. **How it works**:
   - Frontend calls Next.js server action
   - Server fetches from https://publish.twitter.com/oembed
   - Returns complete Twitter embed HTML
   - Client renders authentic Twitter widget

4. **Widget API Endpoint**:
   POST /api/twitter-embed
   Body: { &quot;tweetUrl&quot;: &quot;https://twitter.com/...&quot; }
   Response: { &quot;html&quot;: &quot;&lt;blockquote&gt;...&lt;/blockquote&gt;&quot; }

This approach ensures reliable, compliant Twitter embeds without CORS limitations!
`;
}

// Declare global twttr for TypeScript
declare global {
  interface Window {
    twttr: {
      widgets: {
        load: () => void;
      };
    };
  }
} 