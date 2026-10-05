import {supabase} from './supabase';
import {projectId,publicAnonKey} from '../../utils/supabase/info';
export type Graduate={id:string;name:string;institute:string;graduation_year:number;average:number|null;certificate_url:string;document_number?:string;status?:string};
export async function graduatesApi(path:string,body?:unknown){
 const {data:{session}}=await supabase.auth.getSession();
 const r=await fetch(`https://${projectId}.supabase.co/functions/v1/ibaa-graduates${path}`,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',apikey:publicAnonKey,...(session?{Authorization:`Bearer ${session.access_token}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const data=await r.json();if(!r.ok)throw new Error(data.error||data.message||'No se pudieron cargar los egresados.');return data;
}
