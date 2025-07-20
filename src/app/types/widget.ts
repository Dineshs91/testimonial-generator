import type { Testimonial } from "./testimonial";

export interface Widget {
  id: string; // UUID
  name: string;
  createdAt: string;
  updatedAt: string;
  testimonials: Testimonial[];
  settings: WidgetSettings;
}

export interface WidgetSettings {
  showNavigation: boolean;
  showPagination: boolean;
  autoSlide: boolean;
  slideInterval: number;
  theme: 'light' | 'dark';
  testimonialsPerPage?: number;
}

export interface CreateWidgetRequest {
  name: string;
  settings?: Partial<WidgetSettings>;
}

export interface UpdateWidgetRequest {
  name?: string;
  settings?: Partial<WidgetSettings>;
} 