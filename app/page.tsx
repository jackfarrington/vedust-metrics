import SupplySummary from '@/ui/supply-summary';

export default async function Home() {
  return (
      <main className="flex items-center justify-center pt-6 md:pt-16 bg-white">
        <SupplySummary /> 
      </main>
  );
}
