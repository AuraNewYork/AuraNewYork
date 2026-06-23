import { useState, useEffect } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { supabase, EDGE_FN_BASE } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import styles from './AdminPhotos.module.css';

interface PhotoRow {
  id: string;
  photo_url: string;
  caption: string | null;
  building_id?: string;
  bedroom_count?: number;
}

interface Building {
  id: string;
  name: string;
}

export default function AdminPhotos() {
  const { token } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [photoType, setPhotoType] = useState<'amenity' | 'stock' | 'unit'>('amenity');
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newBedCount, setNewBedCount] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.from('site_buildings').select('id, name').order('name').then(({ data }) => {
      if (data) setBuildings(data);
    });
  }, []);

  useEffect(() => {
    if (!selectedBuilding) { setPhotos([]); return; }
    const table = photoType === 'amenity' ? 'site_building_amenity_photos' :
                  photoType === 'stock' ? 'site_stock_photos' : 'site_unit_photos';

    supabase.from(table).select('*').eq('building_id', selectedBuilding).then(({ data }) => {
      if (data) setPhotos(data);
    });
  }, [selectedBuilding, photoType]);

  const handleAdd = async () => {
    if (!newUrl || !selectedBuilding) return;
    setUploading(true);
    const table = photoType === 'amenity' ? 'site_building_amenity_photos' :
                  photoType === 'stock' ? 'site_stock_photos' : 'site_unit_photos';

    const data: Record<string, unknown> = {
      building_id: selectedBuilding,
      photo_url: newUrl,
      caption: newCaption || null,
    };
    if (photoType === 'stock' && newBedCount) {
      data.bedroom_count = Number(newBedCount);
    }

    await fetch(`${EDGE_FN_BASE}/site-admin-write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'insert', table, data }),
    });

    setNewUrl('');
    setNewCaption('');
    setNewBedCount('');
    setUploading(false);

    supabase.from(table).select('*').eq('building_id', selectedBuilding).then(({ data: d }) => {
      if (d) setPhotos(d);
    });
  };

  const handleDelete = async (id: string) => {
    const table = photoType === 'amenity' ? 'site_building_amenity_photos' :
                  photoType === 'stock' ? 'site_stock_photos' : 'site_unit_photos';
    await fetch(`${EDGE_FN_BASE}/site-admin-write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'delete', table, id }),
    });
    setPhotos(photos.filter((p) => p.id !== id));
  };

  return (
    <div>
      <h1 className={styles.title}>Photos</h1>

      <div className={styles.controls}>
        <select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)} className={styles.select}>
          <option value="">Select Building</option>
          {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={photoType} onChange={(e) => setPhotoType(e.target.value as 'amenity' | 'stock' | 'unit')} className={styles.select}>
          <option value="amenity">Amenity Photos</option>
          <option value="stock">Stock Photos</option>
          <option value="unit">Unit Photos</option>
        </select>
      </div>

      {selectedBuilding && (
        <>
          <div className={styles.addForm}>
            <input
              type="url"
              placeholder="Photo URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Caption (optional)"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              className={styles.input}
            />
            {photoType === 'stock' && (
              <input
                type="number"
                placeholder="Bedroom count"
                value={newBedCount}
                onChange={(e) => setNewBedCount(e.target.value)}
                className={styles.inputSmall}
              />
            )}
            <button onClick={handleAdd} disabled={uploading || !newUrl} className={styles.addBtn}>
              <Upload size={14} /> Add
            </button>
          </div>

          <div className={styles.grid}>
            {photos.length === 0 && <p className={styles.empty}>No photos yet for this selection.</p>}
            {photos.map((p) => (
              <div key={p.id} className={styles.photoCard}>
                <img src={p.photo_url} alt={p.caption || ''} />
                <div className={styles.photoInfo}>
                  <span>{p.caption || 'No caption'}</span>
                  <button onClick={() => handleDelete(p.id)} className={styles.deleteBtn}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
