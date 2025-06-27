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
    <main className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Package Tracker</h1>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Enter tracking number"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Track'}
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {trackingData && (
        <section>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tracking Number</h3>
              <p className="text-lg font-semibold">{trackingData.trackingNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Courier</h3>
              <p className="text-lg font-semibold">{trackingData.courier}</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Tracking History</h3>

          {trackingData.events.length === 0 ? (
            <p>No tracking events found.</p>
          ) : (
            <ul className="space-y-4">
              {trackingData.events.map((event, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    {idx < trackingData.events.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{event.status}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(event.date).toLocaleString()} • {event.location}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
