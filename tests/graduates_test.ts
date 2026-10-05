import app from '../supabase/functions/ibaa-graduates/index.ts';
function assert(ok:boolean){if(!ok)throw new Error('Assertion failed');}
Deno.test('public year rejects malformed value before querying database',async()=>{const r=await app.request('/ibaa-graduates/graduates?year=oops');assert(r.status===400);});
Deno.test('anonymous cannot create or import graduates',async()=>{for(const action of ['save','import','upload','delete']){const r=await app.request(`/ibaa-graduates/admin/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert(r.status===401);}});
Deno.test('authenticated nonadmin cannot change graduates',async()=>{
 Deno.env.set('SUPABASE_URL','https://example.supabase.co');Deno.env.set('SUPABASE_SERVICE_ROLE_KEY','test');
 const original=globalThis.fetch;globalThis.fetch=()=>Promise.resolve(new Response(JSON.stringify({id:'u',app_metadata:{role:'student'}}),{headers:{'Content-Type':'application/json'}}));
 try{const r=await app.request('/ibaa-graduates/admin/save',{method:'POST',headers:{Authorization:'Bearer student'}});assert(r.status===403);}finally{globalThis.fetch=original;}
});
Deno.test('admin cannot publish without a certificate or with unsafe URL',async()=>{
 Deno.env.set('SUPABASE_URL','https://example.supabase.co');Deno.env.set('SUPABASE_SERVICE_ROLE_KEY','test');
 const original=globalThis.fetch;globalThis.fetch=()=>Promise.resolve(new Response(JSON.stringify({id:'u',app_metadata:{role:'admin'}}),{headers:{'Content-Type':'application/json'}}));
 try{for(const certificate_url of ['', 'javascript:alert(1)']){const r=await app.request('/ibaa-graduates/admin/save',{method:'POST',headers:{Authorization:'Bearer admin','Content-Type':'application/json'},body:JSON.stringify({name:'Alumno de prueba',graduation_year:2026,status:'published',certificate_url})});assert(r.status===400);}}finally{globalThis.fetch=original;}
});
