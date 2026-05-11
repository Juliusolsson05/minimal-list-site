const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export interface ParsedImage {
  buffer: Buffer;
  mimeType: string;
}

export function parseBase64Image(
  value: unknown,
  fallbackMimeType: string,
  maxBytes: number = MAX_IMAGE_BYTES
): ParsedImage {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('Image is required');
  }

  let mimeType = fallbackMimeType;
  let base64 = value;

  if (value.startsWith('data:')) {
    const matches = value.match(/^data:([^;]+);base64,([A-Za-z0-9+/=\s]+)$/);
    if (!matches) {
      throw new Error('Invalid image format');
    }
    mimeType = matches[1].toLowerCase();
    base64 = matches[2];
  }

  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    throw new Error('Unsupported image type');
  }

  const buffer = Buffer.from(base64.replace(/\s/g, ''), 'base64');
  if (buffer.length === 0) {
    throw new Error('Invalid image data');
  }
  if (buffer.length > maxBytes) {
    throw new Error(`Image must be ${Math.floor(maxBytes / 1024 / 1024)}MB or smaller`);
  }

  return { buffer, mimeType };
}
