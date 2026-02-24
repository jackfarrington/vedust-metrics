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
  const [
    symbol,
    decimals,
    totalSupplyUnits,
    pendingBurnUnits,

    teamTotalBalance,
    [priceDigits, isOracle],

    lockedUnits,
    permanentUnits,
    powerUnits,
  ] = await Promise.all([
    dustContract.read.symbol(),
    dustContract.read.decimals(),
    dustContract.read.totalSupply(),
    dustContract.read.balanceOf([DUST_BURN_ESCROW_ADDRESS]),

    neverlandDustHelperContract.read.getTeamTotalBalance(),
    neverlandDustHelperContract.read.getPrice(),

    dustLockContract.read.supply(),
    dustLockContract.read.permanentLockBalance(),
    dustLockContract.read.totalSupply(),
  ]);

  const divisor = 10n**BigInt(decimals);

  const mintedSupply = MINTED_SUPPLY;
  const remainingSupply = totalSupplyUnits / divisor;
  const burnedSoFar = mintedSupply - remainingSupply;
  const pendingBurn = pendingBurnUnits / divisor;
  const totalBurned = burnedSoFar + pendingBurn;
  const circulation = remainingSupply - (teamTotalBalance / divisor);
  const locked = lockedUnits / divisor;
  const infiniteLocked = permanentUnits / divisor;
  const power = powerUnits / divisor;
  const emittedSupply = totalBurned + locked + circulation;

  const lastUpdate = new Date();

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