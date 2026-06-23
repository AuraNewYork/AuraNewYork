import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const showLight = isHome && !scrolled && !menuOpen;

  return (
    <header className={`${styles.header} ${scrolled || !isHome ? styles.solid : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={`${styles.logoText} ${showLight ? styles.logoLight : styles.logoDark}`}>
            AURA
          </span>
          <span className={`${styles.logoDivider} ${showLight ? styles.dividerLight : styles.dividerDark}`} />
          <span className={`${styles.logoSub} ${showLight ? styles.logoLight : styles.logoDark}`}>
            NEW YORK
          </span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <Link to="/availability" className={styles.navLink}>Availability</Link>
          <Link to="/buildings" className={styles.navLink}>Buildings</Link>
          <Link to="/about" className={styles.navLink}>About</Link>
          <Link to="/contact" className={styles.navLink}>Contact</Link>
        </nav>

        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
