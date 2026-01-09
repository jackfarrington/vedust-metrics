import { cacheLife } from 'next/cache';

import { ethers } from 'ethers';

import dustAbi from '@/app/abi/dust_abi.json';
import lockAbi from '@/app/abi/lock_abi.json';

const rpcUrl = process.env.RPC_URL;

const mintedSupply = 100_000_000n;
const dustAddress = "0xAD96C3dffCD6374294e2573A7fBBA96097CC8d7c";
const dustBurnEscrowAddress = "0x909b176220b7e782C0f3cEccaB4b19D2c433c6BB";
const dustLockProxyAddress = "0xBB4738D05AD1b3Da57a4881baE62Ce9bb1eEeD6C";

const provider = new ethers.JsonRpcProvider(rpcUrl);

const dustContract = new ethers.Contract(dustAddress, dustAbi, provider);
const lockContract = new ethers.Contract(dustLockProxyAddress, lockAbi, provider);

export interface Metrics {
  symbol: string;
  mintedSupply: bigint;
  burnedSoFar: bigint;
  remainingSupply: bigint;
  pendingBurn: bigint;
  totalBurned: bigint;
  locked: bigint;
  power: bigint;
  lastUpdate: Date;
}

export async function getMetrics(): Promise<Metrics> {
  'use cache';

  cacheLife('minutes');

  const symbol = await dustContract.symbol();
  const decimals = await dustContract.decimals();
  const divisor = 10n**decimals;

  const remainingSupply = (await dustContract.totalSupply()) / divisor;
  const burnedSoFar = mintedSupply - remainingSupply;
  const pendingBurn = (await dustContract.balanceOf(dustBurnEscrowAddress)) / divisor;
  const totalBurned = burnedSoFar + pendingBurn;

  const locked = (await lockContract.supply()) / divisor;
  const power = (await lockContract.totalSupply()) / divisor;

  const lastUpdate = new Date();

  return {
    symbol,
    mintedSupply,
    burnedSoFar,
    remainingSupply,
    pendingBurn,
    totalBurned,
    locked,
    power,
    lastUpdate,
  };
}