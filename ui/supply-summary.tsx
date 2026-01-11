import { cacheLife } from 'next/cache';

import { Cinzel } from "next/font/google"; // TODO: remove this import
import { Quicksand } from "next/font/google";

import Card from '@/ui//card';
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
    <div>

      <div className={`flex flex-wrap justify-center gap-6 ${quicksand.className}`}>
        <Card title={`${symbol} ✨`} pairs={[
          ['Minted', formatNumber(mintedSupply)],
          ['Emitted so far', formatNumber(emittedSupply)],
          ['Percent emitted', formatNumber(Number(emittedSupply) / Number(mintedSupply), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
          ['In circulation', formatNumber(circulation)],
        ]} />

        <Card title={`Burns 🔥`} pairs={[
          ['Burned so far', formatNumber(burnedSoFar)],
          ['Pending burn', formatNumber(pendingBurn)],
          ['Total burned', formatNumber(totalBurned)],
          ['Percent burned', formatNumber((Number(totalBurned) / Number(mintedSupply)), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
          ['Burn ratio', formatNumber((Number(totalBurned) / Number(emittedSupply)), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
          ['Remaining supply', formatNumber(remainingSupply - pendingBurn)],
        ]} />

        <Card title={`Locks 🔒`} pairs={[
            ['veDUST locked', formatNumber(locked)],
            ['Lock ratio', formatNumber(Number(locked) / Number(emittedSupply), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
            ['veDUST power', formatNumber(power)],
            ['Power ratio', formatNumber(Number(power) / Number(emittedSupply), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
        ]} />
      </div>

      <div className={`flex items-center justify-center mt-6 ${cinzel.className}`}>
        <LastUpdated timestamp={lastUpdate} />
      </div>

    </div>
  );
}