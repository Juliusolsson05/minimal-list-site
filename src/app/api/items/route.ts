import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateSlug } from '@/lib/slug';
import { uploadImage, getItemImagePath } from '@/lib/supabase';
import { parseBase64Image } from '@/lib/api/images';
import { randomBytes } from 'crypto';

// GET /api/items - Get all items (optionally filtered by category)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categorySlug = searchParams.get('category');

    const items = await prisma.item.findMany({
      where: {
        archivedAt: null,
        ...(categorySlug && categorySlug !== 'all'
          ? {
              category: {
                slug: categorySlug,
              },
            }
          : {}),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST /api/items - Create a new item (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, details, price, image, imageType, imageOriginal, imageOriginalType, link, categoryId } = body;

    if (!name || !description || !details || !image || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique item ID
    const itemId = `item_${randomBytes(12).toString('hex')}`;

    const parsedImage = parseBase64Image(image, imageType || 'image/jpeg');

    // Upload main image to configured storage
    const imagePath = getItemImagePath(itemId, false);
    const { url: imageUrl } = await uploadImage(imagePath, parsedImage.buffer, parsedImage.mimeType);

    // Upload original image if provided
    let imageOriginalUrl: string | undefined;
    if (imageOriginal) {
      const parsedOriginalImage = parseBase64Image(imageOriginal, imageOriginalType || 'image/jpeg');

      const originalPath = getItemImagePath(itemId, true);
      const { url } = await uploadImage(originalPath, parsedOriginalImage.buffer, parsedOriginalImage.mimeType);
      imageOriginalUrl = url;
    }

    // Generate slug from item name
    let slug = generateSlug(name);

    // Ensure slug is unique
    let slugCounter = 1;
    while (await prisma.item.findUnique({ where: { slug } })) {
      slug = `${generateSlug(name)}-${slugCounter}`;
      slugCounter++;
    }

    const item = await prisma.item.create({
      data: {
        id: itemId,
        name,
        slug,
        description,
        details,
        price,
        imageUrl,
        imageOriginalUrl,
        link,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    if (error instanceof Error && error.message.includes('image')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
