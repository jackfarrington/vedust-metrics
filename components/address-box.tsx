"use client";

import { useRouter } from 'next/navigation';

export default function AddressBox() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const address = formData.get('address');          
    if (address) {
      router.push(`/positions/${address}`);
    }
  }

  return (
    <form className="flex flex-row gap-2 items-center justify-center mt-6 space-y-3" onSubmit={handleSubmit}>
      <input type="text" name="address" placeholder="Enter an address" className={`mt-6 text-center text-sm text-gray-500 border border-gray-200 rounded-lg p-2 min-w-2xs`} />
      <button type="submit" className="mt-2 bg-purple-900 hover:bg-purple-700 text-white py-1 px-2 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="14 5 21 12 14 19" />
        </svg>
      </button>
    </form>
  );
}
