import { NextResponse } from "next/server";
import { getPartnerCatalogue } from "@/lib/partnerCatalogue";

export function GET() {
  return NextResponse.json(
    { partners: getPartnerCatalogue() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
