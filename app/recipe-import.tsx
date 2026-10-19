import {useEffect,useRef,useState} from 'react';
import {apiFetch} from '../lib/api-client';
import {compressPhoto} from '../lib/photos';
import {Camera,Link2,Sparkles} from './icons';
export type ImportedRecipe={title:string;group:string;difficulty:string;minutes:number;servings:number;ingredients:string[];steps:string[];sourceUrl:string;sourceTitle:string};
/** Reads a photo, a screenshot or a link on the server; the result only pre-fills the editor. */
export default function RecipeImport({initialUrl='',onBusy,onImported}:{initialUrl?:string;onBusy:(busy:boolean)=>void;onImported:(draft:ImportedRecipe,photo:File|null)=>void}){
 const[linkOpen,setLinkOpen]=useState(!!initialUrl),[url,setUrl]=useState(initialUrl),[busy,setBusy]=useState(false),[status,setStatus]=useState(''),[error,setError]=useState('');
 const started=useRef(false),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 async function run(body:{kind:'url';url:string}|{kind:'image';data:string},photo:File|null){
  setBusy(true);onBusy(true);setError('');setStatus(photo?'Notre commis lit la recette… Cela peut prendre une petite minute.':'On ouvre la page et on lit la recette…');
  try{
   const r=await apiFetch('/api/recipe-import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(100000)});
   const d=await r.json().catch(()=>({}));if(!r.ok||!d.draft)throw Error(d.error||'La recette n’a pas pu être lue. Réessayez.');
   if(alive.current)onImported(d.draft as ImportedRecipe,photo);
  }catch(e){if(alive.current)setError(e instanceof DOMException&&e.name==='TimeoutError'?'La lecture prend trop de temps. Réessayez dans un instant.':e instanceof Error&&e.message!=='Failed to fetch'?e.message:'Connexion perdue. Réessayez.');}
  finally{if(alive.current){setBusy(false);setStatus('');}onBusy(false);}
 }
 async function fromImage(input:HTMLInputElement){
  const file=input.files?.[0];input.value='';if(!file||busy)return;setError('');
  let data='';try{data=await compressPhoto(file,{sides:[2000,1600,1200,1000],limit:1400000});}catch(e){setError(e instanceof Error?e.message:'Photo illisible.');return;}
  await run({kind:'image',data},file);
 }
 function fromLink(){const value=url.trim();if(!/^https:\/\//i.test(value)){setError('Collez l’adresse complète de la recette, qui commence par https://.');return;}void run({kind:'url',url:value},null);}
 // A link shared from the browser starts reading right away: the member chose it.
 useEffect(()=>{if(initialUrl&&!started.current){started.current=true;void run({kind:'url',url:initialUrl},null);}},[initialUrl]); // eslint-disable-line react-hooks/exhaustive-deps
 return <section className="recipe-import" aria-labelledby="recipe-import-title" aria-busy={busy}>
  <h3 id="recipe-import-title"><Sparkles size={20} aria-hidden="true"/>Importer une recette</h3>
  <p>La photo d’une page de livre, une capture d’écran ou un lien : on remplit la fiche, vous relisez avant d’enregistrer.</p>
  <div className="recipe-import-actions">
   <label className={`secondary photo-upload${busy?' is-disabled':''}`}><Camera size={20} aria-hidden="true"/>Une photo<input type="file" accept="image/*" disabled={busy} onChange={e=>void fromImage(e.currentTarget)}/></label>
   <button type="button" className="secondary" aria-expanded={linkOpen} aria-controls={linkOpen?'recipe-import-link':undefined} disabled={busy} onClick={()=>setLinkOpen(v=>!v)}><Link2 size={20} aria-hidden="true"/>Un lien</button>
  </div>
  {linkOpen&&<form id="recipe-import-link" className="recipe-import-link" onSubmit={e=>{e.preventDefault();fromLink();}}><label>Adresse de la page de recette<input type="url" inputMode="url" autoComplete="off" required maxLength={2000} value={url} disabled={busy} onChange={e=>setUrl(e.target.value)} placeholder="https://…"/></label><button className="secondary" type="submit" disabled={busy||!url.trim()}>{busy?'Lecture…':'Lire la recette'}</button></form>}
  {status&&<p role="status" className="ai-status">{status}</p>}
  {error&&<p role="alert" className="form-error">{error}</p>}
  <small>Seule la photo ou la page choisie est lue, par notre serveur puis par notre commis (OpenAI) si besoin ; rien d’autre de la maison n’est envoyé. Les photos des sites ne sont pas reprises.</small>
 </section>;
}
