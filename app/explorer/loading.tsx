export default function Loading() {
  return (
    <div className="flex items-center justify-center px-6 md:pt-6 pb-6 bg-white">
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <div className="font-body rounded-xl p-3 border border-purple-100 shadow-sm bg-purple-50">

          <h3 className="flex justify-center text-xl text-purple-800 font-heading">
            Locks
          </h3>

          <div className="p-8 text-center">
            <p className="text-purple-500">
              Loading...
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}