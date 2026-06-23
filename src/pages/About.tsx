import { useReveal } from '../hooks/useReveal';
import styles from './About.module.css';

const TEAM = [
  { name: 'Management Team', role: 'Leadership', image: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Leasing Specialists', role: 'Client Relations', image: 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Operations', role: 'Building Operations', image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

export default function About() {
  const revealRef = useReveal();

  return (
    <div className={styles.page} ref={revealRef}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>About Aura</h1>
          <p className={styles.subtitle}>Manhattan luxury leasing, redefined</p>
        </div>
      </div>

      <div className="container">
        <section className={`${styles.story} reveal`}>
          <div className={styles.storyText}>
            <h2>Our Story</h2>
            <p>
              Aura New York is Manhattan's premier luxury leasing brokerage, managing over
              3,000 residential units across the city's most coveted neighborhoods. From the
              cobblestone streets of the West Village to the waterfront towers of the Financial
              District, we curate living experiences that match the ambitions of our clients.
            </p>
            <p>
              Founded with a singular vision — to elevate the leasing experience beyond
              transaction into transformation — Aura pairs deep market knowledge with
              white-glove service. Our team of specialists knows every building, every floor
              plan, and every neighborhood intimately, ensuring the perfect match every time.
            </p>
          </div>
          <div className={styles.storyImg}>
            <img
              src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Manhattan skyline"
              loading="lazy"
            />
          </div>
        </section>

        <section className={`${styles.values} reveal`}>
          <h2>What Sets Us Apart</h2>
          <div className={styles.valueGrid}>
            <div className={styles.value}>
              <h3>Local Expertise</h3>
              <p>Deep knowledge of every building and neighborhood we serve — not just listings, but lifestyles.</p>
            </div>
            <div className={styles.value}>
              <h3>White-Glove Service</h3>
              <p>From first inquiry to move-in day, a dedicated specialist guides you through every step.</p>
            </div>
            <div className={styles.value}>
              <h3>Exclusive Access</h3>
              <p>Priority availability, private showings, and preferred terms with our building partners.</p>
            </div>
          </div>
        </section>

        <section className={`${styles.team} reveal`}>
          <h2>Our Team</h2>
          <p className={styles.teamSub}>
            Our specialists bring years of Manhattan market expertise to every interaction.
          </p>
          <div className={styles.teamGrid}>
            {TEAM.map((m) => (
              <div key={m.name} className={styles.member}>
                <div className={styles.memberImg}>
                  <img src={m.image} alt={m.name} loading="lazy" />
                </div>
                <h4>{m.name}</h4>
                <span>{m.role}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
