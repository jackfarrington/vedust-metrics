import AddressBox from '@/components/address-box';
import ExplorerLink from '@/components/explorer-link';
import SupplySummary from '@/components/supply-summary';

export default async function Home() {
  return (
    <main className="items-center justify-center pt-6 md:pt-16 bg-white">
      <SupplySummary />

      <AddressBox />

      <ExplorerLink />
    </main>
  );
}
