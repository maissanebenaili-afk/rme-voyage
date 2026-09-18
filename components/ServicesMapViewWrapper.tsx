"use client";

import dynamic from "next/dynamic";
import type { ServicePoint } from "@/app/api/services/route";

const ServicesMapView = dynamic(() => import("./ServicesMapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-xl bg-sable-100 text-sm text-sable-600">
      Chargement de la carte...
    </div>
  ),
});

type ServicesMapViewWrapperProps = {
  center: { lat: number; lon: number };
  results: ServicePoint[];
};

export default function ServicesMapViewWrapper(props: ServicesMapViewWrapperProps) {
  return <ServicesMapView {...props} />;
}
