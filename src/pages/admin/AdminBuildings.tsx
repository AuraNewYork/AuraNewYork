import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { supabase, EDGE_FN_BASE } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import styles from './AdminBuildings.module.css';

interface Building {
  id: string;
  name: string;
  slug: string;
  address: string;
  neighborhood: string;
  about_paragraph: string;
  schedule_tour_url: string;
  application_url: string;
  latitude: number | null;
  longitude: number | null;
  year_built: number | null;
  amenities: string;
  hero_image_url: string;
  published: boolean;
  display_order: number | null;
}

const EMPTY: Partial<Building> = {
  name: '', slug: '', address: '', neighborhood: '', about_paragraph: '',
  schedule_tour_url: '', application_url: '', latitude: null, longitude: null,
  year_built: null, amenities: '', hero_image_url: '', published: true, display_order: 0,
};

export default function AdminBuildings() {
  const { token } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [editing, setEditing] = useState<Partial<Building> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    supabase
      .from('site_buildings')
      .select('*')
      .order('display_order', { ascending: true })
      .then(({ data }) => { if (data) setBuildings(data); });
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing || !editing.name) return;
    setSaving(true);

    const payload = { ...editing };
    delete payload.id;

    const action = isNew ? 'insert' : 'update';
    await fetch(`${EDGE_FN_BASE}/site-admin-write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        action,
        table: 'site_buildings',
        id: isNew ? undefined : editing.id,
        data: { ...payload, updated_at: new Date().toISOString() },
      }),
    });

    setSaving(false);
    setEditing(null);
    setIsNew(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this building?')) return;
    await fetch(`${EDGE_FN_BASE}/site-admin-write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'delete', table: 'site_buildings', id }),
    });
    load();
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Buildings</h1>
        <button onClick={() => { setEditing({ ...EMPTY }); setIsNew(true); }} className={styles.addBtn}>
          <Plus size={16} /> Add Building
        </button>
      </div>

      {editing && (
        <div className={styles.editor}>
          <div className={styles.editorHeader}>
            <h2>{isNew ? 'New Building' : `Edit: ${editing.name}`}</h2>
            <button onClick={() => { setEditing(null); setIsNew(false); }} className={styles.closeBtn}><X size={18} /></button>
          </div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Name*</label>
              <input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Slug</label>
              <input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="auto-generated if blank" />
            </div>
            <div className={styles.field}>
              <label>Address</label>
              <input value={editing.address || ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Neighborhood</label>
              <input value={editing.neighborhood || ''} onChange={(e) => setEditing({ ...editing, neighborhood: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Latitude</label>
              <input type="number" step="any" value={editing.latitude ?? ''} onChange={(e) => setEditing({ ...editing, latitude: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className={styles.field}>
              <label>Longitude</label>
              <input type="number" step="any" value={editing.longitude ?? ''} onChange={(e) => setEditing({ ...editing, longitude: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className={styles.field}>
              <label>Year Built</label>
              <input type="number" value={editing.year_built ?? ''} onChange={(e) => setEditing({ ...editing, year_built: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className={styles.field}>
              <label>Display Order</label>
              <input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} />
            </div>
            <div className={styles.field}>
              <label>Tour URL</label>
              <input value={editing.schedule_tour_url || ''} onChange={(e) => setEditing({ ...editing, schedule_tour_url: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Application URL</label>
              <input value={editing.application_url || ''} onChange={(e) => setEditing({ ...editing, application_url: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Hero Image URL</label>
              <input value={editing.hero_image_url || ''} onChange={(e) => setEditing({ ...editing, hero_image_url: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Published</label>
              <select value={editing.published ? 'true' : 'false'} onChange={(e) => setEditing({ ...editing, published: e.target.value === 'true' })}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div className={styles.field} style={{ marginTop: '16px' }}>
            <label>About</label>
            <textarea rows={3} value={editing.about_paragraph || ''} onChange={(e) => setEditing({ ...editing, about_paragraph: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label>Amenities (comma-separated)</label>
            <input value={editing.amenities || ''} onChange={(e) => setEditing({ ...editing, amenities: e.target.value })} />
          </div>
          <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Building'}
          </button>
        </div>
      )}

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Name</span>
          <span>Neighborhood</span>
          <span>Published</span>
          <span>Actions</span>
        </div>
        {buildings.map((b) => (
          <div key={b.id} className={styles.tableRow}>
            <span className={styles.buildingName}>{b.name}</span>
            <span>{b.neighborhood}</span>
            <span>{b.published ? 'Yes' : 'No'}</span>
            <span className={styles.actions}>
              <button onClick={() => { setEditing(b); setIsNew(false); }} className={styles.editBtn}><Pencil size={14} /></button>
              <button onClick={() => handleDelete(b.id)} className={styles.deleteBtn}><Trash2 size={14} /></button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
