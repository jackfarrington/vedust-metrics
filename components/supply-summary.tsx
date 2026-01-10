import LastUpdated from "@/components/last-updated";
import { getMetrics } from "@/lib/metrics";
import { formatNumber } from "@/lib/utils";

export default async function SupplySummary() {
    const { symbol, mintedSupply, burnedSoFar, remainingSupply, pendingBurn, totalBurned, circulation, locked, power, emittedSupply, lastUpdate } = await getMetrics();

  return (
    <div className="grid gap-6">
      <div className="rounded-xl bg-purple-50 p-2 shadow-sm">
        <div className="flex justify-center">
          <h3 className="text-lg font-medium">{symbol}</h3>
        </div>

        <table className="w-full">
          <tbody>
            <tr>
              <td>Minted</td>
              <td className="px-3 text-right">{formatNumber(mintedSupply)}</td>
            </tr>
            <tr>
              <td>Emitted so far</td>
              <td className="px-3 text-right">{formatNumber(emittedSupply)}</td>
            </tr>
            <tr>
              <td>Percent emitted</td>
              <td className="px-3 text-right">{formatNumber(Number(emittedSupply) / Number(mintedSupply), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td>Circulation</td>
              <td className="px-3 text-right">{formatNumber(circulation)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-xl bg-purple-50 p-2 shadow-sm">
        <div className="flex justify-center">
          <h3 className="text-lg font-medium">&#128293;</h3>
        </div>

        <table className="w-full">
          <tbody>
            <tr>
              <td>Burned so far</td>
              <td className="px-3 text-right">{formatNumber(burnedSoFar)}</td>
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
              <td className="px-3 text-right">{formatNumber((Number(totalBurned) / Number(mintedSupply)), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td>Remaining supply</td>
              <td className="px-3 text-right">{formatNumber(remainingSupply - pendingBurn)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="rounded-xl bg-purple-50 p-2 shadow-sm">
        <div className="flex justify-center">
          <h3 className="text-lg font-medium">&#128274;</h3>
        </div>

        <table className="w-full">
          <tbody>
            <tr>
              <td>veDUST locked</td>
              <td className="px-3 text-right">{formatNumber(locked)}</td>
            </tr>
            <tr>
              <td>veDUST power</td>
              <td className="px-3 text-right">{formatNumber(power)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <LastUpdated timestamp={lastUpdate} />
    </div>
  );
}