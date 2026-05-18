function formatIndirizzo(d) {
  if (!d) return null;
  const a = d.address || {};
  const via = a.road || a.pedestrian || a.footway || a.path || a.neighbourhood;
  const civico = a.house_number;
  const citta = a.city || a.town || a.village || a.municipality;
  const parti = [];
  if (via) parti.push(civico ? `${via} ${civico}` : via);
  if (citta) parti.push(citta);
  return parti.length ? parti.join(', ') : d.display_name || null;
}

export async function reverseGeocode(lat, lng) {
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&zoom=18&addressdetails=1&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'it' } }
    );
    const d = await resp.json();
    return formatIndirizzo(d);
  } catch {
    return null;
  }
}
