import { Cinzel } from "next/font/google";
import { Quicksand } from "next/font/google";

import { type Lock } from "@/lib/portfolio";
import { formatNumber } from "@/lib/util";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cinzel",
});

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-quicksand',
});

type PositionsProps = {
  dustPrice: number;
  positions: Lock[];
};

export default async function Positions({
  dustPrice,
  positions,
}: PositionsProps) {

  const now = Math.floor(Date.now() / 1000);

  return (
    <div className={`${quicksand.className} rounded-xl p-3 border border-purple-100 shadow-sm bg-purple-50`}>
      <h3 className={`flex justify-center text-xl text-purple-800 ${cinzel.className}`}>Positions<span className="text-purple-500 ml-1">({positions.length})</span></h3>

      {positions.length > 0 ? (
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
              {positions.toSorted((a, b) => Number(Number(a.tokenId) - Number(b.tokenId))).map(({ tokenId, amount, effectiveStart, end, isPermanent }) => {
                const dust = Number(amount / 10n**18n);
                const minted = Number(effectiveStart);
                const daysToUnlock = Math.max(0, Math.floor((Number(end) - Date.now() / 1000) / 86400));
                return (
                <tr key={tokenId}>
                  <td className="px-4 py-3 font-mono text-purple-500">{tokenId}</td>
                  <td className="px-4 py-3 text-right text-purple-500">{formatNumber(Math.floor(dust))}</td>
                  <td className="px-4 py-3 text-right text-purple-500">${formatNumber(dust * dustPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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

function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days >= 2) {
    return `${days} days`;
  }
  
  if (days === 1) {
    if (hours > 0) {
      return `1 day, ${hours} hr${hours === 1 ? '' : 's'}`;
    }
    return '1 day';
  }
  
  if (seconds > 12 * 3600) {
    return `${hours} hr${hours === 1 ? '' : 's'}`; 
  }

  if (seconds > 3600) {
    if (minutes > 0) {
      return `${hours} hr${hours === 1 ? '' : 's'}, ${minutes} min${minutes === 1 ? '' : 's'}`;
    }
    return `${hours} hr${hours === 1 ? '' : 's'}`;
  }

  return `${minutes} min${minutes === 1 ? '' : 's'}`;
}
