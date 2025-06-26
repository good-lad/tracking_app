// pages/api/track.js
// Next.js API route to track a package using Ship24 API with automatic carrier detection

export default async function handler(req, res) {
  const { number } = req.query;
  const apiKey = process.env.SHIP24_API_KEY;

  // Check if tracking number is provided
  if (!number) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  // Check if API key is configured
  if (!apiKey) {
    console.error('SHIP24_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Call Ship24 tracking API
    const response = await fetch('https://api.ship24.com/public/v1/trackers/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ trackingNumber: number }),
    });

    const responseText = await response.text();

    // Attempt to parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Ship24 response:', parseError);
      console.error('Raw response:', responseText);
      return res.status(502).json({ error: 'Invalid response from Ship24 API' });
    }

    // Handle API error responses
    if (!response.ok) {
      console.error('Ship24 API returned error:', data);
      return res.status(response.status).json({
        error: data.message || 'Failed to fetch tracking information',
        details: data,
      });
    }

    // Validate tracking data presence
    if (!data?.data?.trackings || data.data.trackings.length === 0) {
      return res.status(404).json({ error: 'No tracking data found' });
    }

    // Return the first tracking info object
    const trackingInfo = data.data.trackings[0];
    return res.status(200).json(trackingInfo);

  } catch (error) {
    console.error('Unexpected error in tracking handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


