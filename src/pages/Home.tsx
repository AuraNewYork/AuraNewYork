import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, MapPin, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../lib/settings';
import { useReveal } from '../hooks/useReveal';
import styles from './Home.module.css';

const DEFAULT_VIDEO = 'https://player.vimeo.com/progressive_redirect/playback/1010401569/rendition/1080p/file.mp4?loc=external&signature=ae74505170534c05ce9905798f3438c07e1019d74d19b8e1dedc426189ce995c';
const NEWSLETTER_IFRAME = 'https://ee2d230c.sibforms.com/serve/MUIFABT41IuH6QSRB4Jq923fAPTPXUf6nFH8DhHj4VjN7SYfZwT2PfVRJCfhFfEnpjEgh8Ni799NhjZmdgdnC9GNok9XfPZLqnyUuh6hw7viZdO4ARCJ6OHBtCh_7ucLTjmAYCbCj2mRxFIzIi1MKmkTjFjun5G9l0RHU2frTDgoXqIL1QctEWJi6wvCuA_LaX1sjtwX-DDjEiQArA==';

interface Building {
  id: string;
  name: string;
  neighborhood: string;
  hero_image_url: string | null;
  slug: string;
}

export default function Home() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const { getSetting } = useSettings();
  const revealRef = useReveal();
  const videoRef = useRef<HTMLVideoElement>(null);

  const heroVideo = (getSetting('hero_video_url') as string) || DEFAULT_VIDEO;

  useEffect(() => {
    supabase
      .from('site_buildings')
      .select('id, name, neighborhood, hero_image_url, slug')
      .eq('published', true)
      .order('display_order', { ascending: true })
      .limit(6)
      .then(({ data }) => {
        if (data) setBuildings(data);
      });
  }, []);

  return (
    <div ref={revealRef}>
      {/* Hero */}
      <section className={styles.hero}>
        <video
          ref={videoRef}
          className={styles.heroVideo}
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Manhattan Luxury<br />Leasing, Redefined
          </h1>
          <p className={styles.heroSub}>
            3,000+ premium units across New York's most coveted neighborhoods
          </p>
          <Link to="/availability" className={styles.heroCta}>
            Browse Availability <ArrowRight size={18} />
          </Link>
        </div>
        <div className={styles.heroScroll}>
          <div className={styles.scrollLine} />
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <div className="container">
          <div className={`${styles.statsGrid} reveal`}>
            <div className={styles.stat}>
              <span className={styles.statNum}>3,000+</span>
              <span className={styles.statLabel}>Premium Units</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>9</span>
              <span className={styles.statLabel}>Luxury Buildings</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>5</span>
              <span className={styles.statLabel}>Neighborhoods</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>24/7</span>
              <span className={styles.statLabel}>Concierge Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Buildings */}
      <section className={styles.featured}>
        <div className="container">
          <div className={`${styles.sectionHeader} reveal`}>
            <Building2 size={20} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Our Buildings</h2>
            <p className={styles.sectionSub}>
              Curated luxury residences in Manhattan's finest neighborhoods
            </p>
          </div>
          <div className={styles.buildingGrid}>
            {buildings.map((b, i) => (
              <Link
                key={b.id}
                to={`/buildings/${b.slug || b.id}`}
                className={`${styles.buildingCard} reveal reveal-delay-${(i % 4) + 1}`}
              >
                <div className={styles.buildingImg}>
                  <img
                    src={b.hero_image_url || `https://images.pexels.com/photos/${2462015 + i * 100}/pexels-photo-${2462015 + i * 100}.jpeg?auto=compress&cs=tinysrgb&w=600`}
                    alt={b.name}
                    loading="lazy"
                  />
                </div>
                <div className={styles.buildingInfo}>
                  <h3>{b.name}</h3>
                  <span className={styles.buildingHood}>
                    <MapPin size={13} /> {b.neighborhood}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className={`${styles.ctaRow} reveal`}>
            <Link to="/buildings" className={styles.secondaryCta}>
              View All Buildings <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className={styles.about}>
        <div className="container">
          <div className={`${styles.aboutInner} reveal`}>
            <div className={styles.aboutText}>
              <Sparkles size={20} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>The Aura Difference</h2>
              <p>
                We don't just lease apartments — we curate lifestyles. Our team of experts
                matches you with the perfect home in Manhattan's most desirable buildings,
                with white-glove service from first tour to move-in day.
              </p>
              <Link to="/about" className={styles.secondaryCta}>
                Learn More <ArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.aboutImg}>
              <img
                src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Luxury interior"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className="container">
          <div className={`${styles.newsletterInner} reveal`}>
            <h2 className={styles.sectionTitle}>The Auracle</h2>
            <p className={styles.sectionSub}>
              Manhattan's insider guide to luxury living — market insights, new listings, and neighborhood stories.
            </p>
            <div className={styles.iframeWrap}>
              <iframe
                src={NEWSLETTER_IFRAME}
                title="Auracle Newsletter Signup"
                style={{ width: '100%', minHeight: '320px', border: 'none' }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
