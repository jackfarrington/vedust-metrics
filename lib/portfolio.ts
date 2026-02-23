import "server-only";

import { type Address } from "viem";

import {
  USDC_TOKEN,
  DUST_TOKEN,
} from "@/lib/addresses";
import {
  dustContract,
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
  readonly locks: Lock[];
};

type NeverlandUserDashboard = {
  user: Address;
  tokenIds: readonly bigint[];
  locks: readonly Lock[];
  rewardSummaries: readonly {
    tokenId: bigint;
    revenueRewards: readonly bigint[];
    rewardTokens: readonly Address[];
  }[];
  totalVotingPower: bigint;
  totalLockedAmount: bigint;
};

export type Lock = {
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

  let locks: Lock[] = [];
  let dashboard: NeverlandUserDashboard;
  let offset = 0n;
  const limit = 20n;
  do {
    dashboard = await neverlandUiProviderContract.read.getUserDashboard([address, offset, limit]);
    locks = locks.concat(dashboard.locks);
    offset += limit;
  } while (dashboard.locks.length > 0);

  const portfolio: Portfolio = {
    account: address,
    dust: {
      held: tokenToNumber(dust, DUST_TOKEN.decimals),
      accrued: tokenToNumber(dustAccrued, DUST_TOKEN.decimals),
    },
    locks,
  };

  return portfolio;
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
