import { useEffect } from "react";
import type { Testimonial } from "../types/testimonial";
import { loadTwitterWidgets } from "../utils/testimonialGenerator";

interface TestimonialWidgetProps {
  testimonials: Testimonial[];
  showNavigation?: boolean;
}

export default function TestimonialWidget({ testimonials, showNavigation = false }: TestimonialWidgetProps) {
  useEffect(() => {
    // Load Twitter widgets if there are any embeds
    const hasEmbeds = testimonials.some(t => t.isEmbed);
    if (hasEmbeds) {
      loadTwitterWidgets().then(() => {
        // Widgets loaded successfully
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load();
        }
      }).catch(error => {
        console.warn('Failed to load Twitter widgets:', error);
      });
    }
  }, [testimonials]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return (
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'slack':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        );
    }
  };

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>No testimonials yet. Add a Twitter/X URL to get started!</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {showNavigation && (
        <div className="flex justify-between items-center mb-6">
          <button className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-300 ${
              testimonial.isEmbed ? 'min-h-[400px] !p-0' : ''
            }`}
          >
            {testimonial.isEmbed ? (
              // For Twitter embeds, show the full embed from oEmbed API
              <div className="twitter-embed-wrapper">
                <div 
                  dangerouslySetInnerHTML={{ __html: testimonial.content }}
                  className="w-full"
                />
              </div>
            ) : (
              // Regular testimonial layout
              <>
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-gray-100 dark:border-gray-600"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {testimonial.name}
                    </h4>
                    {testimonial.title && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.title}
                      </p>
                    )}
                    {testimonial.handle && (
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {testimonial.handle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center">
                    {getPlatformIcon(testimonial.platform)}
                  </div>
                </div>

                {testimonial.rating && (
                  <div className="flex mb-3">
                    {renderStars(testimonial.rating)}
                  </div>
                )}

                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-line">
                  {testimonial.content}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{testimonial.date}</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .twitter-embed-wrapper {
          display: flex;
          align-items: stretch;
          min-height: 400px;
        }
        
        .twitter-embed-wrapper :global(blockquote) {
          margin: 0 !important;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .twitter-embed-wrapper :global(iframe) {
          flex: 1;
          min-height: 400px;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(229, 231, 235, 1);
        }
        
        .twitter-embed-wrapper:hover :global(iframe) {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transition: box-shadow 0.3s ease;
        }
      `}</style>
    </div>
  );
} 