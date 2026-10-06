import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, type CommunityTip } from '../../../packages/utils/supabase';

export const runtime = 'edge';

const MAX_LOCATION_CHARS = 100;
const MAX_CATEGORY_CHARS = 40;
const MAX_CONTENT_CHARS = 1000;

// No invented tips: without community storage the list is empty. Seven fake
// users ("Fatima_Paris", 234 upvotes…) used to be served here (2026-10-04).
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'rating'; // rating, upvotes, recent

    let tips: any[] = [];

    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('community_tips').select('*');

      if (location) {
        query = query.eq('location', location);
      }

      if (category) {
        query = query.eq('category', category);
      }

      // Apply sorting
      if (sort === 'upvotes') {
        query = query.order('upvotes', { ascending: false });
      } else if (sort === 'rating') {
        query = query.order('rating', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        console.error('[Tips API] Database GET error');
        return NextResponse.json({ error: 'Failed to fetch tips' }, { status: 500 });
      }
      tips = data || [];
    } else {
      tips = [];
    }

    return NextResponse.json({
      success: true,
      data: tips,
      count: tips.length,
      location: location || 'all',
      category: category || 'all',
      sort,
    });
  } catch (error) {
    console.error('[Tips API] GET error');
    return NextResponse.json(
      { error: 'Failed to fetch tips' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const location = typeof body.location === 'string' ? body.location.trim() : '';
    const category = typeof body.category === 'string' && body.category.trim() ? body.category.trim() : 'general';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    // Identity comes from the session verified by the proxy, never from the body.
    const userId = req.headers.get('x-user-id') ?? '';

    if (!location || !content) {
      return NextResponse.json({ error: 'Location and content are required' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: sign in required' }, { status: 401 });
    }
    if (location.length > MAX_LOCATION_CHARS || category.length > MAX_CATEGORY_CHARS || content.length > MAX_CONTENT_CHARS) {
      return NextResponse.json({ error: 'Tip too long' }, { status: 413 });
    }

    const newTip = {
      user_id: userId,
      location,
      category,
      content,
      rating: 0.0,
      upvotes: 0,
      downvotes: 0,
    };

    let createdTip = newTip;

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('community_tips').insert([newTip]).select();
      if (error) {
        console.error('[Tips API] Database POST error');
        return NextResponse.json({ error: 'Failed to create tip' }, { status: 500 });
      }
      createdTip = data?.[0] || newTip;
    } else {
      createdTip = {
        id: crypto.randomUUID(),
        user: `User_${userId.slice(0, 8)}`,
        tip: content,
        category,
        rating: 0,
        upvotes: 0,
      } as any;
    }

    return NextResponse.json({
      success: true,
      message: 'Tip submitted successfully',
      data: createdTip,
    });
  } catch (error) {
    console.error('[Tips API] POST error');
    return NextResponse.json(
      { error: 'Failed to create tip' },
      { status: 500 }
    );
  }
}
