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
      body: JSON.stringify({ trackingNumber: number })
    });

    const text = await response.text(); // <-- for raw response debugging
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.error('Failed to parse response:', text);
      return res.status(500).json({ error: 'Invalid JSON returned by Ship24 API' });
    }

    console.log('API result:', result);

    if (!response.ok || !result || result.error) {
      return res.status(response.status || 500).json({ error: result.error || result.message || 'API Error' });
    }

    const tracking = result.data?.tracker ?? result.data?.[0]?.tracker;

    if (!tracking || !tracking.tracking_number) {
      return res.status(404).json({ error: 'No tracking data found' });
    }

    res.status(200).json(tracking);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Unexpected error' });
  }
}
