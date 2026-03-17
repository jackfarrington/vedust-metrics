"use client";

import { useEffect, useState } from "react";

import { dustLockContract } from "@/lib/contracts";
import { type LoadState, formatDuration, formatNumber, zip } from "@/lib/util";

const Label = {
  infinite: '♾️',
  burned: '🔥',
  unlocked: 'Unlocked',
};

type Label = typeof Label[keyof typeof Label];

export default function SchedulePage() {
  const [state, setState] = useState<LoadState<Lock[]>>({ status: "idle" });
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));
  const [progress, setProgress] = useState<{ loaded: number; total: number }>({ loaded: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;

    const getLocks = async () => {
      setState({ status: "loading" });
      try {
        const locks = await getAllLocksBatched(100, 100, (loaded, total) => {
          if (cancelled) return;
          setProgress({ loaded, total });
        }, () => cancelled);

        if (cancelled) return;

        setNow(Math.floor(Date.now() / 1000));
        setState({ status: "success", value: locks});
      } catch (e) {
        if (cancelled) return;
        setState({ status: "error", error: e instanceof Error ? e.message : 'An error occurred while loading the page.' });
      }
    };

    getLocks();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex items-center justify-center px-6 md:pt-6 pb-6 bg-white">
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <div className="font-body rounded-xl p-3 border border-purple-100 shadow-sm bg-purple-50">
          <h3 className="flex justify-center text-xl text-purple-800 font-heading">
            {state.status === "success" ? formatNumber(state.value.length) : null } Locks
          </h3>

          {state.status === "idle" || state.status === "loading" ? (
          <div className="p-8 text-center">
            <p className="text-purple-500">Retrieving locks...</p>
            {progress.total > 0 ? (
              <div className="mt-4">
                <div className="w-full bg-purple-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-purple-500 h-3 rounded-full" style={{ width: `${Math.round((progress.loaded / Math.max(1, progress.total)) * 100)}%` }} />
                </div>
                <p className="text-sm text-purple-500 mt-2">{progress.loaded} / {progress.total} loaded</p>
              </div>
            ) : null}
          </div>
          ) : null}
          
          {state.status === "error" ? (
          <div className="p-8 text-center">
            <p className="text-purple-500">An error occurred. 😱</p>
            <p className="text-purple-500">Maybe try again later?</p>
          </div>
          ) : null}
          
          {state.status === "success" ? (
            state.value.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-purple-50 border-b border-purple-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-purple-800">Time</th>
                      <th className="px-4 py-3 text-right font-medium text-purple-800">Locks</th>
                      <th className="px-4 py-3 text-right font-medium text-purple-800">DUST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {computeSummary(state.value, now).map(({ label, count, totalDust }) => {
                      const dustNumber = Number(totalDust) / 10 ** 18;
                      return (
                        <tr key={label}>
                          <td className="px-4 py-3 text-left text-purple-500">{label === Label.infinite || label === Label.burned || label === Label.unlocked ? label : formatDuration(Number(label))}</td>
                          <td className="px-4 py-3 text-right text-purple-500">{formatNumber(count)}</td>
                          <td className="px-4 py-3 text-right text-purple-500">{label === Label.burned ? label : formatNumber(dustNumber)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-purple-500">No locks</p>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

async function getAllLocksBatched(
  batchSize = 100,
  delayMs = 100,
  onProgress?: (loaded: number, total: number) => void,
  isCancelled?: () => boolean,
): Promise<Lock[]> {
  const latestTokenId = await dustLockContract.read.tokenId();
  const total = Number(latestTokenId);

  if (!Number.isFinite(total) || total <= 0) {
    onProgress?.(0, 0);
    return [];
  }

  let locks: Lock[] = [];

  for (let start = 1; start <= total; start += batchSize) {
    if (isCancelled?.()) break;

    const ids = Array.from(
      { length: Math.min(start + batchSize - 1, total) - start + 1 },
      (_, i) => BigInt(start + i)
    );

    const details = await Promise.all(ids.map((tokenId) => dustLockContract.read.locked([tokenId])));

    locks = locks.concat(zip(ids, details).map(([tokenId, detail]) => ({ tokenId, ...detail })));

    onProgress?.(locks.length, total);

    if (start + batchSize <= total) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return locks;
}

function computeSummary(locks: Lock[], now: number): { label: string; count: number; totalDust: bigint }[] {
  const map = new Map<string, { count: number; total: bigint }>();

  for (const l of locks) {
    const { amount, effectiveStart, end, isPermanent } = l;
    const isBurned = amount === 0n && effectiveStart === 0n && end === 0n && !isPermanent;
    let label: Label | number;
    if (isBurned) label = Label.burned;
    else if (isPermanent) label = Label.infinite;
    else if (Number(end) <= now) label = Label.unlocked;
    else {
      const secs = Number(end) - now;
      label = secs.toString();
    }

    const cur = map.get(label) ?? { count: 0, total: 0n };
    cur.count += 1;
    cur.total += amount;
    map.set(label, cur);
  }

  const rows = Array.from(map.entries()).map(([label, v]) => ({ label, count: v.count, totalDust: v.total }));

  rows.sort((a, b) => {
    const rank = (l: Label | number) => {
      if (l === Label.infinite) return -3;
      if (l === Label.burned) return -2;
      if (l === Label.unlocked) return -1;
      return Number(l);
    };
    return rank(a.label) - rank(b.label);
  });

  return rows;
}

type Lock = {
  tokenId: bigint;
  amount: bigint;
  effectiveStart: bigint;
  end: bigint;
  isPermanent: boolean;
};
