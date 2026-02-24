import { type Portfolio } from "@/lib/portfolio";
import { formatDuration, formatNumber } from "@/lib/util";

type PositionsProps = {
  portfolio: Portfolio;
};

export default function Positions({
  portfolio,
}: PositionsProps) {

  const now = Math.floor(Date.now() / 1000);

  return (
    <div className="font-body rounded-xl p-3 border border-purple-100 shadow-sm bg-purple-50">
      <h3 className="flex justify-center text-xl text-purple-800 font-heading">Positions<span className="text-purple-500 ml-1">({portfolio.locks.length})</span></h3>

      {portfolio.locks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-purple-50 border-b border-purple-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-purple-800">ID</th>
                <th className="px-4 py-3 text-right font-medium text-purple-800">DUST</th>
                <th className="px-4 py-3 text-right font-medium text-purple-800">Value</th>
                <th className="px-4 py-3 text-right font-medium text-purple-800">Age</th>
                <th className="px-4 py-3 text-right font-medium text-purple-800">Days Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {portfolio.locks.toSorted((a, b) => Number(Number(a.tokenId) - Number(b.tokenId))).map(({ tokenId, amount, effectiveStart, end, isPermanent }) => {
                const dust = Number(amount / 10n**18n);
                const minted = Number(effectiveStart);
                const daysToUnlock = Math.max(0, Math.floor((Number(end) - Date.now() / 1000) / 86400));
                return (
                <tr key={tokenId}>
                  <td className="px-4 py-3 text-left text-purple-500">{tokenId}</td>
                  <td className="px-4 py-3 text-right text-purple-500">{formatNumber(Math.floor(dust))}</td>
                  <td className="px-4 py-3 text-right text-purple-500">${formatNumber(dust * portfolio.dust.price, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right text-purple-500">{effectiveStart > 0 ? <p>{formatDuration(now - minted)}</p> : null}</td>
                  <td className="px-4 py-3 text-right text-purple-500">{isPermanent ? '∞' : daysToUnlock > 0 ? daysToUnlock : 'None'}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-purple-500">No locks</p>
        </div>
      )}
    </div>
  );
}
