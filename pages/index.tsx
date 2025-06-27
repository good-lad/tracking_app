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

const styles = {
  container: {
    maxWidth: 700,
    margin: '2rem auto',
    padding: '1.5rem',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
    color: '#111',
  },
  form: {
    display: 'flex',
    marginBottom: '2rem',
  },
  input: {
    flexGrow: 1,
    padding: '0.75rem 1rem',
    fontSize: '1.1rem',
    border: '1px solid #ccc',
    borderRadius: '6px 0 0 6px',
    outline: 'none',
  },
  button: {
    padding: '0 1.5rem',
    fontSize: '1.1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '0 6px 6px 0',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'default',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '1rem',
    borderRadius: 6,
    marginBottom: '1.5rem',
    fontWeight: '600',
  },
  infoGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '1rem',
  },
  infoBlock: {
    flex: 1,
    textAlign: 'center' as const,
  },
  infoLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    marginBottom: '0.25rem',
  },
  infoValue: {
    fontSize: '1.25rem',
    fontFamily: 'monospace',
    color: '#111827',
    wordBreak: 'break-word' as const,
  },
  timeline: {
    borderLeft: '3px solid #2563eb',
    marginLeft: 20,
    paddingLeft: 20,
  },
  event: {
    position: 'relative' as const,
    marginBottom: 30,
  },
  eventDot: {
    position: 'absolute' as const,
    left: -30,
    top: 5,
    width: 14,
    height: 14,
    backgroundColor: '#2563eb',
    borderRadius: '50%',
    border: '3px solid white',
    boxShadow: '0 0 0 2px #2563eb',
  },
  eventDate: {
    fontSize: '0.85rem',
    color: '#6b7280',
    marginBottom: 4,
  },
  eventStatus: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#111827',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: '0.95rem',
    color: '#4b5563',
  },
  noEvents: {
    fontSize: '1rem',
    color: '#6b7280',
    fontStyle: 'italic',
  },
};

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
    <main style={styles.container}>
      <h1 style={styles.title}>Package Tracking</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Enter tracking number"
          style={styles.input}
          disabled={loading}
        />
        <button
          type="submit"
          style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
          disabled={loading}
        >
          {loading ? 'Tracking...' : 'Track'}
        </button>
      </form>

      {error && <div style={styles.error}>{error}</div>}

      {trackingData && (
        <>
          <div style={styles.infoGrid}>
            <div style={styles.infoBlock}>
              <div style={styles.infoLabel}>Tracking Number</div>
              <div style={styles.infoValue}>{trackingData.trackingNumber}</div>
            </div>
            <div style={styles.infoBlock}>
              <div style={styles.infoLabel}>Courier</div>
              <div style={{ ...styles.infoValue, fontFamily: 'inherit' }}>{trackingData.courier}</div>
            </div>
          </div>

          <section style={styles.timeline}>
            {trackingData.events.length === 0 ? (
              <p style={styles.noEvents}>No tracking events found.</p>
            ) : (
              trackingData.events.map((event, idx) => (
                <div key={idx} style={styles.event}>
                  <div style={styles.eventDot}></div>
                  <time style={styles.eventDate}>
                    {new Date(event.date).toLocaleString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                  <div style={styles.eventStatus}>{event.status}</div>
                  <div style={styles.eventLocation}>{event.location}</div>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </main>
  );
}
