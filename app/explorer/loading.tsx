export default async function Loading() {
    return (
      <div className={`flex items-center justify-center md:pt-16 bg-white`}>
        <p className="text-sm text-gray-500">Retrieving locks...</p>
      </div>
    );
  }