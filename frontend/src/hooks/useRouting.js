import { useState, useCallback } from 'react';
import api from '../services/api';

export default function useRouting() {
  const [percorsi, setPercorsi] = useState([]);
  const [selezionato, setSelezionato] = useState(0);
  const [stato, setStato] = useState('idle');

  const calcola = useCallback(async (partenza, destinazione) => {
    if (!partenza || !destinazione) return;
    setStato('loading');

    const body = {
      start: { lat: partenza.lat, lng: partenza.lng },
      end: { lat: destinazione.lat, lng: destinazione.lng }
    };

    try {
      const [sicuro, bilanciato] = await Promise.all([
        api.post('/routes/safest', body),
        api.post('/routes/balanced', body)
      ]);
      setPercorsi([
        { tipo: 'safest', ...sicuro.data.route },
        { tipo: 'balanced', ...bilanciato.data.route }
      ]);
      setSelezionato(0);
      setStato('ok');
    } catch {
      setStato('error');
    }
  }, []);

  const reset = useCallback(() => {
    setPercorsi([]);
    setStato('idle');
  }, []);

  return { percorsi, selezionato, stato, calcola, seleziona: setSelezionato, reset };
}
