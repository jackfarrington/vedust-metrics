import { getAddress } from "viem/utils";

export type Token = {
  readonly address: string;
  readonly decimals: number;
  readonly symbol: string;
  readonly name: string;
}

const ZERO_ADDRESS = getAddress("0x0000000000000000000000000000000000000000");

// ERC20 tokens
export const WMON_ADDRESS = (process.env.WMON_ADDRESS ?? "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A");
export const USDC_ADDRESS = (process.env.USDC_ADDRESS ?? "0x754704Bc059F8C67012fEd69BC8A327a5aafb603");
export const AUSD_ADDRESS = (process.env.AUSD_ADDRESS ?? "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a");
export const DUST_ADDRESS = (process.env.DUST_ADDRESS ?? "0xAD96C3dffCD6374294e2573A7fBBA96097CC8d7c");

// Neverland
export const REVENUE_REWARD_PROXY_ADDRESS = (process.env.REVENUE_REWARD_PROXY_ADDRESS ?? "0xff20ac10eb808B1e31F5CfCa58D80eDE2Ba71c43");
export const DUST_LOCK_PROXY_ADDRESS = (process.env.DUST_LOCK_PROXY_ADDRESS ?? "0xBB4738D05AD1b3Da57a4881baE62Ce9bb1eEeD6C");
export const NEVERLAND_DUST_HELPER_ADDRESS = (process.env.NEVERLAND_DUST_HELPER_ADDRESS ?? "0x5c6559e7484e45efB16F477743996be2d488d7db");
export const NEVERLAND_UI_PROVIDER_ADDRESS = (process.env.NEVERLAND_UI_PROVIDER_ADDRESS ?? "0x16F00522230f5CA84a7E3F6127a10eFC117af4e2");

export const DUST_BURN_ESCROW_ADDRESS = getAddress("0x909b176220b7e782C0f3cEccaB4b19D2c433c6BB");

// Uniswap V3
export const UNISWAP_QUOTER_ADDRESS = (process.env.UNISWAP_QUOTER_ADDRESS ?? "0x661e93cca42afacb172121ef892830ca3b70f08d");

// Tokens
export const WMON_TOKEN: Token = { address: WMON_ADDRESS, decimals: 18, symbol: "WMON", name: "Wrapped MON" };
export const USDC_TOKEN: Token = { address: USDC_ADDRESS, decimals: 6, symbol: "USDC", name: "USD Coin" };
export const AUSD_TOKEN: Token = { address: AUSD_ADDRESS, decimals: 6, symbol: "AUSD", name: "Agora USD" };
export const DUST_TOKEN: Token = { address: DUST_ADDRESS, decimals: 18, symbol: "DUST", name: "Pixie Dust" };

export const MON_TOKEN: Token = { address: ZERO_ADDRESS, decimals: 18, symbol: "MON", name: "Monad" };
