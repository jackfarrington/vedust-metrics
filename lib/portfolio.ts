import "server-only";

import { type Address } from "viem";

import uniswapQuoterAbi from '@/lib/abi/uniswap/uniswap_quoter';
import {
  USDC_TOKEN,
  AUSD_TOKEN,
  DUST_TOKEN,
  MON_TOKEN,
  WMON_TOKEN,
  DUST_LOCK_PROXY_ADDRESS,
  UNISWAP_QUOTER_ADDRESS,
} from "@/lib/addresses";
import { publicClient } from "@/lib/chain";
import {
  dustContract,
  dustLockContract,
  neverlandUiProviderContract,
} from "@/lib/contracts";
import { fetchWithRetry, getQueryString, tokenToNumber } from "@/lib/util";

export type Portfolio = {
  readonly account: Address;
  readonly tokens: {
    readonly dust: number;
    readonly mon: number;
  },
  readonly accruals: {
    readonly dust: number;
  },
  readonly positions: Position[];
};

export type Position = {
  readonly lock: Lock;
}

type Lock = {
  readonly id: string;
  readonly dust: number;
  readonly power: number;
  readonly daysToUnlock: number;
  readonly isPermanent: boolean;
};

export async function getLocks(account: Address): Promise<bigint[]> {
  let magicEdenUrl = new URL("https://api-mainnet.magiceden.dev/v4/evm-public/assets/user-assets");
  const params = {
    chain: "monad",
    walletAddresses: [account],
    collectionIds: [DUST_LOCK_PROXY_ADDRESS.toLowerCase()],
    sortBy: "receivedAt",
    sortDir: "desc",
    limit: "100",
  };
  magicEdenUrl.search = getQueryString(params);

  let assets: any[] = [];
  try {
    let continuation: string | undefined;
    let json: any;
    do {
      const response = await fetchWithRetry(magicEdenUrl);
      if (!response.ok) throw new Error(`Magic Eden API error: ${response.status}`);
      json = await response.json();
      assets = assets.concat(json["assets"].map((obj: any) => { return obj["asset"]}));
      continuation = json["continuation"];
      if (continuation && json["assets"].length === 100) {
        magicEdenUrl.searchParams.set("continuation", continuation);
      }
    } while (continuation && json["assets"].length === 100);
  } catch (error) {
    console.error("Error fetching Magic Eden listings:", error);
    throw error;
  }

  return assets
    .map((asset: any) => BigInt(asset.tokenId))
    .toSorted((a: bigint, b: bigint) => Number(a - b));
}

export async function getPortfolio(address: Address): Promise<Portfolio> {

  const ids = await getLocks(address);

  const [dust, mon, [addresses, amounts]] = await Promise.all([
    dustContract.read.balanceOf([address]),
    publicClient.getBalance({ address }),
    neverlandUiProviderContract.read.getUserEmissions([address]),
  ]);

  const idx = addresses.findIndex(addr => addr === DUST_TOKEN.address);
  const dustAccrued = idx < 0 ? 0n : amounts[idx];

  const positions: Position[] = await Promise.all(
    ids.map((id) =>
      getDustLocked(id)
        .then(({ id, dust, power, daysToUnlock, isPermanent }) => ({
          lock: {
            id,
            dust,
            power,
            daysToUnlock,
            isPermanent,
          },
        }))
    )
  );

  const portfolio: Portfolio = {
    account: address,
    tokens: {
      dust: tokenToNumber(dust, DUST_TOKEN.decimals),
      mon: tokenToNumber(mon, MON_TOKEN.decimals),
    },
    accruals: {
      dust: tokenToNumber(dustAccrued, DUST_TOKEN.decimals),
    },
    positions,
  };

  return portfolio;
}

export async function getDustLocked(id: bigint): Promise<Lock> {
  const [lock, power] = await Promise.all([
    dustLockContract.read.locked([id]),
    dustLockContract.read.balanceOfNFT([id])
  ]);

  return {
    id: id.toString(),
    dust: tokenToNumber(lock.amount, DUST_TOKEN.decimals),
    power: tokenToNumber(power, DUST_TOKEN.decimals),
    daysToUnlock: Math.max(0, Math.floor((Number(lock.end) - Date.now() / 1000) / 86400)),
    isPermanent: lock.isPermanent,
  };
}

export async function getDustPrice(): Promise<number> {
  return await quoteExactInputSingle(
    DUST_TOKEN.address as Address,
    AUSD_TOKEN.address as Address,
    BigInt(1 * 10**DUST_TOKEN.decimals),
    10000, // 1.0%
  ).then((amountOut) => tokenToNumber(amountOut, AUSD_TOKEN.decimals));
}

export async function getMonPrice(): Promise<number> {
  return await quoteExactInputSingle(
    WMON_TOKEN.address as Address,
    USDC_TOKEN.address as Address,
    BigInt(1 * 10**WMON_TOKEN.decimals),
    500, // 0.05%
  ).then((amountOut) => tokenToNumber(amountOut, USDC_TOKEN.decimals));
}

export async function getPendingRewards(): Promise<{ totalPower: number, usdcRewards: number }> {
  const [globalStats, marketData] = await Promise.all([
    neverlandUiProviderContract.read.getGlobalStats(),
    neverlandUiProviderContract.read.getMarketData(),
  ]);

  return {
    totalPower: tokenToNumber(globalStats.totalVotingPower, DUST_TOKEN.decimals),
    usdcRewards: tokenToNumber(marketData.nextEpochRewards[0], USDC_TOKEN.decimals),
  } 
}

async function quoteExactInputSingle(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint,
  fee: number,
  sqrtPriceLimitX96: bigint = 0n
): Promise<bigint> {

  const [amountOut, _sqrtPriceX96After, _initializedTicksCrossed, _gasEstimate] =
    await publicClient.readContract({
      address: UNISWAP_QUOTER_ADDRESS as Address,
      abi: uniswapQuoterAbi,
      functionName: 'quoteExactInputSingle',
      args: [
        [
          tokenIn,
          tokenOut,
          amountIn,
          fee,
          sqrtPriceLimitX96,
        ],
      ],
    }) as [bigint, bigint, number, bigint];

  return amountOut;
}
