function assertNonNegativeFiniteNumber(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${name}_INVALID`);
  }
  return value;
}

function assertNonNegativeInteger(value, name) {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new Error(`${name}_INVALID`);
  }
  return value;
}

function calculateCost(payload) {
  if (!payload || !Array.isArray(payload.segments)) {
    throw new Error("INVALID_PAYLOAD_STRUCTURE");
  }

  const fuelPriceCents = assertNonNegativeInteger(
    payload.fuelPriceCents,
    "FUEL_PRICE_CENTS",
  );
  const consumptionPer100km = assertNonNegativeFiniteNumber(
    payload.consumptionPer100km,
    "CONSUMPTION_PER_100KM",
  );

  let totalDistanceKm = 0;
  let totalTollsCents = 0;

  payload.segments.forEach((segment, index) => {
    const dist = assertNonNegativeFiniteNumber(
      segment.distanceKm,
      `SEGMENT_${index}_DISTANCE`,
    );
    const toll = assertNonNegativeInteger(
      segment.tollCostCents,
      `SEGMENT_${index}_TOLL`,
    );

    totalDistanceKm += dist;
    totalTollsCents += toll;

    if (!Number.isFinite(totalDistanceKm)) {
      throw new Error("DISTANCE_OVERFLOW");
    }
    if (!Number.isSafeInteger(totalTollsCents)) {
      throw new Error("TOLLS_CENTS_OVERFLOW");
    }
  });

  const rawFuelCost =
    (totalDistanceKm * consumptionPer100km * fuelPriceCents) / 100;

  if (!Number.isFinite(rawFuelCost)) {
    throw new Error("FUEL_COST_OVERFLOW");
  }

  const totalFuelCostCents = Math.round(rawFuelCost);
  if (!Number.isSafeInteger(totalFuelCostCents)) {
    throw new Error("FUEL_CENTS_OVERFLOW");
  }

  const grandTotalCents = totalFuelCostCents + totalTollsCents;
  if (!Number.isSafeInteger(grandTotalCents)) {
    throw new Error("GRAND_TOTAL_CENTS_OVERFLOW");
  }

  return {
    totalDistanceKm,
    totalFuelCostCents,
    totalTollsCents,
    grandTotalCents,
    grandTotalDisplayEUR: (grandTotalCents / 100).toFixed(2),
    ok: true,
  };
}

self.onmessage = function (event) {
  if (event.data?.type !== "CALCULATE_COST") return;

  try {
    self.postMessage({ success: true, result: calculateCost(event.data.payload) });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : "WORKER_ERROR",
    });
  }
};
