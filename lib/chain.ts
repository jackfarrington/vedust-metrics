import { createPublicClient, defineChain, http } from "viem";

export const MONAD_RPC_URL = "https://rpc.monad.xyz";

const monad = defineChain({
  id: 143,
  name: "Monad",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [MONAD_RPC_URL] } },
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
  transport: http(MONAD_RPC_URL),
  batch: {
    multicall: true,
  },
});

export const chain = monad;
