export default async function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  try {
    // Step 1: Detect carrier
    const detectRes = await fetch(`https://api.trackingmore.com/v4/carriers/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Tracking-Api-Key': process.env.TRACKINGMORE_API_KEY,
      },
      body: JSON.stringify({ tracking_number: number })
    });

    const detectData = await detectRes.json();
    const carrierCode = detectData?.data?.[0]?.code;

    if (!carrierCode) {
      return res.status(400).json({ error: 'Could not detect carrier' });
    }

    // Step 2: Create tracking
    const createRes = await fetch(`https://api.trackingmore.com/v4/trackings/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Tracking-Api-Key': process.env.TRACKINGMORE_API_KEY,
      },
      body: JSON.stringify({
        tracking_number: number,
        carrier_code: carrierCode
      })
    });

    const result = await createRes.json();
    console.log('TrackingMore response:', result);

    if (!createRes.ok || !result || result.meta?.code !== 200) {
      return res.status(createRes.status || 500).json({ error: result.meta?.message || 'TrackingMore API Error' });
    }

    res.status(200).json(result.data);
  } catch (error) {
    console.error('API ERROR:', error);
    res.status(500).json({ error: error.message || 'Unexpected error' });
  }
}
