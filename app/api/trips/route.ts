import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Mock trips data (will be replaced with Supabase queries)
const mockTrips: Record<string, any[]> = {};

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

    // TODO: Query Supabase for user's trips
    const userTrips = mockTrips[userId] || [];

    let filteredTrips = userTrips;
    if (status) {
      filteredTrips = userTrips.filter((trip) => trip.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filteredTrips,
      count: filteredTrips.length,
      userId,
    });
  } catch (error) {
    console.error('[Trips API] GET Error:', error);
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

    // Create trip object
    const tripId = Math.random().toString(36).substr(2, 9);
    const newTrip = {
      id: tripId,
      userId,
      origin,
      destination,
      startDate,
      endDate,
      budgetUsd: budgetUsd || null,
      currency,
      status: 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Save to Supabase
    if (!mockTrips[userId]) {
      mockTrips[userId] = [];
    }
    mockTrips[userId].push(newTrip);

    return NextResponse.json({
      success: true,
      message: 'Trip created successfully',
      data: newTrip,
    });
  } catch (error) {
    console.error('[Trips API] POST Error:', error);
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

    // TODO: Update trip in Supabase
    const userTrips = mockTrips[userId] || [];
    const tripIndex = userTrips.findIndex((t) => t.id === tripId);

    if (tripIndex === -1) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const updatedTrip = {
      ...userTrips[tripIndex],
      ...(status && { status }),
      ...(budgetUsd !== undefined && { budgetUsd }),
      updatedAt: new Date().toISOString(),
    };

    userTrips[tripIndex] = updatedTrip;

    return NextResponse.json({
      success: true,
      message: 'Trip updated successfully',
      data: updatedTrip,
    });
  } catch (error) {
    console.error('[Trips API] PUT Error:', error);
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

    // TODO: Delete from Supabase
    const userTrips = mockTrips[userId] || [];
    const tripIndex = userTrips.findIndex((t) => t.id === tripId);

    if (tripIndex === -1) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    userTrips.splice(tripIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    console.error('[Trips API] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}
