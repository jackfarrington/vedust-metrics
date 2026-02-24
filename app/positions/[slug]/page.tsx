"use client";

import { useEffect, useState } from "react";

import { type Address, isAddress } from "viem";

import { getDustPrice, getPendingRewards, getPortfolio, Portfolio } from "@/lib/portfolio";

import Overview from "@/components/overview";
import Positions from '@/components/positions';

type PageProps = {
  params: Promise<{ slug: Address }>;
};

export default function Page({ params }: PageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [address, setAddress] = useState<Address>();
  const [portfolio, setPortfolio] = useState<Portfolio>();
  const [dustPrice, setDustPrice] = useState<number>();
  const [totalPower, setTotalPower] = useState<number>();
  const [usdcRewards, setUsdcRewards] = useState<number>();

  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      setStatus("loading");
      try {
        const { slug } = await params;
        const address = slug as Address;
        
        const [
          portfolio,
          dustPrice,
          { totalPower, usdcRewards },
        ] = await Promise.all([
          getPortfolio(address),
          getDustPrice(),
          getPendingRewards(),
        ]);

        setAddress(address);
        setPortfolio(portfolio);
        setDustPrice(dustPrice);
        setTotalPower(totalPower);
        setUsdcRewards(usdcRewards);

        setStatus("loaded");
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex items-center justify-center px-6 md:pt-6 pb-6 bg-white">
      {status === "loading" ?
        <p className="text-sm text-purple-800">Loading portfolio...</p>
      : status === "loaded" && address ?
        !isAddress(address) ? (
        <p className="text-sm text-red-700">Invalid address</p>
      ) : portfolio !== undefined &&
          dustPrice !== undefined &&
          totalPower !== undefined &&
          usdcRewards !== undefined &&
          <div className="flex flex-col gap-6 w-full max-w-4xl">
            <h1 className="text-xs text-center text-purple-300">{address}</h1>
            <Overview dustPrice={dustPrice} portfolio={portfolio} usdcRewards={usdcRewards} totalPower={totalPower} />
            <Positions dustPrice={dustPrice} positions={portfolio.locks} />
          </div>
      : <p className="text-sm text-red-700">Something went wrong. :(</p>
      }
    </div>    
  );
}
