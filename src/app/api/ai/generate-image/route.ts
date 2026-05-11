import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateImage } from '@/lib/ai';

const DEFAULT_IMAGE_PROMPT = "Generate this product on a studio product listing setting, WHITE background. Isolate the item, no person no table, only the item, and you can line it up like a product shot, so in the most aesthetically pleasing way. If only parts is visible, zoom out to capture the full item. Make the item as LARGE as possible without it sticking out of the viewport.";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { image, targetItem, customPrompt } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const promptText = targetItem?.trim()
      ? `${customPrompt || DEFAULT_IMAGE_PROMPT}\nTarget item: ${targetItem.trim()}`
      : (customPrompt || DEFAULT_IMAGE_PROMPT);

    const generatedUrl = await generateImage({
      prompt: promptText,
      inputImageDataUrl: image,
    });

    return NextResponse.json({ image: generatedUrl });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
