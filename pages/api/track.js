// track.js - Next.js API route for tracking via Ship24 API

export default async function handler(req, res) {
  const { number } = req.query;
  const apiKey = process.env.SHIP24_API_KEY;

  if (!number) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Step 1: Send tracking number to Ship24 to auto-detect carrier and track
    const response = await fetch('https://api.ship24.com/public/v1/trackers/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ trackingNumber: number }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.message || 'Failed to fetch tracking information',
      });
    }

    const data = await response.json();

    // Basic validation of response structure
    if (!data?.data?.trackings || data.data.trackings.length === 0) {
      return res.status(404).json({ error: 'No tracking data found' });
    }

    // Return the first tracking info (usually only one)
    const trackingInfo = data.data.trackings[0];

    return res.status(200).json(trackingInfo);
  } catch (error) {
    console.error('Tracking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


