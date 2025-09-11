import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import CopyDelegation from '@/components/CopyDelegation';

export const dynamic = 'force-dynamic'; // всегда читать актуальный файл

// Твои стили (ровно как в примере)
const STYLE = `
:root {
  --bg: #0b0f14;
  --panel: #121826;
  --muted: #9aa4b2;
  --text: #e6edf3;
  --info: #319795;
  --warn: #d69e2e;
  --error: #e53e3e;
  --ok: #38a169;
  --card: #0f172a;
  --code: #0b1220;
  --border: #1f2a3a;
  --chip: #1c2433;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); font: 14px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji"; }

.log-container { max-width: 1100px; margin: 32px auto; padding: 0 16px 48px; }
header.log-header { margin-bottom: 18px; }
header.log-header h1 { margin: 0 0 6px; font-size: 24px; letter-spacing: .2px; }
header.log-header h2 { margin: 0; font-weight: 500; color: var(--muted); font-size: 14px; }

.block { background: var(--panel); border: 1px solid var(--border); border-radius: 14px; padding: 16px; margin-top: 16px; }
.block > .block-title { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: .6px; margin-bottom: 10px; }
.chip { background: var(--chip); border: 1px solid var(--border); padding: 2px 8px; border-radius: 999px; font-size: 12px; color: var(--muted); }

.log-content { display: grid; gap: 10px; }
.log-entry { display: grid; grid-template-columns: 170px 90px 1fr 200px; gap: 10px; align-items: start; background: var(--card); border: 1px solid var(--border); border-left-width: 6px; border-radius: 12px; padding: 12px; }
.log-entry .log-timestamp { color: var(--muted); white-space: nowrap; font-feature-settings: "tnum" 1; }
.log-entry .log-level { font-weight: 700; letter-spacing: .5px; }
.log-entry .log-message { white-space: pre-wrap; }
.log-entry .log-source { color: var(--muted); text-align: right; }
.log-entry.info { border-left-color: var(--info); }
.log-entry.warning { border-left-color: var(--warn); }
.log-entry.error { border-left-color: var(--error); }

/* Variables table */
.vars { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 12px; border: 1px solid var(--border); }
.vars th, .vars td { padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: top; }
.vars thead th { text-align: left; font-size: 12px; text-transform: uppercase; color: var(--muted); letter-spacing: .5px; background: #0e1624; }
.vars tbody tr:last-child td { border-bottom: none; }
.k { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; color: #93c5fd; }
.v { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; color: #e9f5ff; }

/* Activity sections */
details { background: var(--panel); border: 1px solid var(--border); border-radius: 14px; padding: 12px 14px; }
details + details { margin-top: 10px; }
details > summary { cursor: pointer; list-style: none; display: flex; align-items: center; gap: 10px; }
details > summary::-webkit-details-marker { display: none; }
.title { font-weight: 600; }
.subtitle { color: var(--muted); }

.codebox { position: relative; background: var(--code); border: 1px solid var(--border); border-radius: 12px; padding: 12px; margin-top: 10px; }
.codebox pre { margin: 0; overflow: auto; }
.copy-btn { position: absolute; top: 8px; right: 8px; font-size: 12px; background: #0f1a2c; color: var(--muted); border: 1px solid var(--border); padding: 6px 8px; border-radius: 8px; cursor: pointer; }
.copy-btn:hover { color: var(--text); }

.two-col { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0,1fr)); }
@media (max-width: 900px) { .log-entry { grid-template-columns: 130px 80px 1fr; } .log-entry .log-source { grid-column: 1 / -1; text-align: left; } .two-col { grid-template-columns: 1fr; } }

/* toolbar внутри codebox */
.codebox .toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}
.codebox .btn {
  font-size: 12px;
  background: #0f1a2c;
  color: var(--muted);
  border: 1px solid var(--border);
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
}
.codebox .btn:hover { color: var(--text); }

/* большой блок */
.codebox.big {
  padding-top: 40px; /* место под тулбар */
}
.codebox.big pre {
  max-height: 320px;
  overflow: auto;
  white-space: pre-wrap;     /* чтобы длинные строки переносились */
  word-break: break-word;
}
.codebox.big::after {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 48px;
  background: linear-gradient(to bottom, rgba(11,18,32,0), var(--code));
  pointer-events: none;
}

/* развернутый режим */
.codebox.big.expanded pre { max-height: none; }
.codebox.big.expanded::after { display: none; }

`;

function extractFragment(html: string) {
    // Если прислали целый документ — вытащим то, что внутри <body>…</body>
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) return bodyMatch[1];
    return html; // иначе считаем, что это и есть фрагмент
}

export default async function ReportPage({ params }: { params: { slug: string } }) {
    const filePath = path.join(process.cwd(), 'src', 'data', 'logs', `${params.slug}.html`);
    let raw = '';
    try {
        raw = await fs.readFile(filePath, 'utf8');
    } catch {
        notFound();
    }

    const fragment = extractFragment(raw);

    return (
        <div>
            {/* Глобально подмешиваем стили для этой страницы */}
            <style dangerouslySetInnerHTML={{ __html: STYLE }} />
            {/* Вставляем «сырой» HTML лога */}
            <main dangerouslySetInnerHTML={{ __html: fragment }} />
            {/* Делегатор для кнопок .copy-btn */}
            <CopyDelegation />
        </div>
    );
}
