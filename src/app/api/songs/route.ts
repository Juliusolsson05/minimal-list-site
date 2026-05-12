import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateSlug } from '@/lib/slug';
import { uploadImage, getSongImagePath } from '@/lib/supabase';
import { parseBase64Image } from '@/lib/api/images';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    const songs = await prisma.song.findMany({
      where: {
        archivedAt: null,
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, artist, album, image, imageType, link, addedAt } = body;

    if (!name || !artist || !image) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const songId = `song_${randomBytes(12).toString('hex')}`;
    const parsedImage = parseBase64Image(image, imageType || 'image/jpeg');
    const imagePath = getSongImagePath(songId);
    const { url: imageUrl } = await uploadImage(imagePath, parsedImage.buffer, parsedImage.mimeType);

    let slug = generateSlug(`${artist}-${name}`);
    let slugCounter = 1;
    while (await prisma.song.findUnique({ where: { slug } })) {
      slug = `${generateSlug(`${artist}-${name}`)}-${slugCounter}`;
      slugCounter++;
    }

    const song = await prisma.song.create({
      data: {
        id: songId,
        name,
        slug,
        artist,
        album: album || null,
        imageUrl,
        link: link || null,
        addedAt: addedAt ? new Date(addedAt) : new Date(),
      },
    });

    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    console.error('Error creating song:', error);
    if (error instanceof Error && error.message.includes('image')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create song' },
      { status: 500 }
    );
  }
}
