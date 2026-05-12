import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImage, getItemImagePath } from '@/lib/supabase';
import { parseBase64Image } from '@/lib/api/images';
import { Prisma } from '@prisma/client';

// GET /api/items/[id] - Get a single item (admin use - no image bytes)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.item.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        details: true,
        price: true,
        link: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

// PUT /api/items/[id] - Update an item (admin only)
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
    const { name, description, details, price, image, imageType, imageOriginal, imageOriginalType, link, categoryId, archived } = body;

    const updateData: Prisma.ItemUncheckedUpdateInput = {
      ...(typeof name === 'string' && { name }),
      ...(typeof description === 'string' && { description }),
      ...(typeof details === 'string' && { details }),
      ...(typeof price === 'string' && { price }),
      ...(typeof link === 'string' && { link }),
      ...(typeof categoryId === 'string' && { categoryId }),
      ...(typeof archived === 'boolean' && { archivedAt: archived ? new Date() : null }),
    };

    // Handle image update if provided
    if (image) {
      const parsedImage = parseBase64Image(image, imageType || 'image/jpeg');

      // Upload to configured storage (overwrites existing file at same path)
      const imagePath = getItemImagePath(id, false);
      const { url: imageUrl } = await uploadImage(imagePath, parsedImage.buffer, parsedImage.mimeType);
      updateData.imageUrl = imageUrl;
    }

    // Handle original image update if provided
    if (imageOriginal) {
      const parsedOriginalImage = parseBase64Image(imageOriginal, imageOriginalType || 'image/jpeg');

      // Upload to configured storage (overwrites existing file at same path)
      const originalPath = getItemImagePath(id, true);
      const { url: imageOriginalUrl } = await uploadImage(originalPath, parsedOriginalImage.buffer, parsedOriginalImage.mimeType);
      updateData.imageOriginalUrl = imageOriginalUrl;
    }

    const item = await prisma.item.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    if (error instanceof Error && error.message.includes('image')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - Delete an item (admin only)
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
    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
