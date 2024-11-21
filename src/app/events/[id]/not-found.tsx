import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <h2 className="text-xl font-semibold">Event Not Found</h2>
      <p>Could not find the requested event.</p>
      <Link
        href="/events"
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
      >
        Go Back
      </Link>
    </div>
  );
} 