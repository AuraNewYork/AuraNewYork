import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useReveal } from '../hooks/useReveal';
import styles from './Buildings.module.css';

interface Building {
  id: string;
  name: string;
  slug: string;
  address: string;
  neighborhood: string;
  hero_image_url: string | null;
  about_paragraph: string | null;
}

const STOCK_IMAGES = [
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2462015/pexels-photo-2462015.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export default function Buildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const revealRef = useReveal();

  useEffect(() => {
    supabase
      .from('site_buildings')
      .select('id, name, slug, address, neighborhood, hero_image_url, about_paragraph')
      .eq('published', true)
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        if (data) setBuildings(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.page} ref={revealRef}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Our Buildings</h1>
          <p className={styles.subtitle}>Luxury residences across Manhattan's finest neighborhoods</p>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <p className={styles.loading}>Loading buildings...</p>
        ) : (
          <div className={styles.grid}>
            {buildings.map((b, i) => (
              <Link
                key={b.id}
                to={`/buildings/${b.slug || b.id}`}
                className={`${styles.card} reveal reveal-delay-${(i % 4) + 1}`}
              >
                <div className={styles.imgWrap}>
                  <img
                    src={b.hero_image_url || STOCK_IMAGES[i % STOCK_IMAGES.length]}
                    alt={b.name}
                    loading="lazy"
                  />
                  <div className={styles.imgOverlay}>
                    <span className={styles.hood}><MapPin size={13} /> {b.neighborhood}</span>
                  </div>
                </div>
                <div className={styles.info}>
                  <h3>{b.name}</h3>
                  {b.address && <p className={styles.address}>{b.address}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
