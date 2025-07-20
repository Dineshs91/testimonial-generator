"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, Edit3, ExternalLink } from "lucide-react";
import type { Widget } from "../types/widget";
import { getWidgets, deleteWidget } from "../utils/storage";

interface WidgetListProps {
  selectedWidget: Widget | null;
  onWidgetSelect: (widget: Widget) => void;
  onCreateClick: () => void;
  onEditClick: (widget: Widget) => void;
  onWidgetDeleted: (widgetId: string) => void;
}

export default function WidgetList({ 
  selectedWidget, 
  onWidgetSelect, 
  onCreateClick,
  onEditClick,
  onWidgetDeleted 
}: WidgetListProps) {
  const [widgets, setWidgets] = useState<Widget[]>([]);

  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = () => {
    const savedWidgets = getWidgets();
    setWidgets(savedWidgets);
  };

  const handleDeleteWidget = (widget: Widget, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${widget.name}"? This will permanently remove all ${widget.testimonials.length} testimonials.`)) {
      const success = deleteWidget(widget.id);
      if (success) {
        setWidgets(prev => prev.filter(w => w.id !== widget.id));
        onWidgetDeleted(widget.id);
      }
    }
  };

  const handleEditWidget = (widget: Widget, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick(widget);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Refresh widgets when component receives new data
  useEffect(() => {
    loadWidgets();
  }, [selectedWidget]); // Reload when selection changes (might indicate data update)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            My Widgets
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your testimonial widgets
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Widget
        </button>
      </div>

      {widgets.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">No widgets created yet</p>
          <p className="text-sm mb-4">Create your first widget to start collecting testimonials!</p>
          <button
            onClick={onCreateClick}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Widget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`relative group p-6 rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg ${
                selectedWidget?.id === widget.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400'
              }`}
              onClick={() => onWidgetSelect(widget)}
            >
              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleEditWidget(widget, e)}
                  className="p-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  title="Edit widget"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={(e) => handleDeleteWidget(widget, e)}
                  className="p-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title="Delete widget"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300 hover:text-red-600" />
                </button>
              </div>

              {/* Selected indicator */}
              {selectedWidget?.id === widget.id && (
                <div className="absolute top-3 left-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 pr-16">
                  {widget.name}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8" />
                    </svg>
                    {widget.testimonials.length} testimonials
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Created</span>
                  <span>{formatDate(widget.createdAt)}</span>
                </div>
                {widget.updatedAt !== widget.createdAt && (
                  <div className="flex items-center justify-between">
                    <span>Updated</span>
                    <span>{formatDate(widget.updatedAt)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Widget ID</span>
                  <span className="font-mono">{widget.id.substring(0, 8)}...</span>
                </div>
              </div>

              {/* Recent testimonials preview */}
              {widget.testimonials.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Latest testimonial:</div>
                  <div className="flex items-center gap-2">
                    <img
                      src={widget.testimonials[0].avatar}
                      alt={widget.testimonials[0].name}
                      className="w-6 h-6 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {widget.testimonials[0].name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {widget.testimonials[0].content.length > 50 
                          ? `${widget.testimonials[0].content.substring(0, 50)}...`
                          : widget.testimonials[0].content
                        }
                      </p>
                    </div>
                    {widget.testimonials[0].originalUrl && (
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </div>
              )}

              {selectedWidget?.id === widget.id && (
                <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-700">
                  <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Currently selected
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 