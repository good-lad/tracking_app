import { useState } from 'react';

export default function Home() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/track?number=${trackingNumber}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch');
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Parcel Tracker</h1>
        <input
          type="text"
          placeholder="Enter Tracking Number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="border p-2 w-full rounded mb-4"
        />
        <button
          onClick={handleTrack}
          disabled={!trackingNumber || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Tracking...' : 'Track'}
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {data && (
          <div className="mt-6 text-left border rounded shadow bg-white">
            <div className="p-4">
              <p><strong>Status:</strong> {data.status || 'N/A'}</p>
              <p><strong>Tracking Number:</strong> {data.tracking_number}</p>
              <p><strong>Courier:</strong> {data.carrier_code}</p>
              <ul className="mt-4 space-y-2">
                {data.events?.map((event, idx) => (
                  <li key={idx} className="text-sm">
                    📍 {event.datetime} - {event.description} ({event.location})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
