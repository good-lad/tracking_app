// pages/api/track.js

export default async function handler(req, res) {
  const { number } = req.query;
  const apiKey = process.env.SHIP24_API_KEY && process.env.SHIP24_API_KEY.trim();

  if (!number) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

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
    } catch {
      return res.status(502).json({ error: 'Invalid response from tracking API' });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || 'Failed to fetch tracking information',
        details: data,
      });
    }

    if (!data?.data?.trackings?.length) {
      return res.status(404).json({ error: 'No tracking data found' });
    }

    const tracking = data.data.trackings[0];

    const trackingNumber =
      (tracking.tracker && tracking.tracker.trackingNumber) ||
      (tracking.shipment && tracking.shipment.trackingNumbers && tracking.shipment.trackingNumbers[0]?.tn) ||
      'N/A';

    const courier =
      (Array.isArray(tracking.shipment?.courierCode) && tracking.shipment.courierCode.length > 0
        ? tracking.shipment.courierCode.join(', ')
        : tracking.shipment?.courierName ||
          tracking.shipment?.carrierName ||
          'N/A');

    const events = (tracking.events || []).map(event => {
      let location = 'Location not specified';
      if (event.location) {
        if (typeof event.location === 'string') {
          location = event.location;
        } else if (typeof event.location === 'object') {
          location = event.location.city || event.location.state || event.location.country || location;
        }
      }
      return {
        date: event.occurrenceDatetime || event.datetime || '',
        status: event.status || event.statusMilestone || 'Status update',
        location,
      };
    });

    return res.status(200).json({
      trackingNumber,
      courier,
      events,
    });
  } catch (error) {
    console.error('Tracking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
