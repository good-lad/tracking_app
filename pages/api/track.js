function guessCarrier(trackingNumber) {
  if (trackingNumber.startsWith('YT')) return 'yanwen';
  if (/^1Z/.test(trackingNumber)) return 'ups';
  if (/^\d{10}$/.test(trackingNumber)) return 'dhl';
  if (/^R[A-Z]\d{9}AT$/.test(trackingNumber)) return 'postat';
  if (/^\d{13}$/.test(trackingNumber)) return 'parcelone';
  return 'yanwen';
}

export default async function handler(req, res) {
  const { number, carrier } = req.query;

  if (!number) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  try {
    const carrierCode = carrier || guessCarrier(number);

    // Step 1: Create the tracker (safe even if already created)
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

    // ✅ Step 2: Get tracking info using correct RESTful path
    const getRes = await fetch(`https://api.trackingmore.com/v4/trackings/${carrierCode}/${number}`, {
      method: 'GET',
      headers: {
        'Tracking-Api-Key': process.env.TRACKINGMORE_API_KEY,
      },
    });

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


