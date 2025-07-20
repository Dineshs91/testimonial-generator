"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WidgetList from "./components/WidgetList";
import { getEmbedInstructions } from "./utils/testimonialGenerator";
import { getWidgets } from "./utils/storage";
import type { Widget } from "./types/widget";

export default function Home() {
  const router = useRouter();
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [showEmbedInstructions, setShowEmbedInstructions] = useState(false);

  const handleCreateClick = () => {
    router.push('/widgets/create');
  };

  const handleEditClick = (widget: Widget) => {
    router.push(`/widgets/edit/${widget.id}`);
  };

  const handleWidgetDeleted = (widgetId: string) => {
    if (selectedWidget?.id === widgetId) {
      const widgets = getWidgets();
      const remainingWidgets = widgets.filter(w => w.id !== widgetId);
      setSelectedWidget(remainingWidgets.length > 0 ? remainingWidgets[0] : null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Testimonial Generator
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Create and manage multiple testimonial widgets with real Twitter/X embeds
          </p>
          <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
            🎯 Auto-saved to localStorage - No API required, No rate limits!
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

        {/* Widget Management */}
        <div className="max-w-6xl mx-auto mb-12">
          <WidgetList
            selectedWidget={selectedWidget}
            onWidgetSelect={setSelectedWidget}
            onCreateClick={handleCreateClick}
            onEditClick={handleEditClick}
            onWidgetDeleted={handleWidgetDeleted}
          />
        </div>

        {/* Getting Started Guide */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              🚀 Getting Started
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="text-center">
                <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Create Widget
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Click "Create Widget" to set up a new testimonial widget with custom settings
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Add Testimonials
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Paste Twitter/X URLs to automatically import authentic testimonials with official embeds
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Embed & Deploy
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Copy the generated embed code and paste it into your website to display testimonials
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                🎯 Create Your First Widget
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
