import {useState} from 'react';
import {Check,UtensilsCrossed} from './icons';
import {diets,dietLabel,allergiesMax,type Diets} from '../lib/diets';
// Each person edits their own diet; the server ignores any other member and checks the version.
export default function DietSettings({active,names,value,busy,save}:{active:number;names:string[];value:Diets;busy:boolean;save:(action:string,payload:unknown,message?:string)=>Promise<boolean>}){
 const mine=value[active],partner=value[1-active];
 const[selected,setSelected]=useState<string[]>(mine?.diets||[]),[allergies,setAllergies]=useState(mine?.allergies||'');
 const changed=JSON.stringify([...selected].sort())!==JSON.stringify([...(mine?.diets||[])].sort())||allergies.trim()!==(mine?.allergies||'');
 const toggle=(key:string)=>setSelected(list=>list.includes(key)?list.filter(k=>k!==key):[...list,key]);
 return <section className="panel settings-panel diet-settings" aria-labelledby="diet-title"><span className="settings-icon"><UtensilsCrossed size={23}/></span><h2 id="diet-title">Ce que je mange</h2><p>Vos régimes et allergies servent à trier les recettes « Pour nous deux ». Votre moitié les voit pour cuisiner en confiance.</p>
  <form className="form" onSubmit={async e=>{e.preventDefault();if(busy)return;await save('diet',{member:active,diets:selected,allergies:allergies.trim(),version:mine?.version||0},'Vos préférences à table sont enregistrées.');}}>
   <fieldset className="diet-choices"><legend>Mes régimes</legend><div className="diet-chips">{diets.map(d=><button type="button" key={d.key} aria-pressed={selected.includes(d.key)} className={selected.includes(d.key)?'selected':''} onClick={()=>toggle(d.key)}>{selected.includes(d.key)&&<Check size={16} aria-hidden="true"/>}{d.label}</button>)}</div></fieldset>
   <label className="diet-field"><span className="diet-field-title">Mes allergies ou aliments à éviter <span className="optional">(facultatif)</span></span><textarea rows={3} maxLength={allergiesMax} value={allergies} onChange={e=>setAllergies(e.target.value)} placeholder="Ex. kiwi, céleri, moutarde"/><small>Séparez les aliments par des virgules · {allergies.length}/{allergiesMax} caractères.</small></label>
   <button className="secondary wide" type="submit" disabled={busy||!changed}><Check size={18}/>{busy?'Enregistrement…':'Enregistrer'}</button>
  </form>
  <div className="diet-partner"><strong>{names[1-active]}</strong><span>{partner&&(partner.diets.length||partner.allergies)?[...partner.diets.map(dietLabel),...(partner.allergies?['Allergies : '+partner.allergies]:[])].join(' · '):'Rien de particulier indiqué pour le moment.'}</span></div>
  <small className="helper-copy">Indication pour trier les recettes, pas un avis médical : vérifiez toujours les étiquettes.</small>
 </section>;
}
