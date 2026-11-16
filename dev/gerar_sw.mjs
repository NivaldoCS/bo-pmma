// Gera sw.js com a lista EXATA de arquivos do aplicativo (e modelos limpos) e
// uma versão baseada no conteúdo. Rodar após qualquer alteração:
//   node dev/gerar_sw.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const incluir = ['index.html', 'manifest.webmanifest', 'css', 'js', 'vendor', 'templates', 'icons'];
const ignorar = (p) => p.endsWith('.map') || p.endsWith('.md') || p.endsWith('campos.json');

function listar(p) {
  const abs = join(raiz, p);
  if (statSync(abs).isDirectory()) return readdirSync(abs).flatMap((f) => listar(join(p, f)));
  return ignorar(p) ? [] : [p.split('\\').join('/')];
}
const arquivos = incluir.flatMap(listar).sort();
const h = createHash('sha256');
for (const a of arquivos) { h.update(a); h.update(readFileSync(join(raiz, a))); }
const versao = h.digest('hex').slice(0, 10);

const sw = `// GERADO por dev/gerar_sw.mjs — não editar à mão.
// Cache somente dos arquivos do aplicativo e dos modelos limpos.
// Nenhum dado de ocorrência passa por aqui: os PDFs são gerados na memória.
const VERSAO = '${versao}';
const CACHE = 'pmma-bo-' + VERSAO;
const ARQUIVOS = ${JSON.stringify(['./', ...arquivos.map((a) => `./${a}`)], null, 2)};

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS.map((u) => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('pmma-bo-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', async (ev) => {
  const d = ev.data || {};
  if (d.tipo === 'ATIVAR') { self.skipWaiting(); return; }
  if (d.tipo === 'STATUS') {
    const c = await caches.open(CACHE);
    let presentes = 0;
    for (const u of ARQUIVOS) if (await c.match(u)) presentes++;
    ev.source && ev.source.postMessage({ tipo: 'STATUS', versao: VERSAO, presentes, total: ARQUIVOS.length, completo: presentes === ARQUIVOS.length });
  }
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // nada externo é interceptado nem guardado
  if (req.mode === 'navigate') {
    ev.respondWith(caches.match('./index.html').then((r) => r || fetch(req)));
    return;
  }
  // somente arquivos do aplicativo; nunca grava respostas novas no cache
  ev.respondWith(caches.match(req, { ignoreSearch: true }).then((r) => r || fetch(req)));
});
`;
writeFileSync(join(raiz, 'sw.js'), sw);
console.log(`sw.js gerado: versão ${versao}, ${arquivos.length + 1} arquivos`);
