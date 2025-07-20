export interface Testimonial {
  id: string;
  name: string;
  title?: string;
  handle?: string;
  avatar: string;
  content: string;
  rating?: number;
  date: string;
  platform: 'twitter' | 'slack' | 'linkedin' | 'other';
  isEmbed?: boolean; // Flag to indicate if content is an HTML embed
  originalUrl?: string; // Original tweet URL for embeds
} 