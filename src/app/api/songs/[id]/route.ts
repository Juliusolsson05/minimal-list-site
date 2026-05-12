import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImage, getSongImagePath } from '@/lib/supabase';
import { parseBase64Image } from '@/lib/api/images';
import { Prisma } from '@prisma/client';

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
    const { name, artist, album, image, imageType, link, addedAt, archived } = body;

    const updateData: Prisma.SongUncheckedUpdateInput = {
      ...(typeof name === 'string' && { name }),
      ...(typeof artist === 'string' && { artist }),
      ...(typeof album === 'string' && { album: album || null }),
      ...(typeof link === 'string' && { link: link || null }),
      ...(typeof addedAt === 'string' && { addedAt: new Date(addedAt) }),
      ...(typeof archived === 'boolean' && { archivedAt: archived ? new Date() : null }),
    };

    if (image) {
      const parsedImage = parseBase64Image(image, imageType || 'image/jpeg');
      const imagePath = getSongImagePath(id);
      const { url: imageUrl } = await uploadImage(imagePath, parsedImage.buffer, parsedImage.mimeType);
      updateData.imageUrl = imageUrl;
    }

    const song = await prisma.song.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(song);
  } catch (error) {
    console.error('Error updating song:', error);
    if (error instanceof Error && error.message.includes('image')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update song' },
      { status: 500 }
    );
  }
}

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
    await prisma.song.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json(
      { error: 'Failed to delete song' },
      { status: 500 }
    );
  }
}
