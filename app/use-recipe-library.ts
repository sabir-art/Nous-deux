import {useCallback,useEffect,useRef,useState} from 'react';
import {apiFetch} from '../lib/api-client';
import type {Recipe} from '../lib/recipes';
export type MealSlot={day:number;meal:'lunch'|'dinner';recipeId:string};
export type MealPlan={id:string;version:number;owner:number;weekStart:string;slots:MealSlot[]};
export type MealTemplate={id:string;title:string;owner:number;slots:MealSlot[]};
export type RecipeDiscovery={configured:boolean;enabled:boolean;status:string;lastUpdated:string|null;nextAttemptAt:number;errorCode:string|null;count:number};
export function useRecipeLibrary(){
 const[extra,setExtra]=useState<Recipe[]>([]),[plans,setPlans]=useState<MealPlan[]>([]),[menus,setMenus]=useState<MealTemplate[]>([]),[discovery,setDiscovery]=useState<RecipeDiscovery|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const sequence=useRef(0),saving=useRef(false),alive=useRef(true);
 const request=useCallback(async(body?:unknown)=>{
  if(saving.current)return false;if(body){saving.current=true;setLoading(true);}const seq=++sequence.current;
  try{const r=await apiFetch('/api/recipes',body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)}:{signal:AbortSignal.timeout(15000)});const d=await r.json();if(!r.ok)throw Error(d.error||'Le carnet est indisponible.');if(seq===sequence.current&&alive.current){setExtra(d.recipes||[]);setPlans(d.plans||[]);setMenus(d.menus||[]);setDiscovery(d.discovery);setError('');}return true;}
  catch(e){if(seq===sequence.current&&alive.current)setError(e instanceof Error?e.message:'Connexion perdue. Votre formulaire est conservé.');return false;}finally{if(body){saving.current=false;if(alive.current)setLoading(false);}}
 },[]);
 const load=useCallback((action?:'discover'|'toggle',enabled?:boolean)=>request(action?{action,enabled}:undefined),[request]);
 const save=useCallback((action:string,payload:unknown)=>request({action,payload}),[request]);
 useEffect(()=>{alive.current=true;void load();const timer=setInterval(()=>{if(document.visibilityState==='visible'&&!saving.current)void load();},20000);return()=>{alive.current=false;++sequence.current;clearInterval(timer);};},[load]);
 return {extra,plans,menus,discovery,loading,error,load,save};
}
