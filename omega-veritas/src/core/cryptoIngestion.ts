export type IngestionResult =
  | { success: true; h_http_raw: string; h_semantic: string; payloadLength: number }
  | { success: false; error: string };

export async function sha256Buffer(input: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function canonicalize(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalize);

  const object = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(object).sort()) {
    result[key] = canonicalize(object[key]);
  }
  return result;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export async function processIncomingPayload(
  rawBytes: unknown,
): Promise<IngestionResult> {
  try {
    if (!(rawBytes instanceof Uint8Array) || rawBytes.byteLength === 0) {
      throw new Error("RAW_BYTES_INVALID");
    }

    const h_http_raw = await sha256Buffer(rawBytes);
    const decodedString = new TextDecoder("utf-8", { fatal: true }).decode(rawBytes);
    const parsedObject = JSON.parse(decodedString);
    const canonicalString = canonicalJson(parsedObject);
    const h_semantic = await sha256Buffer(
      new TextEncoder().encode(canonicalString),
    );

    return {
      success: true,
      h_http_raw,
      h_semantic,
      payloadLength: rawBytes.byteLength,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "CRITICAL_INGESTION_ERROR",
    };
  }
}
