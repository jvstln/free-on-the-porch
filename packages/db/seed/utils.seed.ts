import crypto from "node:crypto";

export const BASE_LAT = 51.4746;
export const BASE_LNG = -0.3614;

export const createId = (): string => crypto.randomUUID();

export const future = (days: number): Date =>
	new Date(Date.now() + days * 24 * 60 * 60 * 1000);

export const past = (days: number): Date =>
	new Date(Date.now() - days * 24 * 60 * 60 * 1000);

/** Spread coords slightly around a base point */
export const jitter = (base: number, range = 0.02): number =>
	base + (Math.random() - 0.5) * range;
