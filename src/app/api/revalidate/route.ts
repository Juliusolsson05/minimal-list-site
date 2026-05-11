import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { siteConfig } from '@/lib/site-config';

// On-demand revalidation endpoint for instant cache updates
// Called after content changes to rebuild static pages

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { paths, tags, all } = body;

    const revalidated: string[] = [];

    // Revalidate all main pages
    if (all) {
      const allPaths = ['/', '/about', '/archive'];
      for (const path of allPaths) {
        revalidatePath(path);
        revalidated.push(path);
      }
      // Also revalidate dynamic routes
      revalidatePath('/item/[id]', 'page');
      revalidated.push('/item/[id]');
      if (siteConfig.features.posters) {
        revalidatePath('/poster/[id]', 'page');
        revalidated.push('/poster/[id]');
      }
    }

    // Revalidate specific paths
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path);
        revalidated.push(path);
      }
    }

    // Revalidate by cache tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        revalidateTag(tag);
        revalidated.push(`tag:${tag}`);
      }
    }

    return NextResponse.json({
      success: true,
      revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error revalidating:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}
