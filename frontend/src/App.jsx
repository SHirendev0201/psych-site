import { useEffect, useState } from 'react';

export default function App() {
  const [apiStatus, setApiStatus] = useState('Шалгаж байна…');

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${apiUrl}/api/health`)
      .then((response) => {
        if (!response.ok) throw new Error('API эсвэл database холбогдсонгүй');
        return response.json();
      })
      .then((data) => setApiStatus(data.database === 'connected' ? 'Холбогдлоо' : 'Холболтгүй'))
      .catch(() => setApiStatus('API холболтгүй'));
  }, []);

  return (
    <main className="card">
      <p className="eyebrow">PSYCH-SITE</p>
      <h1>Сэтгэл зүйн сайт</h1>
      <p>Төслийн эхний хувилбар бэлэн боллоо.</p>
      <p className="status">Backend / MySQL: <strong>{apiStatus}</strong></p>
    </main>
  );
}
