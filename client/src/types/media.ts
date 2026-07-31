export type MediaKind = 'image' | 'video' | 'audio' | 'document' | 'other';

export type MediaAsset = {
  _id: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  kind: MediaKind;
  url: string;
  format?: string;
  mimeType?: string;
  bytes?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  pages?: number;
  folder?: string;
  originalFilename?: string;
  displayName?: string;
  alt?: string;
  caption?: string;
  tags?: string[];
  usageCount?: number;
  uploadedBy?: string;
  createdAt: string;
  deletedAt?: string | null;
};

export type MediaListResponse = {
  assets: MediaAsset[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
