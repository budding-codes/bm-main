const DEFAULT_HOST = 'https://res.cloudinary.com';
const RESPONSIVE_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1600];

function cloudName() {
  // Cloud name is not a secret; it also appears in every delivery URL.
  return (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'vivek-bmpromo').trim();
}

type DeliveryOptions = {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  format?: string;
  resourceType?: 'image' | 'video' | 'raw';
};

export function buildDeliveryUrl(publicId: string, options: DeliveryOptions = {}) {
  const name = cloudName();
  if (!publicId || !name) {
    return '';
  }

  const parts = [
    `f_${options.format || 'auto'}`,
    `q_${options.quality || 'auto'}`
  ];

  if (options.width) parts.push(`w_${Math.round(options.width)}`);
  if (options.height) parts.push(`h_${Math.round(options.height)}`);
  if (options.width || options.height) parts.push(`c_${options.crop || 'limit'}`);

  return [
    DEFAULT_HOST,
    name,
    options.resourceType || 'image',
    'upload',
    parts.join(','),
    publicId
  ].join('/');
}

export function buildSrcSet(publicId: string, options: DeliveryOptions = {}) {
  const name = cloudName();
  if (!publicId || !name) {
    return '';
  }

  return RESPONSIVE_WIDTHS.map(
    (width) => `${buildDeliveryUrl(publicId, { ...options, width })} ${width}w`
  ).join(', ');
}
