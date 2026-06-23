import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoText}>AURA</span>
            <span className={styles.logoDivider} />
            <span className={styles.logoSub}>NEW YORK</span>
          </div>
          <p className={styles.tagline}>Manhattan luxury leasing, redefined.</p>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Explore</h4>
            <Link to="/availability">Availability</Link>
            <Link to="/buildings">Buildings</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Connect</h4>
            <a href="mailto:hello@auranewyork.com">hello@auranewyork.com</a>
            <a href="tel:9177275250">917.727.5250</a>
            <p>307 7th Ave #2403<br />New York, NY 10001</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} Aura New York. All rights reserved.</p>
        <Link to="/admin" className={styles.teamLogin}>Team Login</Link>
      </div>
    </footer>
  );
}
