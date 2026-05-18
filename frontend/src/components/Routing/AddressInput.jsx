import { useState, useEffect, useRef } from 'react';

const TRENTO_VIEWBOX = '11.00,46.16,11.22,45.99';

function AddressInput({ placeholder, valore, onSelect }) {
  const [q, setQ] = useState(valore || '');
  const [risultati, setRisultati] = useState([]);
  const [aperto, setAperto] = useState(false);
  const timer = useRef(null);
  const saltaRicerca = useRef(false);
  const qRef = useRef(q);
  qRef.current = q;

  useEffect(() => {
    const v = valore || '';
    if (v !== qRef.current) {
      saltaRicerca.current = true;
      setQ(v);
      setRisultati([]);
      setAperto(false);
    }
  }, [valore]);

  useEffect(() => {
    if (saltaRicerca.current) {
      saltaRicerca.current = false;
      return undefined;
    }
    if (q.trim().length < 3) {
      setRisultati([]);
      return undefined;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=it&viewbox=${TRENTO_VIEWBOX}&bounded=1&q=${encodeURIComponent(q)}`,
        { headers: { 'Accept-Language': 'it' } }
      )
        .then((r) => r.json())
        .then((d) => {
          setRisultati(d);
          setAperto(true);
        })
        .catch(() => setRisultati([]));
    }, 400);
    return () => clearTimeout(timer.current);
  }, [q]);

  function scegli(item) {
    saltaRicerca.current = true;
    setQ(item.display_name);
    setAperto(false);
    setRisultati([]);
    onSelect({ label: item.display_name, lat: Number(item.lat), lng: Number(item.lon) });
  }

  return (
    <div className="address-input">
      <input
        value={q}
        placeholder={placeholder}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => risultati.length > 0 && setAperto(true)}
      />
      {aperto && risultati.length > 0 && (
        <ul className="address-suggestions">
          {risultati.map((item) => (
            <li key={item.place_id} onClick={() => scegli(item)}>
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AddressInput;
