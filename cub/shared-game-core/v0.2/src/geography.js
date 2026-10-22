const R = 6378137;
export function normaliseLongitude(lon) {
  if (!Number.isFinite(lon)) throw Error('Bad longitude');
  return ((lon + 180) % 360 + 360) % 360 - 180;
}
export function lonLatToWebMercator(lon, lat) {
  if (![lon,lat].every(Number.isFinite) || lat > 85.05112878 || lat < -85.05112878)
    throw Error('Coordinate outside Web Mercator extent');
  const longitude = normaliseLongitude(lon) * Math.PI / 180;
  const latitude = lat * Math.PI / 180;
  return { x: R * longitude, y: R * Math.log(Math.tan(Math.PI / 4 + latitude / 2)) };
}
export function webMercatorToLonLat(x, y) {
  if (![x,y].every(Number.isFinite)) throw Error('Invalid planar coordinates');
  return { lon: normaliseLongitude(x / R * 180 / Math.PI), lat: (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * 180 / Math.PI };
}
/** Geographic distance in kilometres; ignores slope and sea/land crossings. */
export function haversineKm(a, b) {
  if (![a.lon,a.lat,b.lon,b.lat].every(Number.isFinite)) throw Error('Invalid geographic point');
  const dLat=(b.lat-a.lat)*Math.PI/180, dLon=(b.lon-a.lon)*Math.PI/180;
  const la=a.lat*Math.PI/180,lb=b.lat*Math.PI/180;
  const s=Math.sin(dLat/2)**2+Math.cos(la)*Math.cos(lb)*Math.sin(dLon/2)**2;
  return 6371.0088*2*Math.asin(Math.min(1,Math.sqrt(s)));
}
/** Canonical historical coordinates, independent of artistic map view. */
export function checkHistoricalPlace(place) {
  const problems=[];
  if(!place?.id || !place.name)problems.push('missing stable place identity');
  if(!Number.isFinite(place?.lon)||!Number.isFinite(place?.lat))problems.push('missing coordinates');
  if(!place?.validFromBCE && place?.validFromBCE!==0)problems.push('missing earliest BCE boundary');
  if(!place?.provenance?.url)problems.push('no evidence URL');
  if(!['verified','reconstruction','gameplay'].includes(place?.confidence))problems.push('missing evidence-state label');
  return problems;
}