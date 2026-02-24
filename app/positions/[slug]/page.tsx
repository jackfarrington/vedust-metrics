import { type Address, isAddress } from "viem";

import PortfolioPage from "@/app/positions/[slug]/portfolio";

type PageProps = {
  params: Promise<{ slug: Address }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const address = slug as Address;

  return (
    isAddress(address) ? (
      <PortfolioPage address={address} />
    ) : (
      <div className="flex items-center justify-center px-6 md:pt-6 pb-6 bg-white">
        <p className="text-sm text-red-700">Invalid address</p> 
      </div>
    )
  )
}
