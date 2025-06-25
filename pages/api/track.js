// track.js

/**
 * Track a package by its tracking number.
 * Automatically relies on backend for carrier detection.
 * 
 * @param {string} trackingNumber - The parcel tracking number.
 * @returns {Promise<object|null>} - Tracking data or null if error.
 */
async function trackPackage(trackingNumber) {
  if (!trackingNumber) {
    alert('Please enter a tracking number');
    return null;
  }

  try {
    const response = await fetch(`/api/track?number=${encodeURIComponent(trackingNumber)}`);

    if (!response.ok) {
      const errorData = await response.json();
      alert('Error: ' + (errorData.error || 'Failed to get tracking info'));
      return null;
    }

    const trackingData = await response.json();

    console.log('Tracking data:', trackingData);

    // TODO: Replace this with your UI update logic
    // e.g., renderTrackingInfo(trackingData);

    return trackingData;

  } catch (error) {
    console.error('Fetch error:', error);
    alert('Unexpected error occurred');
    return null;
  }
}

// Example usage:
// trackPackage('YT1234567890');
