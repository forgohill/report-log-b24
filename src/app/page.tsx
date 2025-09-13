import SiteHeader from '@/components/SiteHeader';
import ReportModule from '@/components/ReportModule';

export default function Home() {
  return (
    <div>
      <SiteHeader />
      <main>
        {/* подставь свой файл: src/data/logs/demo.html */}
        {/* можно менять slug, напр.: <ReportModule slug="result-96814" /> */}
        {/* @ts-expect-error Async Server Component */}
        <ReportModule slug="demo" />
      </main>
      <footer style={{ padding: '16px 24px', color: '#9aa4b2' }}>
        © {new Date().getFullYear()} Report Log B24
      </footer>
    </div>
  );
}
