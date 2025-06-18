// File: /pages/api/track.js
export default async function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  try {
    const response = await fetch(`https://api.ship24.com/api/v1/trackers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SHIP24_API_KEY}`,
      },
      body: JSON.stringify({ trackingNumber: number }),
    });

    const result = await response.json();
    console.log('Create tracker response:', result);

    if (!response.ok) {
      return res.status(response.status).json({ error: result.message || 'API error' });
    }

    const tracking = result.data?.tracker ?? result.data?.[0]?.tracker;

    if (!tracking || !tracking.tracking_number) {
      return res.status(404).json({ error: 'No tracking data found' });
    }

    res.status(200).json(tracking);
  } catch (error) {
    console.error('API ERROR:', error);
    res.status(500).json({ error: error.message || 'Unexpected error' });
  }
}
