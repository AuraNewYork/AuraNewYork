import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './BuildingDetail.module.css';

interface Building {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  about_paragraph: string | null;
  schedule_tour_url: string | null;
  application_url: string | null;
  year_built: number | null;
  amenities: string | null;
  hero_image_url: string | null;
}

interface Photo {
  id: string;
  photo_url: string;
  caption: string | null;
}

export default function BuildingDetail() {
  const { slug } = useParams();
  const [building, setBuilding] = useState<Building | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchBuilding = async () => {
      let query = supabase.from('site_buildings').select('*');
      const { data } = await query.or(`slug.eq.${slug},id.eq.${slug}`).maybeSingle();

      if (data) {
        setBuilding(data);
        const { data: photoData } = await supabase
          .from('site_building_amenity_photos')
          .select('id, photo_url, caption')
          .eq('building_id', data.id);
        if (photoData) setPhotos(photoData);
      }
      setLoading(false);
    };

    fetchBuilding();
  }, [slug]);

  if (loading) return <div className={styles.page}><div className="container"><p className={styles.loading}>Loading...</p></div></div>;
  if (!building) return <div className={styles.page}><div className="container"><p className={styles.loading}>Building not found.</p></div></div>;

  const amenitiesList = building.amenities ? building.amenities.split(',').map((a) => a.trim()).filter(Boolean) : [];

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <img
          src={building.hero_image_url || 'https://images.pexels.com/photos/2462015/pexels-photo-2462015.jpeg?auto=compress&cs=tinysrgb&w=1200'}
          alt={building.name}
        />
        <div className={styles.heroOverlay}>
          <div className="container">
            <h1 className={styles.heroTitle}>{building.name}</h1>
            <p className={styles.heroAddress}>
              <MapPin size={16} /> {building.address} &middot; {building.neighborhood}
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.content}>
          <div className={styles.main}>
            {building.about_paragraph && (
              <section className={styles.section}>
                <h2>About</h2>
                <p>{building.about_paragraph}</p>
              </section>
            )}

            {amenitiesList.length > 0 && (
              <section className={styles.section}>
                <h2>Amenities</h2>
                <div className={styles.amenities}>
                  {amenitiesList.map((a) => (
                    <span key={a} className={styles.amenity}>{a}</span>
                  ))}
                </div>
              </section>
            )}

            {photos.length > 0 && (
              <section className={styles.section}>
                <h2>Photos</h2>
                <div className={styles.photoGrid}>
                  {photos.map((p) => (
                    <div key={p.id} className={styles.photo}>
                      <img src={p.photo_url} alt={p.caption || building.name} loading="lazy" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.card}>
              {building.year_built && (
                <div className={styles.detail}>
                  <Calendar size={16} />
                  <span>Built in {building.year_built}</span>
                </div>
              )}
              <div className={styles.detail}>
                <MapPin size={16} />
                <span>{building.neighborhood}</span>
              </div>

              <div className={styles.actions}>
                {building.schedule_tour_url && (
                  <a href={building.schedule_tour_url.startsWith('http') ? building.schedule_tour_url : `https://${building.schedule_tour_url}`} target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
                    Schedule Tour <ExternalLink size={14} />
                  </a>
                )}
                {building.application_url && (
                  <a href={building.application_url.startsWith('http') ? building.application_url : `https://${building.application_url}`} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>
                    Apply Now <ExternalLink size={14} />
                  </a>
                )}
                <Link to="/availability" className={styles.tertiaryBtn}>
                  View Available Units
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
