import { Building2 } from 'lucide-react';
import type { UnitData } from '../pages/Availability';
import styles from './AvailabilityList.module.css';

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function bedLabel(bed: string) {
  if (bed === '0') return 'Studio';
  if (bed === 'Convertible') return 'Conv';
  return `${bed}BR`;
}

export default function AvailabilityList({ units }: { units: UnitData[] }) {
  return (
    <div className={styles.list}>
      <div className={styles.headerRow}>
        <span className={styles.colPrice}>Net Rent</span>
        <span className={styles.colLayout}>Layout</span>
        <span className={styles.colBuilding}>Building</span>
        <span className={styles.colUnit}>Unit</span>
        <span className={styles.colSqft}>Sqft</span>
        <span className={styles.colExposure}>Exp</span>
        <span className={styles.colTerm}>Term</span>
        <span className={styles.colTag}>Tag</span>
      </div>
      {units.map((u, i) => (
        <div key={`${u.building}-${u.unit}-${i}`} className={styles.row}>
          <span className={styles.colPrice}>{formatPrice(u.net)}</span>
          <span className={styles.colLayout}>{bedLabel(u.bed)}/{u.bath}BA</span>
          <span className={styles.colBuilding}>
            <Building2 size={12} /> {u.building.split(' - ')[0]}
          </span>
          <span className={styles.colUnit}>{u.unit}</span>
          <span className={styles.colSqft}>{u.sqft || '—'}</span>
          <span className={styles.colExposure}>{u.exposure || '—'}</span>
          <span className={styles.colTerm}>{u.term ? `${u.term}mo` : '—'}</span>
          <span className={styles.colTag}>
            {u.tag && (
              <span className={`${styles.tag} ${u.tag === 'Best Value' ? styles.tagValue : styles.tagPremium}`}>
                {u.tag}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
