import Link from "next/link";

import { type Address, createPublicClient, defineChain, getContract, http } from "viem";

import { DUST_LOCK_PROXY_ADDRESS } from "@/lib/addresses";
import { formatDuration, formatNumber } from "@/lib/util";

import dustLockAbi from "@/lib/abi/neverland/dust_lock";

const monad = defineChain({
  id: 143,
  name: "Monad",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.monad.xyz"] } },
  blockExplorers: {
    default: { name: 'MonadVision', url: 'https://monadvision.com' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
});

const publicClient = createPublicClient({
  chain: monad,
  transport: http("https://rpc.monad.xyz"),
  batch: {
    multicall: true,
  },
});

export const dustLockContract = getContract({
  address: DUST_LOCK_PROXY_ADDRESS as Address,
  abi: dustLockAbi,
  client: {
    public: publicClient,
  },
});
  
type Lock = {
  tokenId: bigint;
  amount: bigint;
  effectiveStart: bigint;
  end: bigint;
  isPermanent: boolean;
};

type LocksPage = {
  locks: Lock[];
  page: number;
  pageSize: number;
  totalPages: number;
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

type ExplorerPageProps = {
  searchParams?: Promise<{
    page?: string;
    size?: string;
  }>;
};

export default async function ExplorerPage({ searchParams }: ExplorerPageProps) {
  const params = await searchParams;
  const pageFromParams = params?.page ? Number(params.page) : 1;
  const sizeFromParams = params?.size && params.size ? Number(params.size) : 20;
  const currentPage = Number.isFinite(pageFromParams) && pageFromParams > 0 ? pageFromParams : 1;
  const pageSize = sizeFromParams <= 100 ? sizeFromParams : 20;

  const { locks, page, totalPages } = await getLocksPage(currentPage, pageSize);

  const now = Math.floor(Date.now() / 1000);

  return (
    <div className="flex items-center justify-center px-6 md:pt-6 pb-6 bg-white">
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <div className="font-body rounded-xl p-3 border border-purple-100 shadow-sm bg-purple-50">
          <h3 className="flex justify-center text-xl text-purple-800 font-heading">Locks<span className="text-purple-500 ml-1">({locks.length})</span></h3>
          {locks.length > 0 ? (
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
          </div>
          ) : (
          <div className="p-8 text-center">
            <p className="text-purple-500">No locks</p>
          </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center text-xs text-purple-500">
          <div className="flex items-center gap-2 text-xs text-purple-500">
            <div className="inline-flex overflow-hidden rounded-full border border-purple-200">
              {[20, 50, 100].map((size) => (
              <Link
                key={size}
                href={`/explorer?page=1&size=${size}`}
                className={[
                    "px-3 py-1",
                    size === pageSize ? "bg-purple-100 text-purple-800" : "text-purple-700 hover:bg-purple-50",
                ].join(" ")}
              >
                {size}
              </Link>
            ))}
            </div>
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/explorer?page=1&size=${pageSize}`}
                className="px-3 py-1 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                First
              </Link>
            )}
            {page > 1 && (
              <Link
                href={`/explorer?page=${page - 1}&size=${pageSize}`}
                className="px-3 py-1 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/explorer?page=${page + 1}&size=${pageSize}`}
                className="px-3 py-1 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Next
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/explorer?page=${totalPages}&size=${pageSize}`}
                className="px-3 py-1 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Last
              </Link>
            )}
          </div>
          <span>
            Page {page} of {totalPages}
          </span>

        </div>
      </div>
    </div>
  );
}
