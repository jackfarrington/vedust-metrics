import "server-only";

import { createPublicClient, defineChain, http } from "viem";

export const RPC_URL = process.env.RPC_URL ?? "https://rpc.monad.xyz";
export const CHAIN_ID = Number(process.env.EVM_CHAIN_ID ?? "143");

export const MON_DECIMALS = 18;

const monad = defineChain({
  id: CHAIN_ID,
  name: "Monad",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: MON_DECIMALS },
  rpcUrls: { default: { http: [RPC_URL] } },
  blockExplorers: {
    default: { name: 'MonadVision', url: 'https://monadvision.com' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
});

export const publicClient = createPublicClient({
  chain: monad,
  transport: http(RPC_URL),
  batch: {
    multicall: true,
  },
});

export const chain = monad;
