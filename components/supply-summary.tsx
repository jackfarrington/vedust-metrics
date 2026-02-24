"use client";

import { useEffect, useState } from "react";

import Card from '@/components/card';
import LastUpdated from "@/components/last-updated";
import { type Metrics, getMetrics } from "@/lib/metrics";
import { formatNumber } from "@/lib/util";

export default function SupplySummary() {
  const [metrics, setMetrics] = useState<Metrics>();

  useEffect(() => {
    const load = async () => {
      const metrics = await getMetrics();
      setMetrics(metrics);
    }

    load();

    const id = setInterval(load, 30_000);

    return () => clearInterval(id);
  }, []);

  return (
    metrics &&
    <div>

      <div className="flex flex-wrap justify-center gap-6 font-body">
        <Card title={`Summary 📜`} pairs={[
          ['Emitted', formatNumber(metrics.emittedSupply)],
          ['Circulating', `${formatNumber(Number(metrics.circulation) / Number(metrics.emittedSupply), { style: 'percent' })}`],
          ['Burned', `${formatNumber(Number(metrics.totalBurned) / Number(metrics.emittedSupply), { style: 'percent' })}`],
          ['Locked', `${formatNumber(Number(metrics.locked) / Number(metrics.emittedSupply), { style: 'percent' })}`],
        ]} />

        <Card title={`${metrics.symbol} ✨`} pairs={[
          ['Minted', formatNumber(metrics.mintedSupply)],
          ['Emitted so far', formatNumber(metrics.emittedSupply)],
          ['Percent emitted', formatNumber(Number(metrics.emittedSupply) / Number(metrics.mintedSupply), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
          ['In circulation', formatNumber(metrics.circulation)],
          ['Circulation ratio', formatNumber(Number(metrics.circulation) / Number(metrics.emittedSupply), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
          ['Price', `$${formatNumber(metrics.price, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`],
        ]} />

        <Card title={`Burns 🔥`} pairs={[
          ['Burned so far', formatNumber(metrics.burnedSoFar)],
          ['Pending burn', formatNumber(metrics.pendingBurn)],
          ['Total burned', formatNumber(metrics.totalBurned)],
          ['Percent burned', formatNumber((Number(metrics.totalBurned) / Number(metrics.mintedSupply)), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
          ['Burn ratio', formatNumber((Number(metrics.totalBurned) / Number(metrics.emittedSupply)), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
          ['Remaining supply', formatNumber(metrics.remainingSupply - metrics.pendingBurn)],
        ]} />

        <Card title={`Locks 🔒`} pairs={[
            ['veDUST locked', formatNumber(metrics.locked)],
            ['Lock ratio', formatNumber(Number(metrics.locked) / Number(metrics.emittedSupply), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
            ['veDUST power', formatNumber(metrics.power)],
            ['Power ratio', formatNumber(Number(metrics.power) / Number(metrics.emittedSupply), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
            ['Infinite locked', formatNumber(metrics.infiniteLocked)],
            ['Percent infinite', formatNumber(Number(metrics.infiniteLocked) / Number(metrics.locked), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
            ['Infinite ratio', formatNumber(Number(metrics.infiniteLocked) / Number(metrics.emittedSupply), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })],
        ]} />
      </div>

      <div className="flex items-center justify-center mt-6 font-heading">
        <LastUpdated timestamp={metrics.lastUpdate} />
      </div>

    </div>
  );
}