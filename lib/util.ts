export function formatNumber(
  value: number | bigint | string | null | undefined,
  options: Intl.NumberFormatOptions = {},
  locale: string = 'en-US'
): string {
  if (value == null) return '—';

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options
  }).format(Number(value));
}

export function tokenToNumber(units: bigint, decimals: number) {
  return Number(units) / 10**decimals;
}

export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days >= 2) {
    return `${days}d`;
  }
  
  if (days === 1) {
    if (hours > 0) {
      return `1d ${hours}h`;
    }
    return '1d';
  }
  
  if (seconds > 12 * 3600) {
    return `${hours}h`;
  }

  if (seconds > 3600) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${hours}h`;
  }

  return `${minutes}m`;
}