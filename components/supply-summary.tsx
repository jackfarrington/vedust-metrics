import { cacheLife } from 'next/cache';

import Card from '@/components/card';
import LastUpdated from "@/components/last-updated";
import { getMetrics } from "@/lib/metrics";
import { formatNumber } from "@/lib/util";

export default async function SupplySummary() {
  'use cache';

  cacheLife({ stale: 60, revalidate: 60, expire: 60 });
  const metrics = await getMetrics();
  const {
    symbol,
    mintedSupply,
    burnedSoFar,
    remainingSupply,
    pendingBurn,
    totalBurned,
    circulation,
    locked,
    infiniteLocked,
    power,
    emittedSupply,
    lastUpdate,
    price,
  } = metrics;

  return (
    <div>

      <div className="flex flex-wrap justify-center gap-6 font-body">
        <Card title={`Summary 📜`} pairs={[
          ['Emitted', formatNumber(emittedSupply)],
          ['Circulating', `${formatNumber(Number(circulation) / Number(emittedSupply), { style: 'percent' })}`],
          ['Burned', `${formatNumber(Number(totalBurned) / Number(emittedSupply), { style: 'percent' })}`],
          ['Locked', `${formatNumber(Number(locked) / Number(emittedSupply), { style: 'percent' })}`],
        ]} />

        <Card title={`${symbol} ✨`} pairs={[
          ['Minted', formatNumber(mintedSupply)],
          ['Emitted so far', formatNumber(emittedSupply)],
          ['Percent emitted', formatNumber(Number(emittedSupply) / Number(mintedSupply), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
          ['In circulation', formatNumber(circulation)],
          ['Circulation ratio', formatNumber(Number(circulation) / Number(emittedSupply), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
          ['Price', `$${formatNumber(price, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`],
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
            ['Infinite locked', formatNumber(infiniteLocked)],
            ['Percent infinite', formatNumber(Number(infiniteLocked) / Number(locked), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
            ['Infinite ratio', formatNumber(Number(infiniteLocked) / Number(emittedSupply), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
        ]} />
      </div>

      <div className="flex items-center justify-center mt-6 font-heading">
        <LastUpdated timestamp={lastUpdate} />
      </div>

    </div>
  );
}