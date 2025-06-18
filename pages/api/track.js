export default async function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  try {
    // Step 1: Detect carrier
    const detectRes = await fetch(`https://api.ship24.com/public/v1/carriers/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SHIP24_API_KEY}`,
      },
      body: JSON.stringify({ trackingNumber: number })
    });

    const detectData = await detectRes.json();
    const detectedCarrier = detectData?.data?.[0]?.code;

    // Use fallback if carrier not detected
    const carrier = detectedCarrier || 'parcelone';

    // Step 2: Create tracker
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
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: result,
      });
      return res.status(response.status || 500).json({ error: result.error || 'API Error', details: result });
    }

    const tracking = result.data?.[0]?.tracker;
    if (!tracking) {
      return res.status(404).json({ error: 'No tracking data found' });
    }

    res.status(200).json(tracking);
  } catch (error) {
    console.error('Unexpected Error:', error);
    res.status(500).json({ error: error.message || 'Unexpected error' });
  }
}
