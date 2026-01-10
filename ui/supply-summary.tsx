import { cacheLife } from 'next/cache';

import { Cinzel } from "next/font/google";
import { Quicksand } from "next/font/google";

import LastUpdated from "@/ui/last-updated";
import { getMetrics } from "@/lib/metrics";
import { formatNumber } from "@/lib/utils";

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

export default async function SupplySummary() {
  'use cache';

  cacheLife('minutes');
  const { symbol, mintedSupply, burnedSoFar, remainingSupply, pendingBurn, totalBurned, circulation, locked, power, emittedSupply, lastUpdate } = await getMetrics();

  return (
    <div className={`grid gap-6 ${quicksand.className}`}>
      <div className="rounded-xl p-3 shadow-sm bg-purple-50">
        <div className="flex justify-center">
          <h3 className={`text-lg font-medium text-purple-800 ${cinzel.className}`}>{symbol}</h3>
        </div>

        <div className="flex justify-between space-x-6">
          <span className="text-purple-800">Minted</span>
          <span className="text-purple-500">{formatNumber(mintedSupply)}</span>
        </div>
        <div className="flex justify-between space-x-6">
          <span className="text-purple-800">Emitted so far</span>
          <span className="text-purple-500">{formatNumber(emittedSupply)}</span>
        </div>
        <div className="flex justify-between space-x-6">
          <span className="text-purple-800">Percent emitted</span>
          <span className="text-purple-500">{formatNumber(Number(emittedSupply) / Number(mintedSupply), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between space-x-6">
          <span className="text-purple-800">In circulation</span>
          <span className="text-purple-500">{formatNumber(circulation)}</span>
        </div>
      </div>

      <div className="rounded-xl p-3 shadow-sm bg-purple-50">
        <div className="flex justify-center">
          <h3 className="text-lg font-medium text-purple-800">&#128293;</h3>
        </div>

        <div className="flex justify-between space-x-6">
          <span className="text-purple-800">Burned so far</span>
          <span className="text-purple-500">{formatNumber(burnedSoFar)}</span>
        </div>
        <div className="flex justify-between space-x-6">
          <span className="text-purple-800">Pending burn</span>
          <span className="text-purple-500">{formatNumber(pendingBurn)}</span>
        </div>
        <div className="flex justify-between space-x-6">
          <span className="text-purple-800">Total burned</span>
          <span className="text-purple-500">{formatNumber(totalBurned)}</span>
        </div>
        <div className="flex justify-between space-x-6">
          <span className="text-purple-800">Percent burned</span>
          <span className="text-purple-500">{formatNumber((Number(totalBurned) / Number(mintedSupply)), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between space-x-6">
          <span className="text-purple-800">Burn rate</span>
          <span className="text-purple-500">{formatNumber((Number(totalBurned) / Number(emittedSupply)), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between space-x-6">
          <span className="text-purple-800">Remaining supply</span>
          <span className="text-purple-500">{formatNumber(remainingSupply - pendingBurn)}</span>
        </div>
      </div>
      
      <div className="rounded-xl p-2 shadow-sm bg-purple-50">
        <div className="flex justify-center">
          <h3 className="text-lg font-medium text-purple-800">&#128274;</h3>
        </div>

        <div className="flex justify-between space-x-6">
          <span className="text-purple-800">veDUST locked</span>
          <span className="text-purple-500">{formatNumber(locked)}</span>
        </div>
        <div className="flex justify-between space-x-6">
          <span className="text-purple-800">veDUST power</span>
          <span className="text-purple-500">{formatNumber(power)}</span>
        </div>
      </div>

      <div className={cinzel.className}>
        <LastUpdated timestamp={lastUpdate} />
      </div>
      
    </div>
  );
}