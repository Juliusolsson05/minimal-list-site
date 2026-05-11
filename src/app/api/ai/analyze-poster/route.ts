import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateJSON } from '@/lib/ai';

interface PosterAnalysis {
  name: string;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const prompt = `
      Analyze this poster image and provide:
      1. A concise name for the poster (2-6 words, descriptive title)
      2. A brief description (1-2 sentences describing the artwork, style, and subject matter)

      Be specific and accurate. Focus on what is visually depicted.
      - If it's a movie poster, include the movie name.
      - If it's an art print, describe the artistic style and subject.
      - If it's a band/concert poster, include the artist name.
      - If it's a vintage advertisement, describe the product/brand and era.
      - If there's text visible, use it to inform your response.

      Return JSON with "name" and "description" fields.
    `;

    const data = await generateJSON<PosterAnalysis>({
      prompt,
      imageDataUrl: image,
      schemaName: 'poster_analysis',
      schema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ['name', 'description'],
      },
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error analyzing poster:', error);
    return NextResponse.json(
      { error: 'Failed to analyze poster' },
      { status: 500 }
    );
  }
}
