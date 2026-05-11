import { NextRequest, NextResponse } from 'next/server';
import { Schema, Type } from '@google/genai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateJSON } from '@/lib/ai';

interface ListingResult {
  title: string;
  price: string;
  tagline: string;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { image, productName, productPrice, promptNote } = body;

    if (!image || !productName || !productPrice) {
      return NextResponse.json(
        { error: 'Image, product name, and price are required' },
        { status: 400 }
      );
    }

    const prompt = `
      Analyze this product image and the provided details.
      Product Name: ${productName}
      Price: ${productPrice}
      ${promptNote ? `Prompt Note: ${promptNote}` : ''}

      Tasks:
      1. Fix the grammar, spelling, and formatting of the Product Name (Title).
      2. Format the price appropriately (e.g., add currency symbol if missing, ensure standard format).
      3. Write a 5-word direct tagline.
      4. Write a 3-sentence direct description.

      Style Rules:
      - All descriptions must be DIRECT.
      - NO sentimental language.
      - NO marketing fluff (e.g., avoid "stunning", "perfect for", "you will love").
      - Focus on features, materials, and specs.

      Return JSON.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        price: { type: Type.STRING },
        tagline: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ['title', 'price', 'tagline', 'description'],
    };

    const data = await generateJSON<ListingResult>({
      prompt,
      imageDataUrl: image,
      schema,
      schemaName: 'product_listing',
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error generating listing:', error);
    return NextResponse.json(
      { error: 'Failed to generate listing' },
      { status: 500 }
    );
  }
}
