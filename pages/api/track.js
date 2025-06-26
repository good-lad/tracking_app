const candidateCarriers = [
  'austria-post', // for Post AT
  'postnl',
  'yanwen',
  'dhl',
  'ups'
];

export default async function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  const apiKey = process.env.TRACKINGMORE_API_KEY;

  for (const carrierCode of candidateCarriers) {
    try {
      // Step 1: Create the tracker
      await fetch('https://api.trackingmore.com/v4/trackings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Tracking-Api-Key': apiKey,
        },
        body: JSON.stringify({
          tracking_number: number,
          carrier_code: carrierCode,
        }),
      });

      // Step 2: Get tracker info
      const getRes = await fetch(`https://api.trackingmore.com/v4/trackings/${carrierCode}/${number}`, {
        method: 'GET',
        headers: {
          'Tracking-Api-Key': apiKey,
        },
      });

      const result = await getRes.json();
      console.log(`📦 Tried ${carrierCode}:`, result);

      const tracking = result.data;
      if (getRes.ok && result.meta?.code === 200 && tracking?.tracking_number) {
        return res.status(200).json(tracking);
      }
    } catch (err) {
      console.error(`⚠️ Carrier ${carrierCode} failed`, err.message);
    }
  }

  return res.status(404).json({ error: 'No valid tracking information found for any carrier.' });
}

