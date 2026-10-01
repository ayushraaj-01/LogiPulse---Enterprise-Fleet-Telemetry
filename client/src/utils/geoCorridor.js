/**
 * Generates smooth, realistic road corridor waypoints between origin & destination.
 * Works dynamically for any geographic coordinates across the globe.
 */
export const buildHighwayCorridor = (origin, destination, count = 12) => {
  const oLat = Number(origin?.latitude);
  const oLng = Number(origin?.longitude);
  const dLat = Number(destination?.latitude);
  const dLng = Number(destination?.longitude);

  if (!Number.isFinite(oLat) || !Number.isFinite(oLng) || !Number.isFinite(dLat) || !Number.isFinite(dLng)) {
    return [];
  }

  if (Math.abs(oLat - dLat) < 0.0001 && Math.abs(oLng - dLng) < 0.0001) {
    return [[oLat, oLng]];
  }

  const dX = dLat - oLat;
  const dY = dLng - oLng;
  // Natural lateral curvature along the transit corridor
  const perpX = -dY * 0.055;
  const perpY = dX * 0.055;

  const points = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const curve = Math.sin(t * Math.PI);
    const wave = Math.sin(t * Math.PI * 2.5) * 0.012;
    const lat = oLat + dX * t + (perpX + wave * dX) * curve;
    const lng = oLng + dY * t + (perpY + wave * dY) * curve;
    points.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
  }

  points[0] = [oLat, oLng];
  points[points.length - 1] = [dLat, dLng];
  return points;
};
