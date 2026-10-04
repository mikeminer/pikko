// Tiny DOM helpers shared by the UI screens (no innerHTML: text always goes through text nodes).
import { audio } from '../audio/audio';

export const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: (Node | string | null | false)[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else e.setAttribute(k, v);
  }
  for (const c of children) if (c !== null && c !== false) e.append(typeof c === 'string' ? document.createTextNode(c) : c);
  return e;
}

export function button(label: string | Node[], cls: string, onClick: () => void, attrs: Record<string, string> = {}): HTMLButtonElement {
  const b = el('button', { class: cls, type: 'button', ...attrs });
  if (typeof label === 'string') b.textContent = label; else b.append(...label);
  b.addEventListener('click', () => { void audio.unlock(); onClick(); });
  return b;
}
