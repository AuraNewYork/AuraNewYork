import { Building2, Maximize2, Wind, DollarSign } from 'lucide-react';
import type { UnitData } from '../pages/Availability';
import styles from './AvailabilityGrid.module.css';

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function bedLabel(bed: string) {
  if (bed === '0') return 'Studio';
  if (bed === 'Convertible') return 'Conv';
  return `${bed}BR`;
}

export default function AvailabilityGrid({ units }: { units: UnitData[] }) {
  return (
    <div className={styles.grid}>
      {units.map((u, i) => (
        <div key={`${u.building}-${u.unit}-${i}`} className={styles.card}>
          {u.tag && (
            <span className={`${styles.tag} ${u.tag === 'Best Value' ? styles.tagValue : styles.tagPremium}`}>
              {u.tag}
            </span>
          )}
          <div className={styles.price}>{formatPrice(u.net)}<span>/mo</span></div>
          <div className={styles.layout}>
            {bedLabel(u.bed)} / {u.bath}BA
          </div>
          <div className={styles.building}>
            <Building2 size={12} /> {u.building.split(' - ')[0]}
          </div>
          <div className={styles.meta}>
            {u.sqft && <span><Maximize2 size={11} /> {u.sqft} sf</span>}
            {u.exposure && <span><Wind size={11} /> {u.exposure}</span>}
            {u.concession && u.concession !== '0' && u.concession !== '' && (
              <span className={styles.concession}><DollarSign size={11} /> Concession</span>
            )}
          </div>
          {u.term && <div className={styles.term}>Term: {u.term} mo</div>}
          <div className={styles.unit}>Unit {u.unit}</div>
        </div>
      ))}
    </div>
  );
}
