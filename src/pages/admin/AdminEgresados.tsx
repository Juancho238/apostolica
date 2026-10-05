import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Graduate,graduatesApi} from '../../lib/graduates';
import {supabase} from '../../lib/supabase';
const empty=()=>({id:'',name:'',institute:'IBAA',graduation_year:new Date().getFullYear(),document_number:'',average:'',certificate_url:'',status:'draft'});
export default function AdminEgresados(){
 const [items,setItems]=useState<Graduate[]>([]),[form,setForm]=useState(empty),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[query,setQuery]=useState('');
 const load=async()=>{setLoading(true);try{setItems((await graduatesApi('/admin/list')).items);}catch(e){setError((e as Error).message);}finally{setLoading(false);}};
 useEffect(()=>{void load();},[]);
 const update=(key:string,value:string|number)=>setForm(f=>({...f,[key]:value}));
 async function upload(file?:File){
  if(!file)return;
  setBusy(true);setError('');setMessage('');
  try{
   if(!file.name.toLowerCase().endsWith('.pdf') || file.size===0 || file.size>20*1024*1024)throw new Error('Seleccioná un PDF de hasta 20 MB.');
   if(!Number.isInteger(form.graduation_year)||form.graduation_year<1900||form.graduation_year>2200)throw new Error('Ingresá un año de egreso válido antes de subir el PDF.');
   const {data,error:sessionError}=await supabase.auth.getSession();
   if(sessionError)throw sessionError;
   if(!data.session)throw new Error('Volvé a iniciar sesión como administrador.');
   const body=new FormData();body.append('file',file);body.append('year',String(form.graduation_year));
   const response=await fetch('https://apostolica.com.ar/api/upload-certificate.php',{method:'POST',headers:{Authorization:`Bearer ${data.session.access_token}`},body});
   const text=await response.text();let result;
   try{result=JSON.parse(text);}catch{throw new Error(`Hostinger devolvió una respuesta inválida (HTTP ${response.status}). Revisá la instalación de api/upload-certificate.php y los límites de carga.`);}
   if(!response.ok)throw new Error(result.error||`No se pudo subir el PDF (HTTP ${response.status}).`);
   if(typeof result.url!=='string'||!result.url.startsWith('https://apostolica.com.ar/IBAADoc/'))throw new Error('El servidor no devolvió una URL válida del certificado.');
   update('certificate_url',result.url);setMessage('PDF cargado en Hostinger. Guardá el egresado para asociarlo.');
  }catch(e){setError(e instanceof Error?e.message:'No se pudo conectar con Hostinger. Revisá la conexión y los orígenes permitidos del archivo PHP.');}finally{setBusy(false);}
 }

 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');setMessage('');try{await graduatesApi('/admin/save',form);setForm(empty());await load();setMessage('Egresado guardado.');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function remove(x:Graduate){if(!confirm(`¿Eliminar el registro de ${x.name}? El PDF no se borrará.`))return;setBusy(true);setError('');try{await graduatesApi('/admin/delete',{id:x.id});await load();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function importFile(file?:File){if(!file)return;setBusy(true);setError('');setMessage('');try{const parsed=JSON.parse(await file.text());const d=await graduatesApi('/admin/import',{items:Array.isArray(parsed)?parsed:parsed.items});await load();setMessage(`Importados: ${d.imported}. Ya existentes: ${d.skipped}.`);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 const edit=(x:Graduate)=>{setForm({...empty(),...x,document_number:x.document_number||'',average:x.average==null?'':String(x.average),status:x.status||'draft'});setMessage('');setError('');};
 return <div className="space-y-6"><div className="flex flex-wrap justify-between gap-4"><h1 className="text-2xl font-800 text-navy">IBAA Egresados</h1><Link to="/ibaa/egresados" className="text-brand">Ver listado público →</Link></div>{error&&<p role="alert" className="text-red-700 bg-red-50 p-4 rounded">{error}</p>}{message&&<p role="status" className="text-green-800 bg-green-50 p-4 rounded">{message}</p>}
 <form onSubmit={save} className="bg-white border rounded-xl p-5 space-y-4"><h2 className="text-lg font-700">{form.id?'Editar egresado':'Nuevo egresado'}</h2><fieldset disabled={busy} className="grid sm:grid-cols-2 gap-4 disabled:opacity-60">
 <label>Nombre completo<input required maxLength={200} value={form.name} onChange={e=>update('name',e.target.value)} className="block border rounded p-2 w-full"/></label>
 <label>Instituto<input required maxLength={80} value={form.institute} onChange={e=>update('institute',e.target.value)} className="block border rounded p-2 w-full"/></label>
 <label>Año de egreso<input required type="number" min={1900} max={2200} value={form.graduation_year} onChange={e=>update('graduation_year',Number(e.target.value))} className="block border rounded p-2 w-full"/></label>
 <label>Promedio (opcional)<input type="number" min={0} max={10} step="0.01" value={form.average} onChange={e=>update('average',e.target.value)} className="block border rounded p-2 w-full"/></label>
 <label>DNI (solo visible en admin)<input maxLength={40} value={form.document_number} onChange={e=>update('document_number',e.target.value)} className="block border rounded p-2 w-full"/></label>
 <label>Estado<select value={form.status} onChange={e=>update('status',e.target.value)} className="block border rounded p-2 w-full"><option value="draft">Borrador</option><option value="published">Publicado</option></select></label>
 <label className="sm:col-span-2">URL del certificado existente<input type="url" value={form.certificate_url} onChange={e=>update('certificate_url',e.target.value)} placeholder="https://apostolica.com.ar/IBAADoc/2020/archivo.pdf" className="block border rounded p-2 w-full"/></label>
 <label className="sm:col-span-2">O subir un certificado nuevo a Hostinger (PDF, máximo 20 MB)<input type="file" accept="application/pdf" onChange={e=>{void upload(e.target.files?.[0]);e.target.value='';}} className="block mt-2"/></label>
 <p className="text-sm text-muted sm:col-span-2">El certificado publicado será accesible desde la tabla. Las URLs históricas se conservan tal como las cargás.</p>
 <div className="sm:col-span-2 flex gap-3"><button type="submit" className="bg-brand text-white rounded px-5 py-2">{busy?'Procesando…':'Guardar'}</button><button type="button" onClick={()=>setForm(empty())} className="border rounded px-5 py-2">Limpiar</button></div></fieldset></form>
 <section className="bg-white border rounded-xl p-5"><h2 className="font-700 mb-2">Importar promociones anteriores</h2><p className="text-muted text-sm mb-3">JSON de hasta 500 egresados. Los registros existentes con el mismo año, instituto y nombre se conservan. Revisá la guía incluida antes de importar.</p><input disabled={busy} aria-label="Importar egresados JSON" type="file" accept="application/json,.json" onChange={e=>{void importFile(e.target.files?.[0]);e.target.value='';}}/></section>
 <input aria-label="Buscar egresados" placeholder="Buscar nombre o año" value={query} onChange={e=>setQuery(e.target.value)} className="border rounded-lg p-3 w-full"/>{loading?<p>Cargando…</p>:<div className="overflow-x-auto bg-white rounded-xl border"><table className="w-full text-left text-sm"><thead><tr>{['Nombre','Instituto','Año','Estado','Acciones'].map(h=><th scope="col" key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{items.filter(x=>`${x.name} ${x.graduation_year}`.toLowerCase().includes(query.toLowerCase())).map(x=><tr key={x.id} className="border-t"><td className="p-3">{x.name}</td><td className="p-3">{x.institute}</td><td className="p-3"><Link className="text-brand" to={`/ibaa/egresados-${x.graduation_year}/`}>{x.graduation_year}</Link></td><td className="p-3">{x.status==='published'?'Publicado':'Borrador'}</td><td className="p-3"><button disabled={busy} onClick={()=>edit(x)} className="text-brand mr-4">Editar</button><button disabled={busy} onClick={()=>void remove(x)} className="text-red-700">Eliminar</button></td></tr>)}</tbody></table>{!items.length&&<p className="p-4">Todavía no hay egresados cargados.</p>}</div>}</div>;
}
