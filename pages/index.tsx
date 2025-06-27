// pages/index.tsx

import { useState, FormEvent } from 'react';

interface TrackingEvent {
  date: string;
  status: string;
  location: string;
}

interface TrackingData {
  trackingNumber: string;
  courier: string;
  events: TrackingEvent[];
}

export default function Home() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      setTrackingData(null);
      return;
    }

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const res = await fetch(`/api/track?number=${encodeURIComponent(trackingNumber.trim())}`);
      const json = await res.json();

      if (res.ok) {
        setTrackingData(json);
      } else {
        setError(json.error || 'Failed to fetch tracking info');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          Track Your Package
        </h1>

        <form onSubmit={handleSubmit} className="flex mb-8">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="flex-grow border border-gray-300 rounded-l-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-r-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {trackingData && (
          <section>
            <div className="mb-8 grid grid-cols-2 gap-6 text-center sm:text-left">
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Tracking Number
                </h2>
                <p className="mt-1 text-xl font-mono text-gray-900 break-all">
                  {trackingData.trackingNumber}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Courier
                </h2>
                <p className="mt-1 text-xl font-semibold text-gray-700">{trackingData.courier}</p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold mb-6 border-b border-gray-200 pb-2">
              Tracking History
            </h3>

            {trackingData.events.length === 0 ? (
              <p className="text-gray-600">No tracking events found.</p>
            ) : (
              <ol className="relative border-l border-gray-300 ml-4">
                {trackingData.events.map((event, idx) => (
                  <li key={idx} className="mb-10 ml-6">
                    <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full ring-8 ring-white">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M6 10l3 3 6-6" />
                      </svg>
                    </span>
                    <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                      {new Date(event.date).toLocaleString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    <h4 className="text-lg font-semibold text-gray-900">{event.status}</h4>
                    <p className="text-gray-600">{event.location}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
