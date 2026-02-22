import "server-only";

import { type Address } from "viem";

import uniswapQuoterAbi from '@/lib/abi/uniswap/uniswap_quoter';
import {
  USDC_TOKEN,
  AUSD_TOKEN,
  DUST_TOKEN,
  MON_TOKEN,
  WMON_TOKEN,
  UNISWAP_QUOTER_ADDRESS,
} from "@/lib/addresses";
import { publicClient } from "@/lib/chain";
import {
  dustContract,
  dustLockContract,
  neverlandUiProviderContract,
} from "@/lib/contracts";
import { tokenToNumber } from "@/lib/util";

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

type NeverlandUseerDashboard = {
  user: Address;
  tokenIds: readonly bigint[];
  locks: readonly NeverlandVedustLock[];
  rewardSummaries: readonly {
    tokenId: bigint;
    revenueRewards: readonly bigint[];
    rewardTokens: readonly Address[];
  }[];
  totalVotingPower: bigint;
  totalLockedAmount: bigint;
};

type NeverlandVedustLock = {
  tokenId: bigint;
  amount: bigint;
  end: bigint;
  effectiveStart: bigint;
  isPermanent: boolean;
  votingPower: bigint;
  rewardReceiver: Address;
  owner: Address;
};

export async function getPortfolio(address: Address): Promise<Portfolio> {

  const [dust, mon, [addresses, amounts]] = await Promise.all([
    dustContract.read.balanceOf([address]),
    publicClient.getBalance({ address }),
    neverlandUiProviderContract.read.getUserEmissions([address]),
  ]);

  const idx = addresses.findIndex(addr => addr === DUST_TOKEN.address);
  const dustAccrued = idx < 0 ? 0n : amounts[idx];

  let locks: NeverlandVedustLock[] = [];
  let dashboard: NeverlandUseerDashboard;
  let offset = 0n;
  const limit = 20n;
  do {
    dashboard = await neverlandUiProviderContract.read.getUserDashboard([address, offset, limit]);
    locks = locks.concat(dashboard.locks);
    offset += limit;
  } while (dashboard.locks.length > 0);

  const positions: Position[] = locks.map((lock) => ({
    lock: {
      id: lock.tokenId.toString(),
      dust: tokenToNumber(lock.amount, DUST_TOKEN.decimals),
      power: tokenToNumber(lock.votingPower, DUST_TOKEN.decimals),
      daysToUnlock: Math.max(0, Math.floor((Number(lock.end) - Date.now() / 1000) / 86400)),
      isPermanent: lock.isPermanent,
    },
  }));

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
