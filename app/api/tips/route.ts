import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, type CommunityTip } from '../../../packages/utils/supabase';

export const runtime = 'edge';

// Mock community tips data (fallback when Supabase is not configured)
const mockTips = {
  Marrakech: [
    {
      id: '1',
      user: 'Fatima_Paris',
      tip: 'Riad Karmela has amazing tagine and free WiFi. Book ahead!',
      category: 'accommodation',
      rating: 4.8,
      upvotes: 234,
    },
    {
      id: '2',
      user: 'Hassan_London',
      tip: "Don't miss the Souk near Bab Agnaou - best prices for leather goods",
      category: 'shopping',
      rating: 4.7,
      upvotes: 156,
    },
    {
      id: '3',
      user: 'Leila_Brussels',
      tip: 'Use Maroc Telecom SIM for best coverage. Get it at the airport',
      category: 'practical',
      rating: 4.9,
      upvotes: 189,
    },
  ],
  Tangier: [
    {
      id: '4',
      user: 'Ahmed_Berlin',
      tip: 'Ferry from Tarifa (Spain) is cheaper than from Algeciras',
      category: 'transport',
      rating: 4.6,
      upvotes: 145,
    },
    {
      id: '5',
      user: 'Noor_Amsterdam',
      tip: 'Stay in the Medina for authentic experience. Avoid Ville Nouvelle at night',
      category: 'safety',
      rating: 4.5,
      upvotes: 128,
    },
  ],
  Casablanca: [
    {
      id: '6',
      user: 'Mohamed_Montreal',
      tip: 'Hassan II Mosque is stunning. Dress respectfully, modest clothing',
      category: 'culture',
      rating: 4.9,
      upvotes: 267,
    },
    {
      id: '7',
      user: 'Yasmin_Paris',
      tip: 'Take the train to Fez - faster and cheaper than bus',
      category: 'transport',
      rating: 4.8,
      upvotes: 201,
    },
  ],
};

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
        console.error('[Tips API] Supabase GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch tips' }, { status: 500 });
      }
      tips = data || [];
    } else {
      tips = location ? mockTips[location as keyof typeof mockTips] || [] : Object.values(mockTips).flat();

      if (category) {
        tips = tips.filter((t) => t.category === category);
      }

      if (sort === 'upvotes') {
        tips.sort((a, b) => b.upvotes - a.upvotes);
      } else if (sort === 'rating') {
        tips.sort((a, b) => b.rating - a.rating);
      }
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
    console.error('[Tips API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tips' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const location = body.location as string;
    const category = (body.category as string) || 'general';
    const content = body.content as string;
    const userId = body.userId as string;

    if (!location || !content || !userId) {
      return NextResponse.json(
        { error: 'Location, content, and userId are required' },
        { status: 400 }
      );
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
        console.error('[Tips API] Supabase POST Error:', error);
        return NextResponse.json({ error: 'Failed to create tip' }, { status: 500 });
      }
      createdTip = data?.[0] || newTip;
    } else {
      createdTip = {
        id: Math.random().toString(36).substr(2, 9),
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
    console.error('[Tips API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create tip' },
      { status: 500 }
    );
  }
}
