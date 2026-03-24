import { useState, useEffect, useRef } from 'react';

function AddressInput({ placeholder, onSelect }) {
  const [q, setQ] = useState('');
  const [risultati, setRisultati] = useState([]);
  const [aperto, setAperto] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (q.trim().length < 3) {
      setRisultati([]);
      return undefined;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=it&q=${encodeURIComponent(q)}`,
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
