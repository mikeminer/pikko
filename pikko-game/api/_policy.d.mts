export interface Sponsor { mint: string; name: string; symbol: string; logo: string | null; url: string; expiresAt: number }
export const SCAN_ORIGIN: string;
export const FEATURE_URL: string;
export const MAX_CANDIDATES: number;
export const MAX_SPONSORS: number;
export function isMint(s: unknown): boolean;
export function cleanText(value: unknown, max: number): string;
export function validLogo(raw: unknown, mint: string): string | null;
export function normalizeRecord(r: unknown, now: number): Sponsor | null;
export function validateFeed(json: unknown, now: number): Sponsor[];
export function validateSponsors(json: unknown, now: number): Sponsor[];
