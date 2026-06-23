import { useAuth } from '../../lib/auth';
import { Link } from 'react-router-dom';
import { Building2, Settings, Image } from 'lucide-react';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className={styles.title}>Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}</h1>
      <p className={styles.sub}>Manage your Aura New York website content.</p>

      <div className={styles.cards}>
        <Link to="/admin/buildings" className={styles.card}>
          <Building2 size={24} />
          <h3>Buildings</h3>
          <p>Manage building listings, photos, and details</p>
        </Link>
        <Link to="/admin/photos" className={styles.card}>
          <Image size={24} />
          <h3>Photos</h3>
          <p>Upload and organize building & unit photos</p>
        </Link>
        <Link to="/admin/settings" className={styles.card}>
          <Settings size={24} />
          <h3>Settings</h3>
          <p>Hero video, logos, data sources, and contact info</p>
        </Link>
      </div>
    </div>
  );
}
