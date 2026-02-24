import { Suspense } from 'react';
import Link from 'next/link';

import SupplySummary from '@/components/supply-summary';
import AddressBox from '@/components/address-box';

export default async function Home() {
  return (
      <main className="items-center justify-center pt-6 md:pt-16 bg-white">
        <Suspense fallback={<div>Loading...</div>}>
          <SupplySummary />
        </Suspense>

        <AddressBox />

        <div className="flex justify-center">
          <Link href="/explorer">🧭</Link>
        </div>
      </main>
  );
}
