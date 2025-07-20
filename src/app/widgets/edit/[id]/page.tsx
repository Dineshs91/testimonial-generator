"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import TestimonialWidget from "../../../components/TestimonialWidget";
import TestimonialManager from "../../../components/TestimonialManager";
import type { Widget, WidgetSettings } from "../../../types/widget";
import { getWidget, updateWidget, deleteWidget, addTestimonialToWidget } from "../../../utils/storage";
import { generateTestimonial, isValidTwitterUrl, extractUsername } from "../../../utils/testimonialGenerator";

export default function EditWidgetPage() {
  const router = useRouter();
  const params = useParams();
  const widgetId = params.id as string;
  
  const [widget, setWidget] = useState<Widget | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    showNavigation: true,
    showPagination: true,
    autoSlide: false,
    slideInterval: 5000,
    theme: 'light' as 'light' | 'dark'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Testimonial import state
  const [url, setUrl] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Load widget data
  useEffect(() => {
    if (widgetId) {
      const foundWidget = getWidget(widgetId);
      if (foundWidget) {
        setWidget(foundWidget);
        setFormData({
          name: foundWidget.name,
          showNavigation: foundWidget.settings.showNavigation,
          showPagination: foundWidget.settings.showPagination,
          autoSlide: foundWidget.settings.autoSlide,
          slideInterval: foundWidget.settings.slideInterval,
          theme: foundWidget.settings.theme
        });
      } else {
        setNotFound(true);
      }
    }
  }, [widgetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!widget) return;
    
    if (!formData.name.trim()) {
      setError('Widget name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const settings: WidgetSettings = {
        showNavigation: formData.showNavigation,
        showPagination: formData.showPagination,
        autoSlide: formData.autoSlide,
        slideInterval: formData.slideInterval,
        theme: formData.theme,
        testimonialsPerPage: widget.settings.testimonialsPerPage || 3
      };

      const updatedWidget = updateWidget(widget.id, { 
        name: formData.name.trim(),
        settings 
      });

      if (updatedWidget) {
        setWidget(updatedWidget);
        setError(null);
      } else {
        setError('Failed to update widget');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update widget');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !widget) return;

    setImportLoading(true);
    setImportError(null);

    try {
      // Validate URL first
      if (!isValidTwitterUrl(url)) {
        throw new Error('Please enter a valid Twitter/X post URL in the format: https://twitter.com/username/status/tweetId');
      }

      const username = extractUsername(url);
      console.log(`Fetching Twitter embed for @${username} using oEmbed API...`);
      
      const newTestimonial = await generateTestimonial(url);
      
      // Add to widget
      const updatedWidget = addTestimonialToWidget(widget.id, newTestimonial);
      if (updatedWidget) {
        setWidget(updatedWidget);
      }
      
      setUrl("");
    } catch (error) {
      console.error("Error generating testimonial:", error);
      setImportError(error instanceof Error ? error.message : 'Failed to generate testimonial');
    } finally {
      setImportLoading(false);
    }
  };

  const validateUrlAsUserTypes = (inputUrl: string) => {
    setUrl(inputUrl);
    setImportError(null);
    
    // Show real-time validation feedback
    if (inputUrl.trim() && !isValidTwitterUrl(inputUrl)) {
      if (!inputUrl.includes('twitter.com') && !inputUrl.includes('x.com')) {
        setImportError('URL must be from twitter.com or x.com');
      } else if (!inputUrl.includes('/status/')) {
        setImportError('URL must be a specific tweet (should contain /status/)');
      } else {
        setImportError('Invalid Twitter/X URL format');
      }
    }
  };

  const handleDelete = () => {
    if (!widget) return;
    
    if (confirm(`Are you sure you want to delete "${widget.name}"? This will permanently remove all ${widget.testimonials.length} testimonials.`)) {
      const success = deleteWidget(widget.id);
      if (success) {
        router.push('/');
      } else {
        setError('Failed to delete widget');
      }
    }
  };

  const handleWidgetUpdated = (updatedWidget: Widget) => {
    setWidget(updatedWidget);
  };

  const handleCancel = () => {
    router.push('/');
  };

  const realExampleUrls = [
    "https://twitter.com/vercel/status/1734567890123456789",
    "https://x.com/nextjs/status/1734567890123456789", 
    "https://twitter.com/tailwindcss/status/1734567890123456789"
  ];

  // Loading state
  if (!widget && !notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading widget...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Widget Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              The widget you're looking for doesn't exist or may have been deleted.
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Widgets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Widgets
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Edit Widget: {widget?.name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Update settings, manage testimonials, and get embed code
              </p>
            </div>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Widget
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Widget Settings Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Widget Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure your widget's name and display options
                </p>
              </div>

              {/* Widget Info */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Widget ID:</span>
                    <span className="ml-2 font-mono text-gray-900 dark:text-white">{widget?.id.substring(0, 8)}...</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Testimonials:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{widget?.testimonials.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {widget && new Date(widget.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {widget && new Date(widget.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Widget Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Widget Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Homepage Testimonials"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Widget Settings */}
                <div className="space-y-6">
                  {/* Navigation */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Show Navigation
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Display left/right arrow navigation for testimonials
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showNavigation}
                        onChange={(e) => setFormData(prev => ({ ...prev, showNavigation: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Show Pagination
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Display pagination dots below testimonials
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showPagination}
                        onChange={(e) => setFormData(prev => ({ ...prev, showPagination: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Auto Slide */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Auto Slide
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Automatically advance testimonials over time
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoSlide}
                        onChange={(e) => setFormData(prev => ({ ...prev, autoSlide: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Slide Interval (only shown if auto slide is enabled) */}
                  {formData.autoSlide && (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                      <label htmlFor="slideInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Slide Interval (milliseconds)
                      </label>
                      <input
                        type="number"
                        id="slideInterval"
                        min="1000"
                        max="30000"
                        step="500"
                        value={formData.slideInterval}
                        onChange={(e) => setFormData(prev => ({ ...prev, slideInterval: parseInt(e.target.value) || 5000 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Recommended: 3000-8000ms for optimal user experience
                      </p>
                    </div>
                  )}

                  {/* Theme */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Theme
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="light"
                          checked={formData.theme === 'light'}
                          onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                          className="mr-2 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Light Theme</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="dark"
                          checked={formData.theme === 'dark'}
                          onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                          className="mr-2 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Dark Theme</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    type="submit"
                    disabled={loading || !formData.name.trim()}
                    className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </div>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Update Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Add Testimonials */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleAddTestimonial} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Add Twitter/X Post to "{widget?.name}"
                  </label>
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full">
                    {widget?.testimonials.length || 0} testimonials
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => validateUrlAsUserTypes(e.target.value)}
                  placeholder="https://twitter.com/username/status/..."
                  className={`flex-1 rounded-md border px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 ${
                    importError 
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  required
                />
                <button
                  type="submit"
                  disabled={importLoading || !!importError}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {importLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </div>
                  ) : "Add Testimonial"}
                </button>
              </div>

              {/* Error Message */}
              {importError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {importError}
                </p>
              )}
              
              {/* Help Text */}
              {!importError && !importLoading && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Paste any public Twitter/X post URL to add an official embed to this widget
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    🚀 Auto-saved to localStorage with UUID: {widget?.id.substring(0, 8)}...
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

          {/* Widget Preview */}
          {widget && (
            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Widget Preview: "{widget.name}"
                </h2>
              </div>
              
              {widget.testimonials.length === 0 ? (
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add Twitter URLs above to see authentic embeds with responsive navigation.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    The widget automatically adapts to your screen size with smooth navigation.
                  </p>
                </div>
              ) : null}
              
              <TestimonialWidget testimonials={widget.testimonials} />
            </div>
          )}

          {/* Testimonial Management */}
          {widget && (
            <div className="mb-8">
              <TestimonialManager
                widget={widget}
                onTestimonialUpdate={handleWidgetUpdated}
              />
            </div>
          )}

          {/* Widget Code Section */}
          {widget && widget.testimonials.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🚀 Embed Code for "{widget.name}"
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Copy this HTML code to embed <strong>"{widget.name}"</strong> on your website:
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
{`<!-- Widget: ${widget.name} (${widget.id}) -->
<div id="testimonial-widget" class="max-w-4xl mx-auto px-4 py-8">
  <!-- Widget content will be loaded here -->
</div>

<script src="https://cdn.tailwindcss.com"></script>
<script src="https://your-domain.com/widget-embed.js"></script>

<script>
  // Initialize widget with official Twitter embeds
  new TestimonialWidget({
    container: 'testimonial-widget',
    testimonials: ${JSON.stringify(widget.testimonials, null, 2)},
    showNavigation: ${widget.settings.showNavigation},
    showPagination: ${widget.settings.showPagination},
    autoSlide: ${widget.settings.autoSlide},
    slideInterval: ${widget.settings.slideInterval}
  });
</script>

<!-- Twitter Widgets Script (automatically loaded by widget) -->
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`}
                  </pre>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`<!-- Widget: ${widget.name} (${widget.id}) -->
<div id="testimonial-widget" class="max-w-4xl mx-auto px-4 py-8">
  <!-- Widget content will be loaded here -->
</div>

<script src="https://cdn.tailwindcss.com"></script>
<script src="https://your-domain.com/widget-embed.js"></script>

<script>
  // Initialize widget with official Twitter embeds
  new TestimonialWidget({
    container: 'testimonial-widget',
    testimonials: ${JSON.stringify(widget.testimonials, null, 2)},
    showNavigation: ${widget.settings.showNavigation},
    showPagination: ${widget.settings.showPagination},
    autoSlide: ${widget.settings.autoSlide},
    slideInterval: ${widget.settings.slideInterval}
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
    </div>
  );
} 