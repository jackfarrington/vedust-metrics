import { Cinzel } from "next/font/google";
import { Quicksand } from "next/font/google";

import { type Position } from "@/lib/portfolio";
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
  positions: Position[];
};

export default async function Positions({
  dustPrice,
  positions,
}: PositionsProps) {

  return (
    <div className={`${quicksand.className} rounded-xl p-3 border border-purple-100 shadow-sm bg-purple-50`}>
      <h3 className={`flex justify-center text-xl text-purple-800 ${cinzel.className}`}>Positions &nbsp;<span className="text-purple-500">({positions.length})</span></h3>

      {positions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-purple-50 border-b border-purple-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-purple-800">ID</th>
                <th className="px-4 py-3 text-right font-medium text-purple-800">DUST</th>
                <th className="px-4 py-3 text-right font-medium text-purple-800">Value</th>
                <th className="px-4 py-3 text-right font-medium text-purple-800">Days Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {positions.toSorted((a, b) => Number(Number(a.lock.id) - Number(b.lock.id))).map(({ lock: { id, dust, daysToUnlock, isPermanent } }) => (
              <tr key={id}>
                <td className="px-4 py-3 font-mono text-purple-500">{id}</td>
                <td className="px-4 py-3 text-right text-purple-500">{formatNumber(Math.floor(dust))}</td>
                <td className="px-4 py-3 text-right text-purple-500">${formatNumber(dust * dustPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-right text-purple-500">{isPermanent ? '∞' : daysToUnlock > 0 ? daysToUnlock : 'None'}</td>
              </tr>
              ))}
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