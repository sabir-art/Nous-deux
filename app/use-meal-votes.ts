import {useEffect,useMemo,useSyncExternalStore} from 'react';
import {apiFetch} from '../lib/api-client';
import {MealQueue} from '../lib/meal-queue';
import type {Meals} from '../lib/domain';
export function useMealVotes(member:number,server?:Meals){
 const queue=useMemo(()=>new MealQueue(async ballot=>{
  const response=await apiFetch('/api/meals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ballot),signal:AbortSignal.timeout(15000)});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Vos choix attendent une connexion. Réessayez.');return data as Meals;
 }),[member]);
 const state=useSyncExternalStore(queue.subscribe,queue.snapshot,queue.snapshot);
 useEffect(()=>{if(server)queue.hydrate(server);},[queue,server]);
 useEffect(()=>{queue.start();const retry=()=>queue.retry();window.addEventListener('online',retry);return()=>{queue.stop();window.removeEventListener('online',retry);};},[queue]);
 return {...state,meals:state.meals||server,vote:queue.vote,retry:queue.retry};
}
