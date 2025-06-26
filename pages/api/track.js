export default async function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  try {
    // Step 1: Detect carrier using official endpoint
    const detectRes = await fetch('https://api.trackingmore.com/v4/carriers/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Tracking-Api-Key': process.env.TRACKINGMORE_API_KEY,
      },
      body: JSON.stringify({ tracking_number: number }),
    });

    const detectData = await detectRes.json();
    console.log('🔍 Carrier detection response:', detectData);

    const carrierCode = detectData?.data?.[0]?.code;
    if (!carrierCode) {
      return res.status(400).json({ error: 'Could not detect carrier automatically.' });
    }

    // Step 2: Create the tracker
    await fetch('https://api.trackingmore.com/v4/trackings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Tracking-Api-Key': process.env.TRACKINGMORE_API_KEY,
      },
      body: JSON.stringify({
        tracking_number: number,
        carrier_code: carrierCode,
      }),
    });

    // Step 3: Get tracking info
    const getRes = await fetch(
      `https://api.trackingmore.com/v4/trackings/${carrierCode}/${number}`,
      {
        method: 'GET',
        headers: {
          'Tracking-Api-Key': process.env.TRACKINGMORE_API_KEY,
        },
      }
    );

    const result = await getRes.json();
    console.log('📦 Final tracking result:', result);

    if (!getRes.ok || result.meta?.code !== 200) {
      return res
        .status(getRes.status || 500)
        .json({ error: result.meta?.message || 'TrackingMore API Error' });
    }

    const tracking = result.data;
    if (!tracking?.tracking_number) {
      return res.status(404).json({ error: 'No tracking data found' });
    }

    res.status(200).json(tracking);
  } catch (error) {
    console.error('API ERROR:', error);
    res.status(500).json({ error: error.message || 'Unexpected error' });
  }
}
