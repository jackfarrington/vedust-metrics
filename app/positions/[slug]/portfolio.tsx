"use client";

import { useEffect, useState } from "react";

import { type Address } from "viem";

import { type Portfolio, getPortfolio } from "@/lib/portfolio";
import { type LoadState } from "@/lib/util";

import Overview from "@/components/overview";
import Positions from '@/components/positions';
import AddressBox from "@/components/address-box";

type PortfolioPageProps = {
  address: Address;
};

export default function PortfolioPage({ address }: PortfolioPageProps) {
  const [state, setState] = useState<LoadState<Portfolio>>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      setState({ status: "loading" });
      try {
        const portfolio = await getPortfolio(address);

        setState({ status: "success", value: portfolio });
      } catch (e) {
        if (cancelled) return;
        console.log('An error occurred.', e);
        setState({ status: "error", error: (e as Error)?.message ?? e });
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex items-center justify-center px-6 md:pt-6 pb-6 bg-white">

      {state.status === "idle" || state.status === "loading" ?
        <p className="text-sm text-purple-800">Loading portfolio...</p>
      : null}
      
      {state.status === "success" ?
        <div className="flex flex-col gap-6 w-full max-w-4xl">
          <AddressBox defaultAddress={address} />
          
          <Overview portfolio={state.value} />
          
          <Positions portfolio={state.value} />
        </div>
      : null}

      {state.status === "error" ?
        <div className="flex items-center justify-center px-6 md:pt-6 pb-6 bg-white">
          <p className="text-sm text-red-700">Something went wrong. :(</p>
          {state.error &&
          <p className="text-sm text-red-700">{state.error}</p>
          }
        </div>
      : null}

    </div>
  );
}
