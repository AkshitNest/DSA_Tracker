"use client";
import { useState, useEffect } from 'react';

export default function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!url) return;
    setLoading(true);
    setError(null);
    fetch(url)
      .then(async (res) => {
        const json = await res.json();
        if (!cancelled) {
          if (json.error) setError(json.error);
          else setData(json);
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Fetch error'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  return { data, loading, error };
}
