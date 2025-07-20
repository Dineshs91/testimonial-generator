import type { Widget, WidgetSettings, CreateWidgetRequest } from "../types/widget";
import type { Testimonial } from "../types/testimonial";

const STORAGE_KEY = 'testimonial-widgets';

// Generate UUID v4
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Default widget settings
const defaultSettings: WidgetSettings = {
  showNavigation: true,
  showPagination: true,
  autoSlide: false,
  slideInterval: 5000,
  theme: 'light',
  testimonialsPerPage: 3
};

// Get all widgets from localStorage
export function getWidgets(): Widget[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading widgets from localStorage:', error);
    return [];
  }
}

// Save widgets to localStorage
export function saveWidgets(widgets: Widget[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  } catch (error) {
    console.error('Error saving widgets to localStorage:', error);
  }
}

// Get single widget by ID
export function getWidget(id: string): Widget | null {
  const widgets = getWidgets();
  return widgets.find(w => w.id === id) || null;
}

// Create new widget
export function createWidget(request: CreateWidgetRequest): Widget {
  const now = new Date().toISOString();
  const widget: Widget = {
    id: generateUUID(),
    name: request.name,
    createdAt: now,
    updatedAt: now,
    testimonials: [],
    settings: { ...defaultSettings, ...request.settings }
  };

  const widgets = getWidgets();
  widgets.push(widget);
  saveWidgets(widgets);

  return widget;
}

// Update widget
export function updateWidget(id: string, updates: Partial<Widget>): Widget | null {
  const widgets = getWidgets();
  const index = widgets.findIndex(w => w.id === id);
  
  if (index === -1) return null;

  widgets[index] = {
    ...widgets[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveWidgets(widgets);
  return widgets[index];
}

// Delete widget
export function deleteWidget(id: string): boolean {
  const widgets = getWidgets();
  const filteredWidgets = widgets.filter(w => w.id !== id);
  
  if (filteredWidgets.length === widgets.length) return false;
  
  saveWidgets(filteredWidgets);
  return true;
}

// Add testimonial to widget
export function addTestimonialToWidget(widgetId: string, testimonial: Testimonial): Widget | null {
  const widget = getWidget(widgetId);
  if (!widget) return null;

  widget.testimonials.unshift(testimonial); // Add to beginning
  return updateWidget(widgetId, { testimonials: widget.testimonials });
}

// Update testimonial in widget
export function updateTestimonialInWidget(
  widgetId: string, 
  testimonialId: string, 
  updates: Partial<Testimonial>
): Widget | null {
  const widget = getWidget(widgetId);
  if (!widget) return null;

  const testimonialIndex = widget.testimonials.findIndex(t => t.id === testimonialId);
  if (testimonialIndex === -1) return null;

  widget.testimonials[testimonialIndex] = {
    ...widget.testimonials[testimonialIndex],
    ...updates
  };

  return updateWidget(widgetId, { testimonials: widget.testimonials });
}

// Delete testimonial from widget
export function deleteTestimonialFromWidget(widgetId: string, testimonialId: string): Widget | null {
  const widget = getWidget(widgetId);
  if (!widget) return null;

  widget.testimonials = widget.testimonials.filter(t => t.id !== testimonialId);
  return updateWidget(widgetId, { testimonials: widget.testimonials });
}

// Clear all widgets (for development/testing)
export function clearAllWidgets(): void {
  localStorage.removeItem(STORAGE_KEY);
} 