const V='ny-20261113-01';
const CORE=['./','./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='ny-img'&&k!=='ny-tiles').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin===location.origin){e.respondWith(fetch(r).then(x=>{const cp=x.clone();caches.open(V).then(c=>c.put(r,cp));return x}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));return}
 if(/wikimedia\.org$/.test(u.hostname)||/tile\.openstreetmap\.org$/.test(u.hostname)){const cn=/tile/.test(u.hostname)?'ny-tiles':'ny-img';e.respondWith(caches.open(cn).then(c=>c.match(r).then(m=>{const f=fetch(r,{mode:r.mode}).then(x=>{if(x&&(x.ok||x.type==='opaque'))c.put(r,x.clone());return x}).catch(()=>m);return m||f})));return}
});
