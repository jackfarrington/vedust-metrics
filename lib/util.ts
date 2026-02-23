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

export function getQueryString(params: { [key: string]: string | string[] }): string {
  let queryString: string[] = [];

  Object.keys(params).forEach((key, _) => {
    if (Array.isArray(params[key])) {
      queryString.push(`${encodeURIComponent(key)}[]=${encodeURIComponent((params[key] as string[]).join(','))}`);
    } else {
      queryString.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key] as string)}`);
    }
  });

  return queryString.join('&');
}

export async function fetchWithRetry(url: URL, options = {}, retries: number = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.status !== 429) return res;

    const delay = Math.pow(2, i) * 1000 + Math.random() * 500;
    console.log(`Retrying fetch after ${Math.floor(delay)}ms`);
    await new Promise(r => setTimeout(r, delay));
  }
  return new Response("Rate limit exceeded after retries", { status: 429, statusText: "Rate limit exceeded" });
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