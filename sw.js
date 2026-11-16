// GERADO por dev/gerar_sw.mjs — não editar à mão.
// Cache somente dos arquivos do aplicativo e dos modelos limpos.
// Nenhum dado de ocorrência passa por aqui: os PDFs são gerados na memória.
const VERSAO = '60f3c5bee6';
const CACHE = 'pmma-bo-' + VERSAO;
const ARQUIVOS = [
  "./",
  "./css/app.css",
  "./icons/icone-192.png",
  "./icons/icone-512.png",
  "./index.html",
  "./js/app.js",
  "./js/estado.js",
  "./js/helvetica.js",
  "./js/importador.js",
  "./js/layout.js",
  "./js/mascaras.js",
  "./js/opcoes.js",
  "./js/pdf/campos-modelo.js",
  "./js/pdf/gerador.js",
  "./js/pdf/mapa.js",
  "./js/pendencias.js",
  "./js/telas.js",
  "./manifest.webmanifest",
  "./templates/bo.pdf",
  "./templates/envolvidos-veiculos.pdf",
  "./vendor/pdf-lib.esm.min.js"
];

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
