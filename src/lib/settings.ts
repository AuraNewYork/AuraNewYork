import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value');
    if (data) {
      const map: Record<string, unknown> = {};
      data.forEach((row: { key: string; value: unknown }) => {
        map[row.key] = row.value;
      });
      setSettings(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = (key: string, fallback?: unknown) => {
    return settings[key] ?? fallback;
  };

  return { settings, loading, getSetting, refetch: fetchSettings };
}
