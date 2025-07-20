(function() {
    'use strict';
    
    // Configuration
    const DEFAULT_CONFIG = {
        container: 'testimonial-widget',
        testimonials: [],
        apiUrl: null,
        showNavigation: true,
        showPagination: true,
        autoSlide: true,
        slideInterval: 5000,
        testimonialsPerPage: 3,
        theme: 'light'
    };

    // Widget Class
    class TestimonialWidget {
        constructor(options) {
            this.container = document.getElementById(options.container);
            this.testimonials = options.testimonials || [];
            this.showNavigation = options.showNavigation !== false; // Default to true
            this.showPagination = options.showPagination !== false; // Default to true
            this.autoSlide = options.autoSlide || false;
            this.slideInterval = options.slideInterval || 5000;
            this.currentIndex = 0;
            this.intervalId = null;
            this.embedCache = new Map(); // Cache for oEmbed responses
            this.testimonialsPerPage = 3; // Default, will be updated based on screen size

            this.init();
        }

        async init() {
            if (!this.container) {
                console.error('Container not found');
                return;
            }

            // Set up responsive behavior
            this.updateLayout();
            window.addEventListener('resize', () => this.updateLayout());

            // Check if we have any Twitter embeds and fetch their HTML
            const hasEmbeds = this.testimonials.some(t => t.isEmbed);
            
            if (hasEmbeds) {
                // Load Twitter widgets script if not already loaded
                await this.loadTwitterWidgets();
                // Fetch embed HTML for all Twitter testimonials
                await this.fetchTwitterEmbeds();
            }

            this.render();
            
            if (this.autoSlide && this.testimonials.length > this.testimonialsPerPage) {
                this.startAutoSlide();
            }
        }

        updateLayout() {
            const width = window.innerWidth;
            const oldTestimonialsPerPage = this.testimonialsPerPage;
            
            if (width < 768) {
                this.testimonialsPerPage = 1; // Mobile: 1 per page
            } else if (width < 1024) {
                this.testimonialsPerPage = 2; // Tablet: 2 per page
            } else {
                this.testimonialsPerPage = 3; // Desktop: 3 per page
            }
            
            // Update current index if it's out of bounds
            const totalPages = Math.ceil(this.testimonials.length / this.testimonialsPerPage);
            if (this.currentIndex >= totalPages) {
                this.currentIndex = Math.max(0, totalPages - 1);
            }
            
            // Re-render if layout changed
            if (oldTestimonialsPerPage !== this.testimonialsPerPage) {
                this.render();
            }
        }

        async fetchTwitterEmbeds() {
            const embedPromises = this.testimonials
                .filter(t => t.isEmbed && t.originalUrl)
                .map(async (testimonial) => {
                    try {
                        const embedHtml = await this.getTwitterEmbed(testimonial.originalUrl);
                        this.embedCache.set(testimonial.originalUrl, embedHtml);
                    } catch (error) {
                        console.error('Failed to fetch Twitter embed for:', testimonial.originalUrl, error);
                    }
                });

            await Promise.all(embedPromises);
        }

        async getTwitterEmbed(tweetUrl) {
            try {
                // Use our API route to avoid CORS issues
                const response = await fetch('/api/twitter-embed', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ tweetUrl })
                });
                
                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`);
                }
                
                const data = await response.json();
                return data.html;
            } catch (error) {
                console.error('Error fetching Twitter embed:', error);
                return null;
            }
        }

        loadTwitterWidgets() {
            return new Promise((resolve, reject) => {
                // Check if already loaded
                if (window.twttr) {
                    resolve();
                    return;
                }

                // Check if script already exists
                if (document.getElementById('twitter-widgets-script')) {
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
                script.id = 'twitter-widgets-script';
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

        render() {
            if (this.testimonials.length === 0) {
                this.container.innerHTML = `
                    <div class="text-center py-12 text-gray-500">
                        <p>No testimonials to display.</p>
                    </div>
                `;
                return;
            }

            const totalPages = Math.ceil(this.testimonials.length / this.testimonialsPerPage);
            const startIndex = this.currentIndex * this.testimonialsPerPage;
            const endIndex = Math.min(startIndex + this.testimonialsPerPage, this.testimonials.length);
            const currentTestimonials = this.testimonials.slice(startIndex, endIndex);

            const testimonialsHTML = currentTestimonials.map((testimonial, index) => {
                if (testimonial.isEmbed) {
                    // Render Twitter embed using oEmbed HTML - no custom styling since Twitter provides its own
                    const cachedEmbed = this.embedCache.get(testimonial.originalUrl);
                    if (cachedEmbed) {
                        return `
                            <div class="twitter-embed-container">
                                ${cachedEmbed}
                            </div>
                        `;
                    } else {
                        // Fallback to simple link if embed failed to load
                        return `
                            <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                                <div class="text-center">
                                    <p class="text-gray-600 mb-4">Failed to load Twitter embed</p>
                                    <a 
                                        href="${testimonial.originalUrl}" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        class="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                        View Tweet
                                    </a>
                                </div>
                            </div>
                        `;
                    }
                } else {
                    // Render regular testimonial
                    return `
                        <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                            <div class="flex items-center mb-4">
                                <img
                                    src="${testimonial.avatar}"
                                    alt="${testimonial.name}"
                                    class="w-12 h-12 rounded-full mr-4 object-cover border-2 border-gray-100"
                                />
                                <div class="flex-1">
                                    <h4 class="font-semibold text-gray-900 text-sm">
                                        ${testimonial.name}
                                    </h4>
                                    ${testimonial.title ? `
                                        <p class="text-sm text-gray-600">
                                            ${testimonial.title}
                                        </p>
                                    ` : ''}
                                    ${testimonial.handle ? `
                                        <p class="text-sm text-gray-500">
                                            ${testimonial.handle}
                                        </p>
                                    ` : ''}
                                </div>
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </div>
                            </div>

                            ${testimonial.rating ? `
                                <div class="flex mb-3">
                                    ${this.renderStars(testimonial.rating)}
                                </div>
                            ` : ''}

                            <p class="text-gray-700 text-sm leading-relaxed mb-4 whitespace-pre-line">
                                ${testimonial.content}
                            </p>

                            <div class="flex items-center justify-between text-xs text-gray-500">
                                <span>${testimonial.date}</span>
                            </div>
                        </div>
                    `;
                }
            }).join('');

            this.container.innerHTML = `
                <div class="max-w-4xl mx-auto px-4">
                    <div class="relative">
                        ${this.showNavigation && this.testimonials.length > this.testimonialsPerPage ? this.renderNavigation(totalPages) : ''}
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
                            ${testimonialsHTML}
                        </div>
                    </div>
                    
                    ${this.showNavigation && totalPages > 1 ? this.renderPagination(totalPages) : ''}
                    ${this.showNavigation && totalPages > 1 ? this.renderPageInfo(totalPages) : ''}
                </div>
                
                <style>
                    .twitter-embed-container {
                        display: contents;
                    }
                    
                    .twitter-embed-container blockquote {
                        margin: 0 !important;
                    }
                    
                    .twitter-embed-container iframe {
                        max-width: 100% !important;
                        margin: 0 !important;
                    }
                </style>
            `;

            // Process Twitter embeds (oEmbed HTML already includes the widgets script)
            if (window.twttr && window.twttr.widgets) {
                // Multiple attempts to ensure widgets load properly after rendering
                setTimeout(() => window.twttr.widgets.load(), 50);
                setTimeout(() => window.twttr.widgets.load(), 200);
                setTimeout(() => window.twttr.widgets.load(), 400);
            }

            this.attachEventListeners();
        }

        // Method to refresh Twitter widgets
        refreshTwitterWidgets() {
            if (window.twttr && window.twttr.widgets) {
                // Multiple loading attempts for better reliability
                setTimeout(() => window.twttr.widgets.load(), 50);
                setTimeout(() => window.twttr.widgets.load(), 200);
                setTimeout(() => window.twttr.widgets.load(), 400);
            }
        }

        // Method to update testimonials and re-render
        updateTestimonials(newTestimonials) {
            this.testimonials = newTestimonials;
            this.updateLayout();
            this.render();
            
            // Refresh Twitter widgets after a short delay
            setTimeout(() => {
                this.refreshTwitterWidgets();
            }, 200);
        }

        renderStars(rating) {
            return Array.from({ length: 5 }, (_, i) => {
                const filled = i < rating;
                return `
                    <svg class="w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                `;
            }).join('');
        }

        renderNavigation(totalPages) {
            return `
                <button 
                    id="prev-btn" 
                    class="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-200 hover:scale-105 -ml-6"
                    aria-label="Previous testimonials"
                >
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <button 
                    id="next-btn" 
                    class="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-200 hover:scale-105 -mr-6"
                    aria-label="Next testimonials"
                >
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            `;
        }

        renderPagination(totalPages) {
            return `
                <div class="flex justify-center mt-8 space-x-2">
                    ${Array.from({ length: totalPages }, (_, i) => {
                        const active = i === this.currentIndex;
                        return `
                            <button 
                                class="w-2 h-2 rounded-full transition-all duration-200 pagination-dot ${active ? 'bg-indigo-600 w-6' : 'bg-gray-300 hover:bg-gray-400'}"
                                data-page="${i}"
                                aria-label="Go to page ${i + 1}"
                            ></button>
                        `;
                    }).join('')}
                </div>
            `;
        }

        renderPageInfo(totalPages) {
            return `
                <div class="flex justify-center mt-4">
                    <div class="text-sm text-gray-500">
                        Page ${this.currentIndex + 1} of ${totalPages} (${this.testimonials.length} testimonials)
                    </div>
                </div>
            `;
        }

        attachEventListeners() {
            // Navigation buttons
            const prevBtn = this.container.querySelector('#prev-btn');
            const nextBtn = this.container.querySelector('#next-btn');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => this.previousSlide());
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.nextSlide());
            }

            // Pagination dots
            const paginationBtns = this.container.querySelectorAll('[data-page]');
            paginationBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.page);
                    this.goToSlide(index);
                });
            });
        }

        nextSlide() {
            const totalPages = Math.ceil(this.testimonials.length / this.testimonialsPerPage);
            this.currentIndex = (this.currentIndex + 1) % totalPages;
            this.render();
            
            // Reload Twitter widgets after navigation
            setTimeout(() => {
                this.refreshTwitterWidgets();
            }, 100);
        }

        previousSlide() {
            const totalPages = Math.ceil(this.testimonials.length / this.testimonialsPerPage);
            this.currentIndex = (this.currentIndex - 1 + totalPages) % totalPages;
            this.render();
            
            // Reload Twitter widgets after navigation
            setTimeout(() => {
                this.refreshTwitterWidgets();
            }, 100);
        }

        goToSlide(index) {
            const totalPages = Math.ceil(this.testimonials.length / this.testimonialsPerPage);
            if (index >= 0 && index < totalPages) {
                this.currentIndex = index;
                this.render();
                
                // Reload Twitter widgets after navigation
                setTimeout(() => {
                    this.refreshTwitterWidgets();
                }, 100);
            }
        }

        startAutoSlide() {
            this.intervalId = setInterval(() => {
                this.nextSlide();
            }, this.slideInterval);
        }

        stopAutoSlide() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }

        destroy() {
            this.stopAutoSlide();
            if (this.container) {
                this.container.innerHTML = '';
            }
        }
    }

    // Auto-initialize if data-testimonials attribute is found
    document.addEventListener('DOMContentLoaded', function() {
        const containers = document.querySelectorAll('[data-testimonials]');
        containers.forEach(container => {
            try {
                const config = JSON.parse(container.getAttribute('data-testimonials'));
                config.container = container.id;
                new TestimonialWidget(config);
            } catch (error) {
                console.error('Failed to initialize testimonial widget:', error);
            }
        });
    });

    // Expose the widget class globally
    window.TestimonialWidget = TestimonialWidget;

})(); 