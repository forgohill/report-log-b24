// src/components/ReportModule.tsx
import fs from 'fs/promises';
import path from 'path';
import CopyDelegation from '@/components/CopyDelegation'; // ← подключили

function extractFragment(html: string) {
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return m ? m[1] : html;
}

export default async function ReportModule({ slug = 'demo' }: { slug?: string }) {
  const filePath = path.join(process.cwd(), 'src', 'data', 'logs', `${slug}.html`);
  const scopeId = `report-${slug}`; // уникальный id контейнера

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const fragment = extractFragment(raw);

    return (
      <section id={scopeId} className="reportScope">
        <main dangerouslySetInnerHTML={{ __html: fragment }} />
        {/* Делегатор кнопок и автоформат — ограничим областью отчёта */}
        <CopyDelegation rootSelector={`#${scopeId}`} />
      </section>
    );
  } catch {
    return (
      <section id={scopeId} className="reportScope">
        <div className="report-empty">
          Файл <b>{slug}.html</b> не найден в <code>src/data/logs</code>.
        </div>
        <CopyDelegation rootSelector={`#${scopeId}`} />
      </section>
    );
  }
}
