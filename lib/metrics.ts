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
  circulation: bigint;
  locked: bigint;
  power: bigint;
  emittedSupply: bigint;
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

  const uncirculatedBalances = await Promise.all([
    await dustContract.balanceOf("0xe72df2DDE84880DD706C5976E92ed34BB586A38F"),
    await dustContract.balanceOf("0x003F5393F4836f710d492AD98D89F5BFCCF1C962"),
    await dustContract.balanceOf("0xb83a6637c87E6a7192b3ADA845c0745F815e9006"),
    await dustContract.balanceOf("0xBB4738D05AD1b3Da57a4881baE62Ce9bb1eEeD6C"),
    await dustContract.balanceOf("0x6BB849D8D8D58d95323504444779d8E5cDAa4026"),
    await dustContract.balanceOf("0x178D5F48a27f728E24e7d530a7c5c901778AAdE7"),
    await dustContract.balanceOf("0x909b176220b7e782C0f3cEccaB4b19D2c433c6BB"),
  ]);

  const circulation = remainingSupply - uncirculatedBalances.reduce((a, b) => a + b, 0n) / divisor;

  const locked = (await lockContract.supply()) / divisor;
  const power = (await lockContract.totalSupply()) / divisor;

  const emittedSupply = totalBurned + locked + circulation;

  const lastUpdate = new Date();

  return {
    symbol,
    mintedSupply,
    burnedSoFar,
    remainingSupply,
    pendingBurn,
    totalBurned,
    circulation,
    locked,
    power,
    emittedSupply,
    lastUpdate,
  };
}