import { createClient } from '@supabase/supabase-js';
import { mkdir, rm, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageDriver = process.env.STORAGE_DRIVER || 'local';

// Storage bucket name
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'minimal-list';

function shouldUseLocalStorage() {
  return storageDriver === 'local' || !supabaseUrl || !supabaseServiceKey;
}

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper to get public URL for an image
export function getPublicUrl(path: string): string {
  if (shouldUseLocalStorage()) {
    return `/uploads/${path}`;
  }

  const { data } = getSupabaseAdmin().storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function toBuffer(file: Buffer | Blob): Promise<Buffer> {
  if (Buffer.isBuffer(file)) {
    return file;
  }

  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Helper to upload an image
export async function uploadImage(
  path: string,
  file: Buffer | Blob,
  contentType: string = 'image/jpeg'
): Promise<{ url: string; path: string }> {
  if (shouldUseLocalStorage()) {
    const uploadsPath = join(process.cwd(), 'public', 'uploads', path);
    await mkdir(dirname(uploadsPath), { recursive: true });
    await writeFile(uploadsPath, await toBuffer(file));

    return {
      url: `/uploads/${path}`,
      path,
    };
  }

  const { data, error } = await getSupabaseAdmin().storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType,
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const publicUrl = getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}

// Helper to delete an image
export async function deleteImage(path: string): Promise<void> {
  if (shouldUseLocalStorage()) {
    await rm(join(process.cwd(), 'public', 'uploads', path), { force: true });
    return;
  }

  const { error } = await getSupabaseAdmin().storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

// Helper to generate storage path for items
export function getItemImagePath(itemId: string, original: boolean = false): string {
  return `items/${itemId}${original ? '-original' : ''}.jpg`;
}

// Helper to generate storage path for posters
export function getPosterImagePath(posterId: string, original: boolean = false): string {
  return `posters/${posterId}${original ? '-original' : ''}.jpg`;
}

// Helper to generate storage path for music cover art
export function getSongImagePath(songId: string): string {
  return `songs/${songId}.jpg`;
}
