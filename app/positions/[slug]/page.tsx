import { cacheLife } from 'next/cache';

import { type Address, isAddress } from "viem";

import Overview from "@/components/overview";
import Positions from '@/components/positions';

import { getDustPrice, getPendingRewards, getPortfolio } from "@/lib/portfolio";

type PageProps = {
  params: Promise<{ slug: Address }>;
};

export default async function Page({ params }: PageProps) {
  "use cache";
  const { slug } = await params;
  const address = slug as Address;
  
  cacheLife({ stale: 60, revalidate: 60, expire: 60 });
  const [
    portfolio,
    dustPrice,
    { totalPower, usdcRewards },
  ] = await Promise.all([
    getPortfolio(address),
    getDustPrice(),
    getPendingRewards(),
  ]);

  if (!isAddress(address)) {
    return (
      <div className={`flex items-center justify-center md:pt-16 bg-white`}>
        <p className="text-sm text-red-700">Invalid address</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-6 md:pt-6 pb-6 bg-white">
      {isAddress(address) ?
        <div className="flex flex-col gap-6 w-full max-w-4xl">
          <h1 className="text-xs text-center text-purple-300">{address}</h1>
          <Overview dustPrice={dustPrice} portfolio={portfolio} usdcRewards={usdcRewards} totalPower={totalPower} />
          <Positions dustPrice={dustPrice} positions={portfolio.locks} />
        </div>
      : <p className="text-sm text-red-500">Enter a valid address</p>}
    </div>    
  );
}
