/**
 * OMEGA canonical JSON v1 — contract (see CANONICALIZATION.md):
 * - object keys sorted by UTF-16 code units, recursively; array order preserved;
 * - numbers serialized with ECMAScript Number→string (so 1, 1.0, 1e0 → "1"; -0 → "0");
 * - strings escaped by JSON.stringify; lone surrogates rejected;
 * - only null / boolean / finite number / string / array / plain object accepted.
 * This matches the RFC 8785 (JCS) vectors exercised in the tests, but is NOT claimed
 * to be a certified RFC 8785 implementation.
 */

export const HASH_DOMAINS = {
  sourceSemantic: "omega-veritas/source-semantic/v1",
  normalizedSemantic: "omega-veritas/normalized-semantic/v1",
  evidence: "omega-veritas/evidence/v1",
  opportunityId: "omega-veritas/opportunity-id/v1",
  versionId: "omega-veritas/version-id/v1",
  envelopeSeal: "omega-veritas/envelope-seal/v1",
  economicState: "omega-veritas/economic-state/v1",
} as const;

export type HashDomain = (typeof HASH_DOMAINS)[keyof typeof HASH_DOMAINS];

export type IngestionResult =
  | { success: true; h_http_raw: string; h_semantic: string; payloadLength: number }
  | { success: false; error: string };

const HEX64 = /^[0-9a-f]{64}$/;

export function isSha256Hex(value: unknown): value is string {
  return typeof value === "string" && HEX64.test(value);
}

export async function sha256Buffer(input: Uint8Array): Promise<string> {
  // Copy into an ArrayBuffer-backed view: SubtleCrypto does not accept SharedArrayBuffer views.
  const hashBuffer = await crypto.subtle.digest("SHA-256", new Uint8Array(input));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;

function hasLoneSurrogate(value: string): boolean {
  return LONE_SURROGATE.test(value);
}

function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Serializes directly to a string. Building a sorted object and calling JSON.stringify
 * is NOT enough: JavaScript enumerates integer-like keys ("1", "10") first, so
 * {"9":1,"10":2} would come out with "9" before "10" despite the code-unit sort.
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("CANON_NON_FINITE_NUMBER");
    return JSON.stringify(value);
  }
  if (typeof value === "string") {
    if (hasLoneSurrogate(value)) throw new Error("CANON_LONE_SURROGATE");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value !== "object" || !isPlainObject(value)) {
    throw new Error("CANON_UNSUPPORTED_TYPE");
  }

  const object = value as Record<string, unknown>;
  const members = Object.keys(object)
    .sort()
    .map((key) => `${canonicalJson(key)}:${canonicalJson(object[key])}`);
  return `{${members.join(",")}}`;
}

/** SHA-256 over canonicalJson({ domain, payload }). */
export async function domainHash(domain: HashDomain, payload: unknown): Promise<string> {
  return sha256Buffer(new TextEncoder().encode(canonicalJson({ domain, payload })));
}

/**
 * Strict UTF-8 decoding: invalid byte sequences are rejected (fatal: true).
 * A leading UTF-8 BOM is stripped by TextDecoder; it still changes sourceContentHash.
 */
export function decodeUtf8Strict(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("INVALID_UTF8");
  }
}

/**
 * Strict JSON parser. Unlike JSON.parse it rejects:
 * - duplicate object keys (compared after escape decoding, so "a" and "a" collide);
 * - integral numbers outside the IEEE-754 safe range (they would be silently rounded);
 * - numbers overflowing to Infinity.
 * Objects are created with a null prototype.
 */
export function parseStrictJson(text: string): unknown {
  let i = 0;
  const fail = (code: string): never => {
    throw new Error(`${code}_AT_${i}`);
  };
  const skipWs = () => {
    while (i < text.length && (text[i] === " " || text[i] === "\t" || text[i] === "\n" || text[i] === "\r")) i++;
  };

  const parseString = (): string => {
    const match = /^"(?:[^"\\\u0000-\u001f]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"/.exec(text.slice(i));
    if (!match) return fail("JSON_INVALID_STRING");
    i += match[0].length;
    return JSON.parse(match[0]) as string;
  };

  const parseNumber = (): number => {
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(text.slice(i));
    if (!match) return fail("JSON_INVALID_NUMBER");
    const n = Number(match[0]);
    if (!Number.isFinite(n)) fail("JSON_NUMBER_OVERFLOW");
    if (Number.isInteger(n) && !Number.isSafeInteger(n)) fail("JSON_NUMBER_UNSAFE_INTEGER");
    i += match[0].length;
    return n;
  };

  const parseValue = (): unknown => {
    skipWs();
    const c = text[i];
    if (c === "{") {
      i++;
      const object: Record<string, unknown> = Object.create(null);
      const seen = new Set<string>();
      skipWs();
      if (text[i] === "}") { i++; return object; }
      for (;;) {
        skipWs();
        if (text[i] !== '"') fail("JSON_EXPECTED_KEY");
        const key = parseString();
        if (seen.has(key)) fail("JSON_DUPLICATE_KEY");
        seen.add(key);
        skipWs();
        if (text[i] !== ":") fail("JSON_EXPECTED_COLON");
        i++;
        object[key] = parseValue();
        skipWs();
        if (text[i] === ",") { i++; continue; }
        if (text[i] === "}") { i++; return object; }
        fail("JSON_EXPECTED_OBJECT_END");
      }
    }
    if (c === "[") {
      i++;
      const array: unknown[] = [];
      skipWs();
      if (text[i] === "]") { i++; return array; }
      for (;;) {
        array.push(parseValue());
        skipWs();
        if (text[i] === ",") { i++; continue; }
        if (text[i] === "]") { i++; return array; }
        fail("JSON_EXPECTED_ARRAY_END");
      }
    }
    if (c === '"') return parseString();
    if (c === "-" || (c >= "0" && c <= "9")) return parseNumber();
    if (text.startsWith("true", i)) { i += 4; return true; }
    if (text.startsWith("false", i)) { i += 5; return false; }
    if (text.startsWith("null", i)) { i += 4; return null; }
    return fail("JSON_UNEXPECTED_TOKEN");
  };

  const value = parseValue();
  skipWs();
  if (i !== text.length) fail("JSON_TRAILING_DATA");
  return value;
}

/** Level 2: parse raw source bytes strictly (UTF-8 + JSON) — the source semantic value. */
export function parseSourceBytes(rawBytes: Uint8Array): unknown {
  return parseStrictJson(decodeUtf8Strict(rawBytes));
}

/** Level 1: plain SHA-256 of the exact bytes received (sha256sum-compatible, not domain-prefixed). */
export function computeSourceContentHash(rawBytes: Uint8Array): Promise<string> {
  return sha256Buffer(rawBytes);
}

/** Level 2: domain-separated hash of the canonicalized source JSON. */
export function computeSourceSemanticHash(parsedSource: unknown): Promise<string> {
  return domainHash(HASH_DOMAINS.sourceSemantic, parsedSource);
}

/** Level 3: domain-separated hash of the application-normalized payload. */
export function computeNormalizedSemanticHash(normalizedPayload: unknown): Promise<string> {
  return domainHash(HASH_DOMAINS.normalizedSemantic, normalizedPayload);
}

export async function processIncomingPayload(
  rawBytes: unknown,
): Promise<IngestionResult> {
  try {
    if (!(rawBytes instanceof Uint8Array) || rawBytes.byteLength === 0) {
      throw new Error("RAW_BYTES_INVALID");
    }

    const h_http_raw = await computeSourceContentHash(rawBytes);
    const h_semantic = await computeSourceSemanticHash(parseSourceBytes(rawBytes));

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
