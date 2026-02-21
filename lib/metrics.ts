import "server-only";

import { DUST_BURN_ESCROW_ADDRESS } from "@/lib/addresses";
import {
  dustContract,
  dustLockContract,
  neverlandDustHelperContract,
} from "@/lib/contracts";

export const MINTED_SUPPLY = 100_000_000n;

export interface Metrics {
  symbol: string;
  mintedSupply: bigint;
  burnedSoFar: bigint;
  remainingSupply: bigint;
  pendingBurn: bigint;
  totalBurned: bigint;
  circulation: bigint;
  locked: bigint;
  infiniteLocked: bigint;
  power: bigint;
  emittedSupply: bigint;
  lastUpdate: Date;
  price: number;
}

export async function getMetrics(): Promise<Metrics> {
  const symbol = await dustContract.read.symbol();
  const decimals = await dustContract.read.decimals();
  const divisor = 10n**BigInt(decimals);

  const mintedSupply = MINTED_SUPPLY;
  const remainingSupply = (await dustContract.read.totalSupply()) / divisor;
  const burnedSoFar = mintedSupply - remainingSupply;
  const pendingBurn = (await dustContract.read.balanceOf([DUST_BURN_ESCROW_ADDRESS])) / divisor;
  const totalBurned = burnedSoFar + pendingBurn;

  const teamTotalBalance = await neverlandDustHelperContract.read.getTeamTotalBalance();

  const circulation = remainingSupply - (teamTotalBalance / divisor);

  const locked = (await dustLockContract.read.supply()) / divisor;
  const infiniteLocked = (await dustLockContract.read.permanentLockBalance()) / divisor;
  const power = (await dustLockContract.read.totalSupply()) / divisor;

  const emittedSupply = totalBurned + locked + circulation;

  const lastUpdate = new Date();

  const [priceDigits, isOracle] = await neverlandDustHelperContract.read.getPrice();

  const price = isOracle ? Number(priceDigits) / 10**8 : Number(priceDigits) / 10**18;

  const metrics: Metrics = {
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
  };

  return metrics;
}