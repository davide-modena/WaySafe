const NUMERI_EMERGENZA = [
  { nome: 'Numero unico di emergenza', numero: '112' },
  { nome: 'Polizia', numero: '113' },
  { nome: 'Emergenza sanitaria', numero: '118' }
];

function emergency(req, res) {
  const { lat, lng } = req.body;
  const posizione =
    lat !== undefined && lng !== undefined ? { lat: Number(lat), lng: Number(lng) } : null;

  res.json({
    posizione,
    numeri: NUMERI_EMERGENZA,
    timestamp: new Date().toISOString()
  });
}

module.exports = { emergency };
