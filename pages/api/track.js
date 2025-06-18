export default async function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  try {
    // Detect carrier
    const detectRes = await fetch(`https://api.ship24.com/public/v1/carriers/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SHIP24_API_KEY}`,
      },
      body: JSON.stringify({ trackingNumber: number })
    });

    const detectData = await detectRes.json();
    const carrier = detectData?.data?.[0]?.code;

    if (!carrier) {
      return res.status(400).json({ error: 'Could not detect carrier' });
    }

    // Create tracker
    const response = await fetch(`https://api.ship24.com/public/v1/trackers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SHIP24_API_KEY}`,
      },
      body: JSON.stringify({
        trackingNumber: number,
        carrier: carrier
      })
    });

    const result = await response.json();

    if (!response.ok || !result || result.error) {
      return res.status(response.status || 500).json({ error: result.error || 'API Error' });
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
