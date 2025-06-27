// pages/index.tsx
import { useState, FormEvent } from 'react';
import TrackingDisplay from '../components/TrackingDisplay';

export default function Home() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submittedNumber, setSubmittedNumber] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmittedNumber(trackingNumber.trim());
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Package Tracker</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
          >
            Track
          </button>
        </div>
      </form>

      {submittedNumber && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <TrackingDisplay trackingNumber={submittedNumber} />
        </div>
      )}
    </div>
  );
}
