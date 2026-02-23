import { type Address, erc20Abi, getContract } from "viem";

import {
  USDC_ADDRESS,
  AUSD_ADDRESS,
  DUST_ADDRESS,
  REVENUE_REWARD_PROXY_ADDRESS,
  DUST_LOCK_PROXY_ADDRESS,
  NEVERLAND_DUST_HELPER_ADDRESS,
  NEVERLAND_UI_PROVIDER_ADDRESS,
  UNISWAP_QUOTER_ADDRESS,
} from "@/lib/addresses";

import { publicClient } from "@/lib/chain";

// Neverland ABIs
import dustLockAbi from "@/lib/abi/neverland/dust_lock";
import neverlandDustHelperAbi from "@/lib/abi/neverland/dust_helper";
import neverlandUiProvider from "@/lib/abi/neverland/ui_provider";
import revenueRewardAbi from "@/lib/abi/neverland/revenue_reward";

// Uniswap ABIs
import uniswapQuoterAbi from "@/lib/abi/uniswap/uniswap_quoter";

export const usdcContract = getContract({
  address: USDC_ADDRESS as Address,
  abi: erc20Abi,
  client: {
    public: publicClient,
  },
});

export const ausdContract = getContract({
  address: AUSD_ADDRESS as Address,
  abi: erc20Abi,
  client: {
    public: publicClient,
  },
});

export const dustContract = getContract({
  address: DUST_ADDRESS as Address,
  abi: erc20Abi,
  client: {
    public: publicClient,
  },
});

export const dustLockContract = getContract({
  address: DUST_LOCK_PROXY_ADDRESS as Address,
  abi: dustLockAbi,
  client: {
    public: publicClient,
  },
});

export const neverlandDustHelperContract = getContract({
  address: NEVERLAND_DUST_HELPER_ADDRESS as Address,
  abi: neverlandDustHelperAbi,
  client: {
    public: publicClient,
  },
});

export const neverlandUiProviderContract = getContract({
  address: NEVERLAND_UI_PROVIDER_ADDRESS as Address,
  abi: neverlandUiProvider,
  client: {
    public: publicClient,
  },
});

export const revenueRewardContract = getContract({
  address: REVENUE_REWARD_PROXY_ADDRESS as Address,
  abi: revenueRewardAbi,
  client: {
    public: publicClient,
  },
});

export const uniswapQuoterContract = getContract({
  address: UNISWAP_QUOTER_ADDRESS as Address,
  abi: uniswapQuoterAbi,
  client: {
    public: publicClient,
  },
});
