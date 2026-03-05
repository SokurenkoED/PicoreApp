export function envString(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing env var ${name}`);
  }
  return value;
}

export function envInt(name: string, fallback?: number): number {
  const raw = process.env[name] ?? (fallback !== undefined ? String(fallback) : undefined);
  if (raw === undefined) {
    throw new Error(`Missing env var ${name}`);
  }
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) {
    throw new Error(`Env var ${name} must be integer`);
  }
  return value;
}

export function envBool(name: string, fallback?: boolean): boolean {
  const raw = process.env[name] ?? (fallback !== undefined ? String(fallback) : undefined);
  if (raw === undefined) {
    throw new Error(`Missing env var ${name}`);
  }
  return raw === 'true' || raw === '1';
}
