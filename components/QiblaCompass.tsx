"use client";

import { useEffect, useState } from "react";
import { Compass, Loader2, MapPin } from "lucide-react";

export default function QiblaCompass() {
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [userHeading, setUserHeading] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [location, setLocation] = useState<string>("");

  useEffect(() => {
    let watchId: number;

    async function init() {
      if (!navigator.geolocation) {
        setError(true);
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const qibla = calculateQibla(latitude, longitude);
          setQiblaDirection(qibla);
          setLocation(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
          setLoading(false);

          // Track device orientation for live compass
          if (typeof DeviceOrientationEvent !== "undefined") {
            const handler = (e: DeviceOrientationEvent) => {
              if (e.alpha !== null) {
                setUserHeading(e.alpha);
              }
            };

            // Request permission for iOS
            if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
              (DeviceOrientationEvent as any).requestPermission().then((permission: string) => {
                if (permission === "granted") {
                  window.addEventListener("deviceorientation", handler);
                  watchId = window.setInterval(() => {}, 1000) as unknown as number;
                }
              }).catch(() => {});
            } else {
              window.addEventListener("deviceorientation", handler);
            }

            return () => {
              window.removeEventListener("deviceorientation", handler);
            };
          }
        },
        () => {
          // Fallback to Paris
          const qibla = calculateQibla(48.8566, 2.3522);
          setQiblaDirection(qibla);
          setLocation("Paris (position par défaut)");
          setLoading(false);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
      );
    }

    init();
    return () => {
      if (watchId) clearInterval(watchId);
    };
  }, []);

  // Calculate Qibla direction from any location to Mecca (Kaaba)
  // Kaaba coordinates: 21.4225° N, 39.8262° E
  function calculateQibla(lat: number, lon: number): number {
    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;

    const phiK = (kaabaLat * Math.PI) / 180;
    const lambdaK = (kaabaLon * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;
    const lambda = (lon * Math.PI) / 180;

    const y = Math.sin(lambdaK - lambda);
    const x =
      Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
    const qibla = (Math.atan2(y, x) * 180) / Math.PI;

    return (qibla + 360) % 360;
  }

  if (loading)
    return (
      <div className="flex items-center gap-3 rounded-2xl border bg-white p-5 text-sm text-slate-500">
        <Loader2 size={20} className="animate-spin text-emerald-600" />
        Calcul de la direction Qibla...
      </div>
    );

  if (error || qiblaDirection === null)
    return (
      <div className="rounded-2xl border bg-white p-5 text-sm text-slate-500">
        Direction Qibla indisponible. Géolocalisation requise.
      </div>
    );

  const rotation = qiblaDirection - userHeading;
  const oppositeRotation = rotation + 180;

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Compass size={20} className="text-emerald-600" />
          Direction Qibla
        </h2>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={12} />
          {location}
        </span>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative h-48 w-48">
          {/* Compass dial */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-100 bg-gradient-to-br from-emerald-50 to-amber-50">
            {/* Cardinal directions */}
            {["N", "E", "S", "O"].map((dir, i) => (
              <div
                key={dir}
                className="absolute text-sm font-bold text-slate-400"
                style={{
                  top: i === 0 ? "8px" : i === 2 ? "calc(100% - 22px)" : "50%",
                  left: i === 1 ? "calc(100% - 22px)" : i === 3 ? "8px" : "50%",
                  transform:
                    i === 0 || i === 2
                      ? "translateX(-50%)"
                      : "translateY(-50%)",
                }}
              >
                {dir}
              </div>
            ))}
          </div>

          {/* Qibla arrow (points toward Mecca) */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="flex flex-col items-center">
              <div className="h-0 w-0 border-x-[12px] border-b-[20px] border-x-transparent border-b-emerald-600" />
              <div className="h-16 w-1 bg-gradient-to-b from-emerald-600 to-emerald-300" />
            </div>
          </div>

          {/* Opposite direction (away from Mecca) */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
            style={{ transform: `rotate(${oppositeRotation}deg)` }}
          >
            <div className="flex flex-col items-center">
              <div className="h-8 w-1 bg-gradient-to-b from-slate-200 to-transparent" />
            </div>
          </div>

          {/* Center dot (Kaaba) */}
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500 shadow-md" />
        </div>

        <div className="mt-4 text-center">
          <p className="text-2xl font-black text-emerald-700">
            {Math.round(qiblaDirection)}°
          </p>
          <p className="text-xs text-slate-500">
            Direction de la Kaaba depuis votre position
          </p>
        </div>

        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
          🕋 Tournez jusqu'à ce que la flèche verte pointe vers le haut
        </p>
      </div>
    </section>
  );
}
