const V='brd6-v4',FILES=['v6.html','manifest6.json','icon6-192.png','icon6-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(async c=>{await c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})));try{await c.add(new Request('my-glossary.txt',{cache:'reload'}))}catch(x){}}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k.startsWith('brd6-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin)return;
 if(/manifest6\.json$/.test(u.pathname))return;
 if(/\.(txt|csv|json)$/.test(u.pathname)){
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||Response.error())));
  return;
 }
 // v6.html: আগে নেটওয়ার্ক (নতুন সংস্করণ সঙ্গে সঙ্গে), ৪ সেকেন্ডে না এলে বা অফলাইনে জমা থাকা কপি
 if(r.mode==='navigate'||/\.html$/.test(u.pathname)||u.pathname.endsWith('/')){
  e.respondWith((async()=>{
   const net=fetch(r,{cache:'no-cache'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res});
   try{return await Promise.race([net,new Promise((_,rej)=>setTimeout(rej,4000))])}
   catch(x){return (await caches.match(r,{ignoreSearch:true}))||(await caches.match('v6.html'))||(await net.catch(()=>null))||Response.error()}
  })());
  return;
 }
 e.respondWith((async()=>{
  const hit=await caches.match(r,{ignoreSearch:true});
  const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>null);
  return hit||(await net)||(await caches.match('v6.html'));
 })());
});
