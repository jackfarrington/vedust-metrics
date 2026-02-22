import "server-only";

import { type Address } from "viem";

import uniswapQuoterAbi from '@/lib/abi/uniswap/uniswap_quoter';
import {
  USDC_TOKEN,
  DUST_TOKEN,
  UNISWAP_QUOTER_ADDRESS,
} from "@/lib/addresses";
import { publicClient } from "@/lib/chain";
import {
  dustContract,
  dustLockContract,
  neverlandDustHelperContract,
  neverlandUiProviderContract,
} from "@/lib/contracts";
import { tokenToNumber } from "@/lib/util";

export type Portfolio = {
  readonly account: Address;
  readonly dust: {
    held: number;
    accrued: number;
  };
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

  const [dust, [addresses, amounts]] = await Promise.all([
    dustContract.read.balanceOf([address]),
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
    dust: {
      held: tokenToNumber(dust, DUST_TOKEN.decimals),
      accrued: tokenToNumber(dustAccrued, DUST_TOKEN.decimals),
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
  const [priceDigits, isOracle] = await neverlandDustHelperContract.read.getPrice();

  return isOracle ? Number(priceDigits) / 10**8 : Number(priceDigits) / 10**18;
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
