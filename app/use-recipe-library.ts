import {useCallback,useEffect,useState} from 'react';
import {apiFetch} from '../lib/api-client';
import type {Recipe} from '../lib/recipes';
export type RecipeDiscovery={configured:boolean;enabled:boolean;status:string;lastUpdated:string|null;nextAttemptAt:number;errorCode:string|null;count:number};
export function useRecipeLibrary(){
 const[extra,setExtra]=useState<Recipe[]>([]),[discovery,setDiscovery]=useState<RecipeDiscovery|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const load=useCallback(async(action?:'discover'|'toggle',enabled?:boolean)=>{
  if(action)setLoading(true);
  try{const r=await apiFetch('/api/recipes',action?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,enabled}),signal:AbortSignal.timeout(15000)}:{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error();const d=await r.json();setExtra(d.recipes);setDiscovery(d.discovery);setError('');}
  catch{setError('Les nouvelles recettes ne sont pas disponibles pour le moment. Le carnet reste accessible.');}finally{setLoading(false);}
 },[]);
 useEffect(()=>{void load();const timer=setInterval(()=>{if(document.visibilityState==='visible')void load();},20000);return()=>clearInterval(timer);},[load]);
 return {extra,discovery,loading,error,load};
}
