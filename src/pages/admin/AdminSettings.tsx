import { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase, EDGE_FN_BASE } from '../../lib/supabase';
import styles from './AdminSettings.module.css';

const SETTINGS_KEYS = [
  'hero_video_url',
  'logo_light_url',
  'logo_dark_url',
  'contact_email',
  'availability_source',
  'csv_url_moinian',
  'csv_url_fresh',
];

const DEFAULT_VALUES: Record<string, string> = {
  hero_video_url: 'https://player.vimeo.com/progressive_redirect/playback/1010401569/rendition/1080p/file.mp4?loc=external&signature=ae74505170534c05ce9905798f3438c07e1019d74d19b8e1dedc426189ce995c',
  contact_email: 'hello@auranewyork.com',
  availability_source: 'sheets',
  csv_url_moinian: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2qDSRqh6cJzN5qFRZ9Yk8w3M9bGlLoYwT7ot_DnMBLfUTHpL8iMW5kOTp1iYcJv4_Hpu-2JTJNHhX/pub?gid=799951236&single=true&output=csv',
  csv_url_fresh: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPJ9T15cta8kerjm2kU5vo9ZpZ5ou39AudKfOURoNh3V8g6gqaRJPI-sVlJGBPu3YnDVFqnfEExx3N/pub?gid=799951236&single=true&output=csv',
};

export default function AdminSettings() {
  const { token } = useAuth();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', SETTINGS_KEYS)
      .then(({ data }) => {
        const map: Record<string, string> = { ...DEFAULT_VALUES };
        if (data) {
          data.forEach((row: { key: string; value: unknown }) => {
            map[row.key] = typeof row.value === 'string' ? row.value : JSON.stringify(row.value || '');
            if (map[row.key].startsWith('"') && map[row.key].endsWith('"')) {
              map[row.key] = map[row.key].slice(1, -1);
            }
          });
        }
        setValues(map);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    for (const key of SETTINGS_KEYS) {
      const val = values[key] || '';
      await fetch(`${EDGE_FN_BASE}/site-admin-write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'upsert',
          table: 'site_settings',
          data: { key, value: val, updated_at: new Date().toISOString() },
        }),
      });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Site Settings</h1>
        <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
          {saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> {saving ? 'Saving...' : 'Save All'}</>}
        </button>
      </div>

      <div className={styles.sections}>
        <section className={styles.section}>
          <h2>Branding</h2>
          <div className={styles.field}>
            <label>Hero Video URL</label>
            <input
              type="url"
              value={values.hero_video_url || ''}
              onChange={(e) => setValues({ ...values, hero_video_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className={styles.field}>
            <label>Logo (Light variant URL)</label>
            <input
              type="url"
              value={values.logo_light_url || ''}
              onChange={(e) => setValues({ ...values, logo_light_url: e.target.value })}
              placeholder="URL for white/light logo"
            />
          </div>
          <div className={styles.field}>
            <label>Logo (Dark variant URL)</label>
            <input
              type="url"
              value={values.logo_dark_url || ''}
              onChange={(e) => setValues({ ...values, logo_dark_url: e.target.value })}
              placeholder="URL for black/dark logo"
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Contact</h2>
          <div className={styles.field}>
            <label>Contact Form Recipient Email</label>
            <input
              type="email"
              value={values.contact_email || ''}
              onChange={(e) => setValues({ ...values, contact_email: e.target.value })}
              placeholder="hello@auranewyork.com"
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Availability Data Source</h2>
          <div className={styles.field}>
            <label>Source</label>
            <select
              value={values.availability_source || 'sheets'}
              onChange={(e) => setValues({ ...values, availability_source: e.target.value })}
            >
              <option value="sheets">Google Sheets (CSV)</option>
              <option value="supabase">Supabase (site_units table)</option>
            </select>
          </div>
          {values.availability_source !== 'supabase' && (
            <>
              <div className={styles.field}>
                <label>Moinian CSV URL</label>
                <input
                  type="url"
                  value={values.csv_url_moinian || ''}
                  onChange={(e) => setValues({ ...values, csv_url_moinian: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Fresh CSV URL</label>
                <input
                  type="url"
                  value={values.csv_url_fresh || ''}
                  onChange={(e) => setValues({ ...values, csv_url_fresh: e.target.value })}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
