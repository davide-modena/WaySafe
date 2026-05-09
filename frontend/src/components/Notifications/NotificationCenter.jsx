import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import './NotificationCenter.css';

function NotificationCenter() {
  const { t, i18n } = useTranslation();

  function formatData(d) {
    return new Date(d).toLocaleString(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const [notifiche, setNotifiche] = useState([]);
  const [nonLette, setNonLette] = useState(0);
  const [aperto, setAperto] = useState(false);
  const [soloNonLette, setSoloNonLette] = useState(false);
  const contenitore = useRef(null);

  const carica = useCallback(() => {
    api
      .get('/notifications')
      .then((res) => {
        setNotifiche(res.data.notifiche);
        setNonLette(res.data.nonLette);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    carica();
    const id = setInterval(carica, 30000);
    return () => clearInterval(id);
  }, [carica]);

  useEffect(() => {
    function fuori(e) {
      if (contenitore.current && !contenitore.current.contains(e.target)) {
        setAperto(false);
      }
    }
    document.addEventListener('mousedown', fuori);
    return () => document.removeEventListener('mousedown', fuori);
  }, []);

  async function segnaLetta(id) {
    setNotifiche((prev) => prev.map((n) => (n._id === id ? { ...n, letta: true } : n)));
    setNonLette((prev) => Math.max(0, prev - 1));
    try {
      await api.patch(`/notifications/${id}`);
    } catch {}
  }

  async function segnaTutte() {
    setNotifiche((prev) => prev.map((n) => ({ ...n, letta: true })));
    setNonLette(0);
    try {
      await api.patch('/notifications/lette');
    } catch {}
  }

  const visibili = soloNonLette ? notifiche.filter((n) => !n.letta) : notifiche;

  return (
    <div className="notif-center" ref={contenitore}>
      <button
        type="button"
        className="notif-bell"
        onClick={() => setAperto((v) => !v)}
        aria-label={nonLette > 0 ? t('notifiche.labelNonLette', { count: nonLette }) : t('notifiche.label')}
        aria-expanded={aperto}
      >
        <span aria-hidden="true">🔔</span>
        {nonLette > 0 && (
          <span className="notif-badge" aria-hidden="true">{nonLette > 9 ? '9+' : nonLette}</span>
        )}
      </button>

      {aperto && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <strong>{t('notifiche.titolo')}</strong>
            <div className="notif-header-azioni">
              <button
                type="button"
                className={soloNonLette ? 'notif-filtro attivo' : 'notif-filtro'}
                onClick={() => setSoloNonLette((v) => !v)}
              >
                {soloNonLette ? t('notifiche.tutte') : t('notifiche.nonLette')}
              </button>
              {nonLette > 0 && (
                <button type="button" className="notif-filtro" onClick={segnaTutte}>
                  {t('notifiche.segnaLette')}
                </button>
              )}
            </div>
          </div>

          <ul className="notif-lista">
            {visibili.length === 0 && <li className="notif-vuoto">{t('notifiche.nessuna')}</li>}
            {visibili.map((n) => (
              <li
                key={n._id}
                className={n.letta ? 'notif-item' : 'notif-item non-letta'}
                onClick={() => !n.letta && segnaLetta(n._id)}
              >
                <div className="notif-item-top">
                  <span className="notif-titolo">{n.titolo}</span>
                  {!n.letta && <span className="notif-dot" />}
                </div>
                <p className="notif-messaggio">{n.messaggio}</p>
                <span className="notif-data">{formatData(n.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
