import styles from './SiteHeader.module.css';

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.title}>Report Log B24</div>
        <div className={styles.subtitle}>
          Проект для визуально приятных отчётов из Битрикс24
        </div>
      </div>
    </header>
  );
}
