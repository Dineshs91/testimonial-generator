"use client";

import { useState } from "react";
import { Trash2, Edit3, Save, X, ExternalLink } from "lucide-react";
import type { Testimonial } from "../types/testimonial";
import type { Widget } from "../types/widget";
import { deleteTestimonialFromWidget } from "../utils/storage";

interface TestimonialManagerProps {
  widget: Widget;
  onTestimonialUpdate: (widget: Widget) => void;
}

export default function TestimonialManager({ widget, onTestimonialUpdate }: TestimonialManagerProps) {
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Testimonial>>({});

  const handleDeleteTestimonial = (testimonialId: string) => {
    const testimonial = widget.testimonials.find(t => t.id === testimonialId);
    if (!testimonial) return;

    if (confirm(`Are you sure you want to delete this testimonial from "${testimonial.name}"?`)) {
      const updatedWidget = deleteTestimonialFromWidget(widget.id, testimonialId);
      if (updatedWidget) {
        onTestimonialUpdate(updatedWidget);
      }
    }
  };

  const startEditing = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial.id);
    setEditFormData({
      name: testimonial.name,
      title: testimonial.title,
      content: testimonial.content,
      rating: testimonial.rating
    });
  };

  const cancelEditing = () => {
    setEditingTestimonial(null);
    setEditFormData({});
  };

  const handleSaveEdit = (testimonial: Testimonial) => {
    // For now, we'll just cancel editing since testimonial editing would need 
    // a more complex implementation with the storage layer
    // In a real app, you'd call updateTestimonialInWidget here
    cancelEditing();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return (
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (widget.testimonials.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Testimonials in "{widget.name}"
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="mb-2">No testimonials yet.</p>
          <p className="text-sm">Add Twitter URLs above to populate this widget!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Testimonials in "{widget.name}"
        </h3>
        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full">
          {widget.testimonials.length} testimonial{widget.testimonials.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {widget.testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
          >
            {editingTestimonial === testimonial.id ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editFormData.title || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content
                  </label>
                  <textarea
                    value={editFormData.content || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleSaveEdit(testimonial)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-gray-100 dark:border-gray-600"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
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
                  </div>

                  <div className="flex items-center gap-2">
                    {getPlatformIcon(testimonial.platform)}
                    {!testimonial.isEmbed && (
                      <button
                        onClick={() => startEditing(testimonial)}
                        className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                        title="Edit testimonial"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete testimonial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {testimonial.rating && (
                  <div className="mb-3">
                    {renderStars(testimonial.rating)}
                  </div>
                )}

                <div className="mb-3">
                  {testimonial.isEmbed ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm">
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Twitter Embed Content:
                      </p>
                      <div className="max-h-20 overflow-hidden text-gray-500 dark:text-gray-500 text-xs">
                        {testimonial.content.substring(0, 200)}...
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                      {testimonial.content}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{testimonial.date}</span>
                  {testimonial.originalUrl && (
                    <a
                      href={testimonial.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Original
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 