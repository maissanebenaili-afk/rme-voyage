import { NextRequest, NextResponse } from "next/server";

import { buildFerryAffiliateUrl, buildFlightAffiliateUrl } from "@/lib/affiliate";

type AffiliateType = "flight" | "ferry";

function getAffiliateType(value: string | null): AffiliateType | null {
  if (value === "flight" || value === "ferry") {
    return value;
  }

  return null;
}

function getRequiredParam(
  searchParams: URLSearchParams,
  key: "origin" | "destination",
) {
  const value = searchParams.get(key)?.trim();
  return value || null;
}

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = getAffiliateType(searchParams.get("type"));
  const origin = getRequiredParam(searchParams, "origin");
  const destination = getRequiredParam(searchParams, "destination");
  const date = searchParams.get("date")?.trim() || undefined;

  if (!type || !origin || !destination) {
    return NextResponse.json({ error: "Invalid affiliate request." }, { status: 400 });
  }

  if (type === "flight") {
    const affiliateUrl = buildFlightAffiliateUrl({ origin, destination, date });
    return NextResponse.json({
      configured: Boolean(affiliateUrl),
      affiliateUrl,
      provider: affiliateUrl ? "travelpayouts" : null,
    }, { headers: { 'Cache-Control': 'no-store' } });
  }

  const ferry = buildFerryAffiliateUrl({ origin, destination, date });
  return NextResponse.json({
    configured: Boolean(ferry),
    affiliateUrl: ferry?.url ?? null,
    provider: ferry?.provider ?? null,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
