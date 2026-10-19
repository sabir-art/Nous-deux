import type {PersonTone} from './domain';
export const toneLabels:Record<PersonTone,string>={lavande:'Lavande',peche:'Pêche',ciel:'Ciel',corail:'Corail',sable:'Sable',perle:'Perle',menthe:'Menthe',beurre:'Miel',lilas:'Lilas',citron:'Citron',rose:'Rose'};
// Rose is « nous deux »; menthe, miel, lilas and citron mark the holidays in the agenda.
const reserved:PersonTone[]=['rose','menthe','beurre','lilas','citron'];
export const parentTones=(colors?:Record<string,PersonTone>):[PersonTone,PersonTone]=>[colors?.[0]||'lavande',colors?.[1]||'peche'];
// Colours someone can still pick: never a parent's, nor reserved, nor already worn by someone else.
// Their current colour always stays offered; with a big family, holiday colours come back rather than none at all.
export function freeTones(parents:PersonTone[],others:PersonTone[],current?:PersonTone){
 const all=Object.keys(toneLabels) as PersonTone[];
 const free=all.filter(t=>!reserved.includes(t)&&!parents.includes(t)&&!others.includes(t));
 const pool=free.length?free:all.filter(t=>t!=='rose'&&!parents.includes(t));
 return current&&!pool.includes(current)?[current,...pool]:pool;
}
