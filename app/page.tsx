import SupplySummary from '@/ui/supply-summary';

export default async function Home() {
  return (
      <main className="flex w-full max-w-3xl flex-col items-center justify-between py-16 px-16 bg-white dark:bg-black sm:items-start">
        <SupplySummary /> 
      </main>
  );
}
