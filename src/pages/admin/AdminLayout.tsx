import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Settings, Image, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import styles from './Admin.module.css';

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>
          <span className={styles.logoText}>AURA</span>
          <span className={styles.logoDivider} />
          <span className={styles.logoSub}>NEW YORK</span>
        </div>
        <h2 className={styles.loginTitle}>Team Login</h2>
        <p className={styles.loginSub}>Sign in to access the admin panel</p>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.loginInput}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.loginInput}
          />
          {error && <p className={styles.loginError}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.loginBtn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return <div className={styles.loginPage}><p>Loading...</p></div>;
  if (!user) return <LoginForm />;

  return (
    <div className={styles.admin}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.logoText}>AURA</span>
          <span className={styles.badge}>Admin</span>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/admin" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/buildings" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
            <Building2 size={18} /> Buildings
          </NavLink>
          <NavLink to="/admin/photos" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
            <Image size={18} /> Photos
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
            <Settings size={18} /> Settings
          </NavLink>
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.userName}>{user.full_name}</span>
          <button onClick={logout} className={styles.logoutBtn}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
