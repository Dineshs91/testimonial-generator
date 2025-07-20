"use client";

import { useState } from "react";
import TestimonialWidget from "./components/TestimonialWidget";
import { generateTestimonial, isValidTwitterUrl, extractUsername, getEmbedInstructions } from "./utils/testimonialGenerator";
import type { Testimonial } from "./types/testimonial";

export default function Home() {
  const [url, setUrl] = useState("");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmbedInstructions, setShowEmbedInstructions] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Validate URL first
      if (!isValidTwitterUrl(url)) {
        throw new Error('Please enter a valid Twitter/X post URL in the format: https://twitter.com/username/status/tweetId');
      }

      const username = extractUsername(url);
      console.log(`Fetching Twitter embed for @${username} using oEmbed API...`);
      
      const newTestimonial = await generateTestimonial(url);
      setTestimonials(prev => [newTestimonial, ...prev]);
      setUrl("");
    } catch (error) {
      console.error("Error generating testimonial:", error);
      setError(error instanceof Error ? error.message : 'Failed to generate testimonial');
    } finally {
      setLoading(false);
    }
  };

  const validateUrlAsUserTypes = (inputUrl: string) => {
    setUrl(inputUrl);
    setError(null);
    
    // Show real-time validation feedback
    if (inputUrl.trim() && !isValidTwitterUrl(inputUrl)) {
      if (!inputUrl.includes('twitter.com') && !inputUrl.includes('x.com')) {
        setError('URL must be from twitter.com or x.com');
      } else if (!inputUrl.includes('/status/')) {
        setError('URL must be a specific tweet (should contain /status/)');
      } else {
        setError('Invalid Twitter/X URL format');
      }
    }
  };

  const realExampleUrls = [
    "https://twitter.com/vercel/status/1734567890123456789",
    "https://x.com/nextjs/status/1734567890123456789", 
    "https://twitter.com/tailwindcss/status/1734567890123456789"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Testimonial Generator
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Embed real Twitter/X posts as beautiful testimonial widgets
          </p>
          <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
            🎯 Uses official Twitter embeds - No API required, No rate limits!
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <button 
              onClick={() => setShowEmbedInstructions(!showEmbedInstructions)}
              className="text-indigo-600 hover:text-indigo-800 underline text-sm"
            >
              📖 View embed documentation
            </button>
          </div>
        </div>

        {/* Embedding Instructions */}
        {showEmbedInstructions && (
          <div className="max-w-4xl mx-auto mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                🎯 Official Twitter Embed Implementation
              </h3>
              <button 
                onClick={() => setShowEmbedInstructions(false)}
                className="text-green-600 hover:text-green-800 dark:text-green-400"
              >
                ✕
              </button>
            </div>
            <pre className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap overflow-x-auto">
              {getEmbedInstructions()}
            </pre>
          </div>
        )}

        {/* URL Input Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Twitter/X Post URL
            </label>
            <div className="flex gap-4">
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => validateUrlAsUserTypes(e.target.value)}
                placeholder="https://twitter.com/username/status/..."
                className={`flex-1 rounded-md border px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 ${
                  error 
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                required
              />
              <button
                type="submit"
                disabled={loading || !!error}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Fetching embed...
                  </div>
                ) : "Create Embed"}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            
            {/* Help Text */}
            {!error && !loading && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Paste any public Twitter/X post URL to create an official embed
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  🚀 Creates interactive Twitter embeds with full functionality
                </p>
              </div>
            )}
            
            {/* Example URLs */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Example URLs (click to use):</p>
              <div className="space-y-1">
                {realExampleUrls.map((exampleUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setUrl(exampleUrl)}
                    className="block text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 truncate max-w-full"
                  >
                    {exampleUrl}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Testimonials Display */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Twitter Embeds
            </h2>
            {testimonials.length > 0 && (
              <span className="ml-3 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full">
                {testimonials.length} official
              </span>
            )}
          </div>
          <TestimonialWidget testimonials={testimonials} />
        </div>

        {/* Widget Code Section */}
        {testimonials.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🚀 Embed Code (Official Twitter Widgets)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Copy this HTML code to embed <strong>official Twitter widgets</strong> on your website:
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 overflow-x-auto">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
{`<!-- Official Twitter Embeds -->
<div id="testimonial-widget" class="max-w-6xl mx-auto px-4 py-8">
  <!-- Widget content will be loaded here -->
</div>

<script src="https://cdn.tailwindcss.com"></script>
<script src="https://your-domain.com/widget-embed.js"></script>

<script>
  // Initialize widget with official Twitter embeds
  new TestimonialWidget({
    container: 'testimonial-widget',
    testimonials: ${JSON.stringify(testimonials, null, 2)},
    showNavigation: true,
    showPagination: true,
    autoSlide: true,
    slideInterval: 5000
  });
</script>

<!-- Twitter Widgets Script (automatically loaded by widget) -->
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`}
                </pre>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`<!-- Official Twitter Embeds -->
<div id="testimonial-widget" class="max-w-6xl mx-auto px-4 py-8">
  <!-- Widget content will be loaded here -->
</div>

<script src="https://cdn.tailwindcss.com"></script>
<script src="https://your-domain.com/widget-embed.js"></script>

<script>
  // Initialize widget with official Twitter embeds
  new TestimonialWidget({
    container: 'testimonial-widget',
    testimonials: ${JSON.stringify(testimonials, null, 2)},
    showNavigation: true,
    showPagination: true,
    autoSlide: true,
    slideInterval: 5000
  });
</script>

<!-- Twitter Widgets Script (automatically loaded by widget) -->
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`);
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                >
                  📋 Copy Code
                </button>
                <a
                  href="/widget-usage.html"
                  target="_blank"
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  📖 View Documentation
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
