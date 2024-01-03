const deg2rad = (deg) => deg * (Math.PI / 180);
const calculateDistance = (location1, location2) => {
  // Simplified calculation using Haversine formula
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(location2.latitude - location1.latitude);
  const dLon = deg2rad(location2.longitude - location1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(location1.latitude)) *
      Math.cos(deg2rad(location2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1000; // Convert to meters

  return distance;
};

export { calculateDistance };
