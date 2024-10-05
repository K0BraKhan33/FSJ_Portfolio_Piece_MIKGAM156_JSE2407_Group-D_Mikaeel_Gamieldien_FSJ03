'use client';

export default function Error({ error, reset }) {
  return (
    <div className="text-center">
      <p className="text-red-500">Failed to load products. Error: {error.message}</p>
      <button onClick={() => reset()} className="bg-blue-500 text-white px-4 py-2 mt-4 rounded">
        Retry
      </button>
    </div>
  );
}
