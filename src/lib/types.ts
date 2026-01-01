export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: Author;
  tags: string[];
  categoryId: string | null;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  readingTime: number;
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  email?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
    download_location: string;
  };
  width: number;
  height: number;
}

export interface UnsplashSearchResult {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

export interface SiteSettings {
  title: string;
  icon: string; // Emoji
  description: string;
  unsplashApiKey: string;
  adminPassword: string;
  showFooter?: boolean;
  footerText?: string;
  theme?: 'ezblog1' | 'atavist' | 'supersimple';
  welcomeText?: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
