'use client';
import { useEffect } from 'react';
import JSON5 from 'json5';
import { jsonrepair } from 'jsonrepair';

function quoteBitrixPlaceholders(src: string) {
    // Оборачиваем {=...} в строки, чтобы парсер не спотыкался
    return src.replace(/(\{=[^}]+\})/g, '"$1"');
}

function tryFormat(text: string): string {
    const prepped = quoteBitrixPlaceholders(text);

    // 1) пробуем починить «почти JSON»
    let repaired = prepped;
    try { repaired = jsonrepair(prepped); } catch { }

    // 2) пробуем строгий JSON
    try { return JSON.stringify(JSON.parse(repaired), null, 2); } catch { }

    // 3) пробуем JSON5 (разрешает безкавыч. ключи и т. п.)
    try { return JSON.stringify(JSON5.parse(repaired), null, 2); } catch { }

    // Не смогли — возвращаем оригинал
    return text;
}

export default function CopyDelegation() {
    useEffect(() => {
        // Автоформат всех <pre data-format="auto">
        document.querySelectorAll<HTMLPreElement>('pre[data-format="auto"]').forEach((pre) => {
            const code = pre.querySelector('code');
            const raw = (code?.innerText ?? pre.innerText).trim();
            const pretty = tryFormat(raw);
            if (pretty !== raw) {
                if (code) code.textContent = pretty; else pre.textContent = pretty;
            }
        });

        function onClick(e: MouseEvent) {
            const el = e.target as HTMLElement | null;
            if (!el) return;

            // Копирование
            const copyBtn = el.closest('.copy-btn') as HTMLElement | null;
            if (copyBtn) {
                const id = copyBtn.getAttribute('data-copy')!;
                const pre = document.getElementById(id)!;
                const text = (pre as HTMLElement).innerText;
                navigator.clipboard.writeText(text).then(() => {
                    const old = copyBtn.textContent;
                    copyBtn.textContent = 'Скопировано!';
                    setTimeout(() => { if (old !== null) copyBtn.textContent = old; }, 1200);
                });
                return;
            }

            // Развернуть/свернуть
            const toggleBtn = el.closest('.toggle-btn') as HTMLElement | null;
            if (toggleBtn) {
                const id = toggleBtn.getAttribute('data-target')!;
                const pre = document.getElementById(id)!;
                const box = pre.closest('.codebox')!;
                const expanded = box.classList.toggle('expanded');
                toggleBtn.textContent = expanded ? 'Свернуть' : 'Развернуть';
                return;
            }

            // Форматировать по кнопке (повторно)
            const fmtBtn = el.closest('.format-btn') as HTMLElement | null;
            if (fmtBtn) {
                const id = fmtBtn.getAttribute('data-target')!;
                const pre = document.getElementById(id)!;
                const code = pre.querySelector('code');
                const raw = (code?.innerText ?? pre.innerText).trim();
                const pretty = tryFormat(raw);
                if (pretty !== raw) {
                    if (code) code.textContent = pretty; else pre.textContent = pretty;
                    fmtBtn.textContent = 'Отформатировано';
                    setTimeout(() => (fmtBtn.textContent = 'Форматировать'), 1200);
                }
                return;
            }

            // Скачать
            const downloadBtn = el.closest('.download-btn') as HTMLElement | null;
            if (downloadBtn) {
                const id = downloadBtn.getAttribute('data-source')!;
                const pre = document.getElementById(id)!;
                const text = (pre as HTMLElement).innerText;
                const filename = downloadBtn.getAttribute('data-name') || 'result.json';
                const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = filename; document.body.appendChild(a);
                a.click(); a.remove(); URL.revokeObjectURL(url);
                return;
            }
        }

        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, []);

    return null;
}
