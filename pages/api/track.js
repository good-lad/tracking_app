const SHIP24_API_KEY = process.env.SHIP24_API_KEY && process.env.SHIP24_API_KEY.trim();

function isParcelOneTrackingNumber(number) {
  return (
    typeof number === 'string' &&
    number.length === 13 &&
    (number.startsWith('40') || number.startsWith('10') || number.startsWith('11'))
  );
}

async function trackWithShip24(trackingNumber) {
  const response = await fetch('https://api.ship24.com/public/v1/trackers/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SHIP24_API_KEY}`,
    },
    body: JSON.stringify({ trackingNumber }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Invalid response from Ship24 API');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch tracking information from Ship24');
  }

  if (!data?.data?.trackings?.length) {
    throw new Error('No tracking data found on Ship24');
  }

  const tracking = data.data.trackings[0];

  // Extract courier code array
  let courierCodeArray = tracking.shipment?.courierCode || [];

  // Fallback: if shipment courierCode empty, try first event courierCode
  if (courierCodeArray.length === 0 && tracking.events && tracking.events.length > 0) {
    courierCodeArray = [tracking.events[0].courierCode || ''];
  }

  // Map courier code to friendly name
  const courierNameMap = {
    'at-post': 'Austrian Post',
    'parcel-one': 'PARCEL.ONE',
    // add more mappings here if needed
  };

  // Determine courier code string (comma separated if multiple)
  const courierCodeStr = courierCodeArray.filter(Boolean).join(', ') || 'N/A';

  // Determine courier display name
  let courier = courierNameMap[courierCodeStr] || courierCodeStr;

  // Override courier if tracking number matches PARCEL.ONE pattern
  if (isParcelOneTrackingNumber(trackingNumber)) {
    courier = 'PARCEL.ONE';
  }

  const events = (tracking.events || []).map((event) => {
    let location = 'Location not specified';
    if (event.location) {
      if (typeof event.location === 'string') {
        location = event.location;
      } else if (typeof event.location === 'object') {
        location =
          event.location.city || event.location.state || event.location.country || location;
      }
    }
    return {
      date: event.occurrenceDatetime || event.datetime || '',
      status: event.status || event.statusMilestone || 'Status update',
      location,
    };
  });

  return {
    trackingNumber:
      (tracking.tracker && tracking.tracker.trackingNumber) ||
      (tracking.shipment.trackingNumbers && tracking.shipment.trackingNumbers[0]?.tn) ||
      'N/A',
    courier,
    events,
  };
}

export default async function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  if (!SHIP24_API_KEY) {
    return res.status(500).json({ error: 'Ship24 API key not configured' });
  }

  try {
    const trackingData = await trackWithShip24(number);
    return res.status(200).json(trackingData);
  } catch (error) {
    console.error('Tracking error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
