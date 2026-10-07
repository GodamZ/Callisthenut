const CACHE='callisthenut-v11';
const ASSETS=['./','index.html','styles.css?v=11','app.js?v=11','exercise-catalog.js?v=11','workout-planner.js?v=11','icon.svg','manifest.webmanifest',...Array.from({length:44},(_,i)=>`images/${26239+i*2}.jpg`)];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)))});
self.addEventListener('activate',event=>event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))])));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>caches.match(event.request).then(cached=>cached||(event.request.mode==='navigate'?caches.match('./'):Response.error()))))});
