import { NextRequest, NextResponse } from 'next/server';
import { getPostsBySection } from '../../../../db/posts';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sectionSlug = searchParams.get('section');

  if (!sectionSlug) {
    return NextResponse.json({ error: 'Section slug required' }, { status: 400 });
  }

  try {
    const posts = await getPostsBySection(sectionSlug);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}