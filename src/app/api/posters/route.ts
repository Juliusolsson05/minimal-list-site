import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateSlug } from '@/lib/slug';
import { uploadImage, getPosterImagePath } from '@/lib/supabase';
import { parseBase64Image } from '@/lib/api/images';
import { randomBytes } from 'crypto';

// GET /api/posters - Get all posters
export async function GET() {
  try {
    const posters = await prisma.poster.findMany({
      where: {
        archivedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(posters);
  } catch (error) {
    console.error('Error fetching posters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posters' },
      { status: 500 }
    );
  }
}

// POST /api/posters - Create a new poster (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, image, imageType, imageOriginal, imageOriginalType } = body;

    if (!name || !description || !image) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique poster ID
    const posterId = `poster_${randomBytes(12).toString('hex')}`;

    const parsedImage = parseBase64Image(image, imageType || 'image/jpeg');

    // Upload main image to configured storage
    const imagePath = getPosterImagePath(posterId, false);
    const { url: imageUrl } = await uploadImage(imagePath, parsedImage.buffer, parsedImage.mimeType);

    // Upload original image if provided
    let imageOriginalUrl: string | undefined;
    if (imageOriginal) {
      const parsedOriginalImage = parseBase64Image(imageOriginal, imageOriginalType || 'image/jpeg');

      const originalPath = getPosterImagePath(posterId, true);
      const { url } = await uploadImage(originalPath, parsedOriginalImage.buffer, parsedOriginalImage.mimeType);
      imageOriginalUrl = url;
    }

    // Generate slug from poster name
    let slug = generateSlug(name);

    // Ensure slug is unique
    let slugCounter = 1;
    while (await prisma.poster.findUnique({ where: { slug } })) {
      slug = `${generateSlug(name)}-${slugCounter}`;
      slugCounter++;
    }

    const poster = await prisma.poster.create({
      data: {
        id: posterId,
        name,
        slug,
        description,
        imageUrl,
        imageOriginalUrl,
      },
    });

    return NextResponse.json(poster, { status: 201 });
  } catch (error) {
    console.error('Error creating poster:', error);
    if (error instanceof Error && error.message.includes('image')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create poster' },
      { status: 500 }
    );
  }
}
