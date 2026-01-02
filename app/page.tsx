import { getMetrics } from '@/lib/metrics';

function formatNumber(
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

export default async function Home() {
  const { symbol, mintedSupply, burnedSoFar, remainingSupply, pendingBurn, totalBurned, lastUpdate } = await getMetrics();

  return (
      <main className="flex w-full max-w-3xl flex-col items-center justify-between py-16 px-16 bg-white dark:bg-black sm:items-start">

        <p className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          {symbol}
        </p>

        <table>
          <tbody>
            <tr>
              <td>Minted</td>
              <td className="px-3 text-right">{formatNumber(mintedSupply)}</td>
            </tr>
            <tr>
              <td>Burned so far</td>
              <td className="px-3 text-right">{formatNumber(burnedSoFar)}</td>
            </tr>
            <tr>
              <td>Remaining supply</td>
              <td className="px-3 text-right">{formatNumber(remainingSupply)}</td>
            </tr>
            <tr>
              <td>Pending burn</td>
              <td className="px-3 text-right">{formatNumber(pendingBurn)}</td>
            </tr>
            <tr>
              <td>Total burned</td>
              <td className="px-3 text-right">{formatNumber(totalBurned)}</td>
            </tr>
            <tr>
              <td>Percent burned</td>
              <td className="px-3 text-right">{formatNumber((Number(totalBurned) / Number(mintedSupply)), { style: 'percent', maximumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <p className="py-10 text-sm">
          Last updated {lastUpdate.toLocaleString()}
        </p>
        
      </main>
  );
}
