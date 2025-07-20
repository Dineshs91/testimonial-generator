import { useEffect, useState, memo, useMemo, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Testimonial } from "../types/testimonial";
import { loadTwitterWidgets } from "../utils/testimonialGenerator";

interface TestimonialWidgetProps {
  testimonials: Testimonial[];
  showNavigation?: boolean;
}

const TestimonialWidget = memo(function TestimonialWidget({ testimonials, showNavigation = true }: TestimonialWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonialsPerPage, setTestimonialsPerPage] = useState(3);
  const loadingWidgets = useRef(false);

  useEffect(() => {
    // Load Twitter widgets if there are any embeds
    const hasEmbeds = testimonials.some(t => t.isEmbed);
    
    if (hasEmbeds && !loadingWidgets.current) {
      loadingWidgets.current = true;
      
      loadTwitterWidgets().then(() => {
        // Multiple attempts to ensure widgets load properly
        const loadAttempts = [100, 300, 500];
        
        loadAttempts.forEach((delay, index) => {
          setTimeout(() => {
            if (window.twttr && window.twttr.widgets) {
              window.twttr.widgets.load();
            }
            
            // Reset loading flag after final attempt
            if (index === loadAttempts.length - 1) {
              loadingWidgets.current = false;
            }
          }, delay);
        });
      }).catch(error => {
        console.warn('Failed to load Twitter widgets:', error);
        loadingWidgets.current = false;
      });
    }
  }, [testimonials.length, testimonials.map(t => t.id).join(',')]); // Only re-run when testimonials actually change

  // Reload Twitter widgets when navigation changes
  useEffect(() => {
    const hasEmbeds = testimonials.some(t => t.isEmbed);
    if (hasEmbeds && window.twttr && window.twttr.widgets) {
      const timer = setTimeout(() => {
        window.twttr.widgets.load();
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, testimonialsPerPage]);

  useEffect(() => {
    // Update testimonials per page based on screen size
    const updateLayout = () => {
      if (window.innerWidth < 768) {
        setTestimonialsPerPage(1); // Mobile: 1 per page
      } else if (window.innerWidth < 1024) {
        setTestimonialsPerPage(2); // Tablet: 2 per page
      } else {
        setTestimonialsPerPage(3); // Desktop: 3 per page
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  // Callback ref to ensure Twitter widgets load after DOM updates
  const gridRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const hasEmbeds = testimonials.some(t => t.isEmbed);
      if (hasEmbeds && window.twttr && window.twttr.widgets) {
        // Multiple attempts with different delays
        setTimeout(() => window.twttr.widgets.load(), 50);
        setTimeout(() => window.twttr.widgets.load(), 200);
        setTimeout(() => window.twttr.widgets.load(), 400);
      }
    }
  }, [testimonials, currentIndex]);

  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);
  const startIndex = currentIndex * testimonialsPerPage;
  const endIndex = Math.min(startIndex + testimonialsPerPage, testimonials.length);
  
  // Memoize current testimonials to prevent unnecessary re-renders
  const currentTestimonials = useMemo(() => {
    return testimonials.slice(startIndex, endIndex);
  }, [testimonials, startIndex, endIndex]);

  const goToPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : totalPages - 1);
    // Reload Twitter widgets after navigation
    setTimeout(() => {
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
      }
    }, 100);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev < totalPages - 1 ? prev + 1 : 0);
    // Reload Twitter widgets after navigation
    setTimeout(() => {
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
      }
    }, 100);
  };

  const goToPage = (pageIndex: number) => {
    setCurrentIndex(pageIndex);
    // Reload Twitter widgets after navigation
    setTimeout(() => {
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
      }
    }, 100);
  };

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
    <div className="max-w-4xl mx-auto px-4">
      <div className="relative">
        {/* Navigation arrows positioned at center sides */}
        {showNavigation && testimonials.length > testimonialsPerPage && (
          <>
            <button 
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:scale-105 -ml-6"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            <button 
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:scale-105 -mr-6"
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </>
        )}

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]" key={`grid-${currentIndex}-${testimonialsPerPage}`} ref={gridRef}>
          {currentTestimonials.map((testimonial) => (
            testimonial.isEmbed ? (
              // For Twitter embeds, render without any wrapper styling since they have their own
              <div
                key={`embed-${testimonial.id}`}
                className="twitter-embed-container"
                data-testimonial-id={testimonial.id}
              >
                <div 
                  dangerouslySetInnerHTML={{ __html: testimonial.content }}
                  className="w-full"
                  onError={(e) => {
                    console.error('Error rendering Twitter embed:', e);
                  }}
                />
                {/* Fallback link if embed fails */}
                {testimonial.originalUrl && (
                  <noscript>
                    <a 
                      href={testimonial.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Tweet
                    </a>
                  </noscript>
                )}
              </div>
            ) : (
              // Regular testimonial with full styling
              <div
                key={`testimonial-${testimonial.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-300"
              >
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
              </div>
            )
          ))}
        </div>
      </div>
      
      {/* Pagination dots centered below */}
      {showNavigation && totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === currentIndex 
                  ? 'bg-indigo-600 w-6' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
      
      {showNavigation && totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentIndex + 1} of {totalPages} ({testimonials.length} testimonials)
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .twitter-embed-container {
          display: contents;
        }
        
        .twitter-embed-container blockquote {
          margin: 0 !important;
          max-width: 100% !important;
        }
        
        .twitter-embed-container iframe {
          max-width: 100% !important;
          margin: 0 !important;
          border-radius: 0.5rem !important;
        }
        
        .twitter-tweet {
          margin: 0 !important;
        }
      `}</style>
    </div>
  );
});

export default TestimonialWidget; 