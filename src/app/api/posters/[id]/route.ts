import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImage, getPosterImagePath } from '@/lib/supabase';
import { parseBase64Image } from '@/lib/api/images';
import { Prisma } from '@prisma/client';

// GET /api/posters/[id] - Get a single poster (admin use - no image bytes)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const poster = await prisma.poster.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        imageOriginalUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!poster) {
      return NextResponse.json({ error: 'Poster not found' }, { status: 404 });
    }

    return NextResponse.json(poster);
  } catch (error) {
    console.error('Error fetching poster:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poster' },
      { status: 500 }
    );
  }
}

// PUT /api/posters/[id] - Update a poster (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, image, imageType, imageOriginal, imageOriginalType, archived } = body;

    const updateData: Prisma.PosterUncheckedUpdateInput = {
      ...(typeof name === 'string' && { name }),
      ...(typeof description === 'string' && { description }),
      ...(typeof archived === 'boolean' && { archivedAt: archived ? new Date() : null }),
    };

    // Handle main image update if provided
    if (image) {
      const parsedImage = parseBase64Image(image, imageType || 'image/jpeg');

      // Upload to Supabase Storage (overwrites existing file at same path)
      const imagePath = getPosterImagePath(id, false);
      const { url: imageUrl } = await uploadImage(imagePath, parsedImage.buffer, parsedImage.mimeType);
      updateData.imageUrl = imageUrl;
    }

    // Handle original image update if provided
    if (imageOriginal) {
      const parsedOriginalImage = parseBase64Image(imageOriginal, imageOriginalType || 'image/jpeg');

      // Upload to Supabase Storage (overwrites existing file at same path)
      const originalPath = getPosterImagePath(id, true);
      const { url: imageOriginalUrl } = await uploadImage(originalPath, parsedOriginalImage.buffer, parsedOriginalImage.mimeType);
      updateData.imageOriginalUrl = imageOriginalUrl;
    }

    const poster = await prisma.poster.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(poster);
  } catch (error) {
    console.error('Error updating poster:', error);
    if (error instanceof Error && error.message.includes('image')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update poster' },
      { status: 500 }
    );
  }
}

// DELETE /api/posters/[id] - Delete a poster (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.poster.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting poster:', error);
    return NextResponse.json(
      { error: 'Failed to delete poster' },
      { status: 500 }
    );
  }
}
