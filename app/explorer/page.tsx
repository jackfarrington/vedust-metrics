"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { dustLockContract } from "@/lib/contracts";
import { formatDuration, formatNumber } from "@/lib/util";

type ExplorerPageProps = {
  searchParams?: Promise<{
    page?: string;
    size?: string;
  }>;
};

export default function ExplorerPage({ searchParams }: ExplorerPageProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [locks, setLocks] = useState<Lock[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));

  const pageParam = urlSearchParams.get("page");
  const sizeParam = urlSearchParams.get("size");

  const setExplorerParams = (nextPage: number, nextSize: number) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set("page", String(nextPage));
    params.set("size", String(nextSize));
    router.replace(`/explorer?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    let cancelled = false;

    const getPage = async () => {
      setStatus("loading");
      try {
        const paramsFromProps = await searchParams;

        const rawPage = pageParam ?? paramsFromProps?.page;
        const rawSize = sizeParam ?? paramsFromProps?.size;

        const pageFromParams = rawPage ? Number(rawPage) : 1;
        const sizeFromParams = rawSize ? Number(rawSize) : 20;

        const currentPage = Number.isFinite(pageFromParams) && pageFromParams > 0
          ? pageFromParams
          : 1;
        const size = Number.isFinite(sizeFromParams) && sizeFromParams > 0 && sizeFromParams <= 100
          ? sizeFromParams
          : 20;

        const { locks, page, pageSize, totalPages } = await getLocksPage(currentPage, size);
        if (cancelled) return;

        setNow(Math.floor(Date.now() / 1000));
        setLocks(locks);
        setPageNumber(page);
        setPageSize(pageSize);
        setTotalPages(totalPages);
        setStatus("loaded");
      } catch {
        if (cancelled) return;
        setStatus("error");
      }
    };

    getPage();

    return () => {
      cancelled = true;
    };
  }, [pageParam, sizeParam, searchParams]);

  return (
    <div className="flex items-center justify-center px-6 md:pt-6 pb-6 bg-white">
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <div className="font-body rounded-xl p-3 border border-purple-100 shadow-sm bg-purple-50">
          <h3 className="flex justify-center text-xl text-purple-800 font-heading">Locks<span className="text-purple-500 ml-1">({locks.length})</span></h3>
          {status === "loading" ? (
          <div className="p-8 text-center">
            <p className="text-purple-500">Loading...</p>
          </div>
          ) : status === "error" ? (
          <div className="p-8 text-center">
            <p className="text-purple-500">An error occurred. 😱</p>
            <p className="text-purple-500">Maybe try again later?</p>
          </div>
          ) : locks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
            <thead className="bg-purple-50 border-b border-purple-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-purple-800">ID</th>
                <th className="px-4 py-3 text-right font-medium text-purple-800">DUST</th>
                <th className="px-4 py-3 text-right font-medium text-purple-800">Age</th>
                <th className="px-4 py-3 text-right font-medium text-purple-800">Days Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {locks.toSorted((a, b) => Number(Number(a.tokenId) - Number(b.tokenId))).map(({ tokenId, amount, effectiveStart, end, isPermanent }) => {
                const dust = Number(amount) / 10**18;
                const minted = Number(effectiveStart);
                const daysToUnlock = Math.max(0, Math.floor((Number(end) - Date.now() / 1000) / 86400));
                const isBurned = amount === 0n && effectiveStart === 0n && end === 0n && !isPermanent;
                return (
                  <tr key={tokenId}>
                    <td className="px-4 py-3 text-left text-purple-500">{tokenId}</td>
                    <td className="px-4 py-3 text-right text-purple-500">{isBurned ? '🔥' : formatNumber(dust, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right text-purple-500">{isBurned ? '🔥' : effectiveStart > 0 ? <p>{formatDuration(now - minted)}</p> : '--'}</td>
                    <td className="px-4 py-3 text-right text-purple-500">{isBurned ? '🔥' : isPermanent ? '∞' : daysToUnlock > 0 ? daysToUnlock : 'None'}</td>
                  </tr>
                )})}
              </tbody>
            </table>
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center text-xs text-purple-500">
              <div className="flex items-center gap-2 text-xs text-purple-500">
                <div className="inline-flex overflow-hidden rounded-full border border-purple-200">
                  {[20, 50, 100].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setExplorerParams(1, size)}
                    className={[
                      "px-3 py-1",
                      size === pageSize ? "bg-purple-100 text-purple-800" : "bg-white text-purple-700 hover:bg-purple-200",
                    ].join(" ")}
                  >
                    {size}
                  </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {pageNumber > 1 && (
                <button
                  type="button"
                  onClick={() => setExplorerParams(1, pageSize)}
                  className="px-3 py-1 rounded-full border border-purple-200 bg-white text-purple-700 hover:bg-purple-200"
                >
                  First
                </button>
                )}
                {pageNumber > 1 && (
                <button
                  type="button"
                  onClick={() => setExplorerParams(pageNumber - 1, pageSize)}
                  className="px-3 py-1 rounded-full border border-purple-200 bg-white text-purple-700 hover:bg-purple-200"
                >
                  Previous
                </button>
                )}
                {pageNumber < totalPages && (
                <button
                  type="button"
                  onClick={() => setExplorerParams(pageNumber + 1, pageSize)}
                  className="px-3 py-1 rounded-full border border-purple-200 bg-white text-purple-700 hover:bg-purple-200"
                >
                  Next
                </button>
                )}
                {pageNumber < totalPages && (
                <button
                  type="button"
                  onClick={() => setExplorerParams(totalPages, pageSize)}
                  className="px-3 py-1 rounded-full border border-purple-200 bg-white text-purple-700 hover:bg-purple-200"
                >
                  Last
                </button>
                )}
              </div>
              <span>
                Page {pageNumber} of {totalPages}
              </span>
            </div>
          </div>
          ) : (
          <div className="p-8 text-center">
            <p className="text-purple-500">No locks</p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

type LocksPage = {
  locks: Lock[];
  page: number;
  pageSize: number;
  totalPages: number;
};

type Lock = {
  tokenId: bigint;
  amount: bigint;
  effectiveStart: bigint;
  end: bigint;
  isPermanent: boolean;
};

async function getLocksPage(
  page: number,
  pageSize = 20,
  ): Promise<LocksPage> {
  const latestTokenId = await dustLockContract.read.tokenId();
    
  const totalPositions = Number(latestTokenId);
    
  if (!Number.isFinite(totalPositions) || totalPositions <= 0) {
    return {
      locks: [],
      page: 1,
      pageSize,
      totalPages: 1,
    };
  }

  const totalPages = Math.max(1, Math.ceil(totalPositions / pageSize));
  const safePage = Math.min(Math.max(1, page || 1), totalPages);

  const startIndex = (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + pageSize - 1, totalPositions);

  const tokenIds: bigint[] = [];
  for (let id = BigInt(startIndex); id <= BigInt(endIndex); id++) {
    tokenIds.push(id);
  }

  const locks = await Promise.all(tokenIds.map(async (tokenId) => {
    const locked = await dustLockContract.read.locked([tokenId]);
    return {
      tokenId,
      ...locked,
    };
  }));
  
  return {
    locks,
    page: safePage,
    pageSize,
    totalPages,
  };
}  