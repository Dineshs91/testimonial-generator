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
            this.showNavigation = options.showNavigation || false;
            this.showPagination = options.showPagination || false;
            this.autoSlide = options.autoSlide || false;
            this.slideInterval = options.slideInterval || 5000;
            this.currentIndex = 0;
            this.intervalId = null;
            this.embedCache = new Map(); // Cache for oEmbed responses

            this.init();
        }

        async init() {
            if (!this.container) {
                console.error('Container not found');
                return;
            }

            // Check if we have any Twitter embeds and fetch their HTML
            const hasEmbeds = this.testimonials.some(t => t.isEmbed);
            
            if (hasEmbeds) {
                // Load Twitter widgets script if not already loaded
                await this.loadTwitterWidgets();
                // Fetch embed HTML for all Twitter testimonials
                await this.fetchTwitterEmbeds();
            }

            this.render();
            
            if (this.autoSlide && this.testimonials.length > 1) {
                this.startAutoSlide();
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

            const testimonialsHTML = this.testimonials.map((testimonial, index) => {
                if (testimonial.isEmbed) {
                    // Render Twitter embed using oEmbed HTML
                    const cachedEmbed = this.embedCache.get(testimonial.originalUrl);
                    if (cachedEmbed) {
                        return `
                            <div class="twitter-embed-wrapper">
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
                <div class="max-w-6xl mx-auto px-4">
                    ${this.showNavigation ? this.renderNavigation() : ''}
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${testimonialsHTML}
                    </div>
                    
                    ${this.showPagination ? this.renderPagination() : ''}
                </div>
                
                <style>
                    .twitter-embed-wrapper {
                        display: flex;
                        align-items: stretch;
                        min-height: 400px;
                    }
                    
                    .twitter-embed-wrapper blockquote {
                        margin: 0 !important;
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .twitter-embed-wrapper iframe {
                        flex: 1;
                        min-height: 400px;
                        border-radius: 0.5rem;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                        border: 1px solid rgba(229, 231, 235, 1);
                    }
                    
                    .twitter-embed-wrapper:hover iframe {
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                        transition: box-shadow 0.3s ease;
                    }
                </style>
            `;

            // Process Twitter embeds (oEmbed HTML already includes the widgets script)
            if (window.twttr && window.twttr.widgets) {
                window.twttr.widgets.load();
            }

            this.attachEventListeners();
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

        renderNavigation() {
            return `
                <div class="flex justify-between items-center mb-6">
                    <button 
                        id="prev-btn" 
                        class="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                    >
                        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button 
                        id="next-btn" 
                        class="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                    >
                        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            `;
        }

        renderPagination() {
            const dots = Array.from({ length: this.testimonials.length }, (_, i) => {
                const active = i === this.currentIndex;
                return `
                    <button 
                        class="w-3 h-3 rounded-full ${active ? 'bg-indigo-600' : 'bg-gray-300'} transition-colors"
                        data-index="${i}"
                    ></button>
                `;
            }).join('');

            return `
                <div class="flex justify-center mt-8 space-x-2">
                    ${dots}
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
            const paginationBtns = this.container.querySelectorAll('[data-index]');
            paginationBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    this.goToSlide(index);
                });
            });
        }

        nextSlide() {
            this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
            this.render();
        }

        previousSlide() {
            this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
            this.render();
        }

        goToSlide(index) {
            this.currentIndex = index;
            this.render();
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