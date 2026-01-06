import LastUpdated from "@/components/last-updated";
import { getMetrics } from "@/lib/metrics";
import { formatNumber } from "@/lib/utils";

export default async function SupplySummary() {
    const { symbol, mintedSupply, burnedSoFar, remainingSupply, pendingBurn, totalBurned, lastUpdate } = await getMetrics();

  return (
    <>
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

      <LastUpdated timestamp={lastUpdate} />
    </>
  );
}