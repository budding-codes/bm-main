export type BlogStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type BlogCoverImage = {
  assetId?: string | null;
  publicId?: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type BlogSeo = {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  noIndex?: boolean;
};

export type BlogDraft = {
  title?: string;
  contentBlocks?: Record<string, unknown> | null;
  savedAt?: string | null;
};

export type Blog = {
  _id: string;
  title: string;
  description: string;
  author: string;
  youtubeUrl?: string;
  thumbnailUrl?: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt?: string;
  slug?: string;
  status?: BlogStatus;
  publishedAt?: string | null;
  scheduledFor?: string | null;
  expiresAt?: string | null;
  contentBlocks?: Record<string, unknown> | null;
  contentHtml?: string;
  contentText?: string;
  wordCount?: number;
  readingTimeMinutes?: number;
  draft?: BlogDraft;
  tags?: string[];
  categories?: string[];
  coverImage?: BlogCoverImage;
  mediaPublicIds?: string[];
  seo?: BlogSeo;
  revisionCount?: number;
};

export type BlogForm = {
  title: string;
  description: string;
  author: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  featured: boolean;
  published: boolean;
};

export const emptyBlogForm: BlogForm = {
  title: '',
  description: '',
  author: 'BM Team',
  youtubeUrl: '',
  thumbnailUrl: '',
  featured: false,
  published: true
};
