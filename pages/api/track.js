// pages/api/track.js

export default async function handler(req, res) {
  const { number } = req.query;
  let apiKey = process.env.SHIP24_API_KEY;

  if (!number) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  if (!apiKey) {
    console.error('SHIP24_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  apiKey = apiKey.trim();

  try {
    const response = await fetch('https://api.ship24.com/public/v1/trackers/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ trackingNumber: number }),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Ship24 response:', parseError);
      console.error('Raw response:', responseText);
      return res.status(502).json({ error: 'Invalid response from Ship24 API' });
    }

    if (!response.ok) {
      console.error('Ship24 API returned error:', data);
      return res.status(response.status).json({
        error: data.message || 'Failed to fetch tracking information',
        details: data,
      });
    }

    if (!data?.data?.trackings?.length) {
      return res.status(404).json({ error: 'No tracking data found' });
    }

    // Extract and format the relevant info
    const tracking = data.data.trackings[0];
    const trackingNumber = tracking.tracker?.trackingNumber || 'N/A';
    const courier = Array.isArray(tracking.shipment?.courierCode) && tracking.shipment.courierCode.length > 0
      ? tracking.shipment.courierCode.join(', ')
      : 'N/A';
    const events = (tracking.events || []).map(event => ({
      date: event.occurrenceDatetime || event.datetime || '',
      status: event.status || '',
    }));

    return res.status(200).json({
      trackingNumber,
      courier,
      events,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


