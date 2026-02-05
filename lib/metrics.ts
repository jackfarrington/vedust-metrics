import { ethers } from 'ethers';

import dustAbi from '@/app/abi/dust_abi.json';
import lockAbi from '@/app/abi/lock_abi.json';
import helperAbi from '@/app/abi/helper_abi.json';

const rpcUrl = process.env.RPC_URL;

export const MINTED_SUPPLY = 100_000_000n;

const dustAddress = "0xAD96C3dffCD6374294e2573A7fBBA96097CC8d7c";
const dustBurnEscrowAddress = "0x909b176220b7e782C0f3cEccaB4b19D2c433c6BB";
const dustLockProxyAddress = "0xBB4738D05AD1b3Da57a4881baE62Ce9bb1eEeD6C";
const dustHelperAddress = "0x5c6559e7484e45efB16F477743996be2d488d7db";

const provider = new ethers.JsonRpcProvider(rpcUrl);

const dustContract = new ethers.Contract(dustAddress, dustAbi, provider);
const lockContract = new ethers.Contract(dustLockProxyAddress, lockAbi, provider);
const helperContract = new ethers.Contract(dustHelperAddress, helperAbi, provider);

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
  const symbol = await dustContract.symbol();
  const decimals = await dustContract.decimals();
  const divisor = 10n**decimals;

  const mintedSupply = MINTED_SUPPLY;
  const remainingSupply = (await dustContract.totalSupply()) / divisor;
  const burnedSoFar = mintedSupply - remainingSupply;
  const pendingBurn = (await dustContract.balanceOf(dustBurnEscrowAddress)) / divisor;
  const totalBurned = burnedSoFar + pendingBurn;

  const teamTotalBalance = await helperContract.getTeamTotalBalance();

  const circulation = remainingSupply - teamTotalBalance / divisor;

  const locked = (await lockContract.supply()) / divisor;
  const infiniteLocked = (await lockContract.permanentLockBalance()) / divisor;
  const power = (await lockContract.totalSupply()) / divisor;

  const emittedSupply = totalBurned + locked + circulation;

  const lastUpdate = new Date();

  const [priceDigits, isOracle] = await helperContract.getPrice();

  const price = isOracle ? Number(priceDigits) / 10 ** 8 : Number(priceDigits) / 10 ** 18;

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