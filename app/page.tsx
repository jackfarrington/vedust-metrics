import { Suspense } from 'react';

import SupplySummary from '@/components/supply-summary';
import AddressBox from '@/components/address-box';

export default async function Home() {
  return (
      <main className="items-center justify-center pt-6 md:pt-16 bg-white">
        <Suspense fallback={<div>Loading...</div>}>
          <SupplySummary />
        </Suspense>

        <AddressBox />
      </main>
  );
}
