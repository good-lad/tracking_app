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

  // Trim whitespace/newlines from the API key to avoid hidden characters
  apiKey = apiKey.trim();

  // Debug: Log length and prefix of API key (never log full key)
  console.log(`Loaded API key with length ${apiKey.length} and prefix "${apiKey.slice(0,5)}"`);

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

    return res.status(200).json(data.data.trackings[0]);
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


