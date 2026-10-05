import { Hono } from 'npm:hono@4.13.12';
import { cors } from 'npm:hono@4.13.12/cors';
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
const app = new Hono();
const prefix = '/ibaa-graduates';
app.use('*', cors({origin: origin => {
  const allowed = (Deno.env.get('GRADUATES_ALLOWED_ORIGINS') || Deno.env.get('SITE_URL') || '').split(',').map(s => s.trim());
  return allowed.includes(origin) ? origin : '';
}, allowHeaders: ['Content-Type','Authorization','apikey'], allowMethods: ['GET','POST','OPTIONS']}));
const db = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {auth:{persistSession:false,autoRefreshToken:false}});
function checked<T extends {error: any}>(r:T):T {if(r.error) throw new Error(r.error.message);return r;}
app.get(`${prefix}/health`, c => c.json({status:'ok'}));
app.get(`${prefix}/graduates`, async c => {
 const year = c.req.query('year');
 if(year && !/^\d{4}$/.test(year)) return c.json({error:'Año inválido'},400);
 const client = db();
 let query = client.from('ibaa_graduates').select('id,name,institute,graduation_year,average,certificate_url').eq('status','published').order('name');
 if(year) query = query.eq('graduation_year',Number(year));
 const items:any[]=[];
 for(let from=0;;from+=1000){const page=checked(await query.range(from,from+999)).data || [];items.push(...page);if(page.length<1000)break;}
 const years = checked(await client.rpc('ibaa_graduate_years')).data || [];
 return c.json({items,years});
});
app.use(`${prefix}/admin/*`, async(c,next)=>{
 const token=(c.req.header('Authorization')||'').replace(/^Bearer\s+/i,'');
 if(!token)return c.json({error:'Iniciá sesión como administrador.'},401);
 const {data,error}=await db().auth.getUser(token);
 if(error || !data.user)return c.json({error:'Sesión inválida.'},401);
 if(data.user.app_metadata?.role!=='admin')return c.json({error:'Solo administradores.'},403);
 await next();
});
function validate(b:any){
 const year=Number(b.graduation_year),avg=b.average===''||b.average==null?null:Number(b.average);
 if(typeof b.name!=='string'||!b.name.trim()||b.name.length>200)throw new Error('Nombre requerido (máximo 200 caracteres).');
 if(!Number.isInteger(year)||year<1900||year>2200)throw new Error('Año inválido.');
 if(avg!==null && (!Number.isFinite(avg)||avg<0||avg>10))throw new Error('Promedio entre 0 y 10.');
 if(!['draft','published'].includes(b.status))throw new Error('Estado inválido.');
 const url=String(b.certificate_url||'').trim();
 if(url){const u=new URL(url);if(u.protocol!=='https:'&&u.protocol!=='http:')throw new Error('URL de certificado inválida.');}
 if(b.status==='published'&&!url)throw new Error('Agregá el certificado antes de publicar.');
 return {name:b.name.trim(),institute:String(b.institute||'IBAA').slice(0,80),graduation_year:year,average:avg,document_number:String(b.document_number||'').slice(0,40),certificate_url:url,status:b.status};
}
app.get(`${prefix}/admin/list`,async c=>{
 const items:any[]=[];for(let from=0;;from+=1000){const page=checked(await db().from('ibaa_graduates').select('*').order('graduation_year',{ascending:false}).order('name').range(from,from+999)).data||[];items.push(...page);if(page.length<1000)break;}return c.json({items});
});
app.post(`${prefix}/admin/save`,async c=>{
 const b=await c.req.json();let row;try{row=validate(b);}catch(e){return c.json({error:(e as Error).message},400);}
 const q=b.id?db().from('ibaa_graduates').update(row).eq('id',b.id):db().from('ibaa_graduates').insert(row);
 return c.json({item:checked(await q.select().single()).data});
});
app.post(`${prefix}/admin/delete`,async c=>{const b=await c.req.json();checked(await db().from('ibaa_graduates').delete().eq('id',b.id));return c.json({ok:true});});
app.post(`${prefix}/admin/upload`,async c=>{
 const b=await c.req.json();if(b.type!=='application/pdf'||!Number.isFinite(b.size)||b.size<=0||b.size>20*1024*1024)return c.json({error:'Seleccioná un PDF de hasta 20 MB.'},400);
 const path=`${crypto.randomUUID()}.pdf`;const client=db();const upload=checked(await client.storage.from('ibaa-certificates').createSignedUploadUrl(path)).data!;
 const url=client.storage.from('ibaa-certificates').getPublicUrl(path).data.publicUrl;
 return c.json({path,token:upload.token,url});
});
app.post(`${prefix}/admin/import`,async c=>{
 const b=await c.req.json();if(!Array.isArray(b.items)||!b.items.length||b.items.length>500)return c.json({error:'Importá entre 1 y 500 registros por archivo.'},400);
 const rows=[];for(let i=0;i<b.items.length;i++){try{rows.push(validate(b.items[i]));}catch(e){return c.json({error:`Fila ${i+1}: ${(e as Error).message}`},400);}}
 // Preserve existing records. Unique index prevents repeated imports from creating duplicates.
 const result=checked(await db().from('ibaa_graduates').upsert(rows,{onConflict:'graduation_year,institute,name',ignoreDuplicates:true}).select('id'));
 return c.json({imported:result.data?.length||0,skipped:rows.length-(result.data?.length||0)});
});
app.onError((e,c)=>{console.error(e);return c.json({error:'Error del servidor. Revisá los logs de ibaa-graduates.'},500);});
if(import.meta.main) 
  
Deno.serve(app.fetch);
export default app;
