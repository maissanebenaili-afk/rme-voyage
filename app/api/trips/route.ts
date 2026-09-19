import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, type Trip } from '../../../packages/utils/supabase';

export const runtime = 'edge';

// Mock trips data (fallback when Supabase is not configured)
const mockTrips = Object.create(null) as Record<string, any[]>;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // planning, ongoing, completed

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let filteredTrips: any[] = [];

    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('trips').select('*').eq('user_id', userId);
      if (status) {
        query = query.eq('status', status);
      }
      const { data, error } = await query;
      if (error) {
        console.error('[Trips API] Database GET error');
        return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
      }
      filteredTrips = data || [];
    } else {
      const userTrips = mockTrips[userId] || [];
      filteredTrips = status ? userTrips.filter((trip) => trip.status === status) : userTrips;
    }

    return NextResponse.json({
      success: true,
      data: filteredTrips,
      count: filteredTrips.length,
      userId,
    });
  } catch (error) {
    console.error('[Trips API] GET error');
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Explicitly extract only expected fields to prevent prototype pollution
    const userId = body.userId as string;
    const origin = body.origin as string;
    const destination = body.destination as string;
    const startDate = body.startDate as string;
    const endDate = body.endDate as string;
    const budgetUsd = body.budgetUsd as number | undefined;
    const currency = (body.currency as string) || 'USD';

    // Validate required fields
    if (!userId || !origin || !destination || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, origin, destination, startDate, endDate' },
        { status: 400 }
      );
    }

    // Validate date format
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const newTrip = {
      user_id: userId,
      origin,
      destination,
      start_date: startDate,
      end_date: endDate,
      budget_usd: budgetUsd || null,
      currency,
      status: 'planning',
    };

    let createdTrip = newTrip;

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('trips').insert([newTrip]).select();
      if (error) {
        console.error('[Trips API] Database POST error');
        return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
      }
      createdTrip = data?.[0] || newTrip;
    } else {
      const tripId = crypto.randomUUID();
      createdTrip = {
        id: tripId,
        user_id: userId,
        origin,
        destination,
        start_date: startDate,
        end_date: endDate,
        budget_usd: budgetUsd || null,
        currency,
        status: 'planning',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;
      if (!mockTrips[userId]) {
        mockTrips[userId] = [];
      }
      mockTrips[userId].push(createdTrip);
    }

    return NextResponse.json({
      success: true,
      message: 'Trip created successfully',
      data: createdTrip,
    });
  } catch (error) {
    console.error('[Trips API] POST error');
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // Explicitly extract only expected fields to prevent prototype pollution
    const tripId = body.tripId as string;
    const userId = body.userId as string;
    const status = body.status as string | undefined;
    const budgetUsd = body.budgetUsd as number | undefined;

    if (!tripId || !userId) {
      return NextResponse.json(
        { error: 'Trip ID and User ID are required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (budgetUsd !== undefined) updateData.budget_usd = budgetUsd;

    let updatedTrip: any = null;

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('trips')
        .update(updateData)
        .eq('id', tripId)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('[Trips API] Database PUT error');
        return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
      }

      if (!data || data.length === 0) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }

      updatedTrip = data[0];
    } else {
      const userTrips = mockTrips[userId] || [];
      const tripIndex = userTrips.findIndex((t) => t.id === tripId);

      if (tripIndex === -1) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }

      const existingTrip = userTrips[tripIndex];
      updatedTrip = {
        id: existingTrip.id,
        user_id: existingTrip.user_id,
        origin: existingTrip.origin,
        destination: existingTrip.destination,
        start_date: existingTrip.start_date,
        end_date: existingTrip.end_date,
        budget_usd: updateData.budget_usd !== undefined ? updateData.budget_usd : existingTrip.budget_usd,
        currency: existingTrip.currency,
        status: updateData.status || existingTrip.status,
        created_at: existingTrip.created_at,
        updated_at: updateData.updated_at,
      };
      userTrips[tripIndex] = updatedTrip;
    }

    return NextResponse.json({
      success: true,
      message: 'Trip updated successfully',
      data: updatedTrip,
    });
  } catch (error) {
    console.error('[Trips API] PUT error');
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get('tripId');
    const userId = searchParams.get('userId');

    if (!tripId || !userId) {
      return NextResponse.json(
        { error: 'Trip ID and User ID are required' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)
        .eq('user_id', userId);

      if (error) {
        console.error('[Trips API] Database DELETE error');
        return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
      }
    } else {
      const userTrips = mockTrips[userId] || [];
      const tripIndex = userTrips.findIndex((t) => t.id === tripId);

      if (tripIndex === -1) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }

      userTrips.splice(tripIndex, 1);
    }

    return NextResponse.json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    console.error('[Trips API] DELETE error');
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}
