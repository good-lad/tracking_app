function guessCarrier(trackingNumber) {
  if (trackingNumber.startsWith('YT')) return 'yanwen';
  if (/^1Z/.test(trackingNumber)) return 'ups';
  if (/^\d{10}$/.test(trackingNumber)) return 'dhl';
  if (/^R[A-Z]\d{9}AT$/.test(trackingNumber)) return 'postat';
  if (/^\d{13}$/.test(trackingNumber)) return 'parcelone';
  return 'yanwen'; // fallback if nothing matches
}

export default async function handler(req, res) {
  const { number, carrier } = req.query;

  if (!number) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  try {
    const carrierCode = carrier || guessCarrier(number);

    const createRes = await fetch('https://api.trackingmore.com/v4/trackings', {
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

    const result = await createRes.json();
    console.log('TrackingMore response:', result);

    if (!createRes.ok || result.meta?.code !== 200) {
      return res
        .status(createRes.status || 500)
        .json({ error: result.meta?.message || 'TrackingMore API Error' });
    }

    res.status(200).json(result.data);
  } catch (error) {
    console.error('API ERROR:', error);
    res.status(500).json({ error: error.message || 'Unexpected error' });
  }
}
