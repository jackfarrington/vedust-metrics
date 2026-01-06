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