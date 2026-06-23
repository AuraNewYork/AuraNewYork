import { useState } from 'react';
import { Send, Phone, Mail, MapPin } from 'lucide-react';
import { EDGE_FN_BASE } from '../lib/supabase';
import { useSettings } from '../lib/settings';
import styles from './Contact.module.css';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { getSetting } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');

    const recipient = (getSetting('contact_email') as string) || 'hello@auranewyork.com';

    try {
      const res = await fetch(`${EDGE_FN_BASE}/site-send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          from: 'hello@auranewyork.com',
          subject: `Contact Form: ${name}`,
          name,
          email,
          phone,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send message');
      } else {
        setSent(true);
      }
    } catch {
      setError('Network error — please try again');
    }
    setSending(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>We'd love to hear from you</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.grid}>
          <div className={styles.info}>
            <h2>Get in Touch</h2>
            <p>
              Whether you're looking for your next home or have questions about our buildings,
              our team is here to help.
            </p>
            <div className={styles.contacts}>
              <div className={styles.contactItem}>
                <Mail size={18} />
                <a href="mailto:hello@auranewyork.com">hello@auranewyork.com</a>
              </div>
              <div className={styles.contactItem}>
                <Phone size={18} />
                <a href="tel:9177275250">917.727.5250</a>
              </div>
              <div className={styles.contactItem}>
                <MapPin size={18} />
                <span>307 7th Ave #2403<br />New York, NY 10001</span>
              </div>
            </div>
          </div>

          <div className={styles.formWrap}>
            {sent ? (
              <div className={styles.success}>
                <h3>Message Sent</h3>
                <p>Thank you for reaching out. Our team will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.row}>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={styles.input}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.input}
                />
                <textarea
                  placeholder="How can we help?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className={styles.textarea}
                />
                {error && <p className={styles.error}>{error}</p>}
                <button type="submit" disabled={sending} className={styles.submitBtn}>
                  {sending ? 'Sending...' : 'Send Message'} <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
