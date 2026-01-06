import { ethers } from 'ethers';

import dustAbi from '@/app/dust_abi.json';

const rpcUrl = process.env.RPC_URL;

const mintedSupply = 100_000_000n;
const dustAddress = "0xAD96C3dffCD6374294e2573A7fBBA96097CC8d7c";
const lockAddress = "0x909b176220b7e782C0f3cEccaB4b19D2c433c6BB";

const provider = new ethers.JsonRpcProvider(rpcUrl);

const contract = new ethers.Contract(dustAddress, dustAbi, provider);

export interface Metrics {
  symbol: string;
  mintedSupply: bigint;
  burnedSoFar: bigint;
  remainingSupply: bigint;
  pendingBurn: bigint;
  totalBurned: bigint;
  lastUpdate: Date;
}

export async function getMetrics(): Promise<Metrics> {
  'use cache';

  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const divisor = 10n**decimals;

  const remainingSupply = (await contract.totalSupply()) / divisor;
  const burnedSoFar = mintedSupply - remainingSupply;
  const pendingBurn = (await contract.balanceOf(lockAddress)) / divisor;
  const totalBurned = burnedSoFar + pendingBurn;

  const lastUpdate = new Date();

  return {
    symbol,
    mintedSupply,
    burnedSoFar,
    remainingSupply,
    pendingBurn,
    totalBurned,
    lastUpdate,
  };
}