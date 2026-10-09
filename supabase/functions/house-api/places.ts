import {z} from 'npm:zod@3.25.76';
export class PlaceError extends Error{constructor(public status:number,message:string){super(message);}}
export const placeInput=z.object({name:z.string().trim().min(1).max(150),address:z.string().trim().min(1).max(350),lat:z.number().finite().min(-90).max(90).nullable(),lon:z.number().finite().min(-180).max(180).nullable(),source:z.enum(['osm','manual']),sourceId:z.string().regex(/^[NWR]\d{1,18}$/).optional()}).refine(p=>(p.lat===null)===(p.lon===null)).refine(p=>p.source!=='osm'||(!!p.sourceId&&p.lat!==null));
export type Place=z.infer<typeof placeInput>;
export type FavoritePlace=Place&{id:string;owner:number;version:number;createdAt:string};
export function placeMutation(s:{favoritePlaces?:FavoritePlace[]},p:any,actor:number){
 if(actor!==0&&actor!==1)throw new PlaceError(403,'Compte personnel requis.');
 const base=z.object({id:z.string().uuid(),version:z.number().int().min(0)}).parse(p);const list=s.favoritePlaces??=[],old=list.find(v=>v.id===base.id);
 if(old&&old.owner!==actor)throw new PlaceError(403,'Seule la personne qui a ajouté cette adresse peut la retirer.');
 if(p.action==='remove'){if(!old||old.version!==base.version)throw new PlaceError(409,'Cette adresse a changé. Actualisez vos favoris.');list.splice(list.indexOf(old),1);return;}
 if(p.action!=='save')throw new PlaceError(400,'Action inconnue.');const place=placeInput.parse(p.place);
 if(old){if(JSON.stringify(placeInput.parse(old))===JSON.stringify(place))return;throw new PlaceError(409,'Cette adresse existe déjà.');}
 if(base.version!==0)throw new PlaceError(409,'Cette adresse n’existe plus.');
 if(list.some(v=>place.sourceId?v.sourceId===place.sourceId:v.name.toLocaleLowerCase()===place.name.toLocaleLowerCase()&&v.address.toLocaleLowerCase()===place.address.toLocaleLowerCase()))return;
 if(list.length>=300)throw new PlaceError(400,'Votre carnet est plein. Retirez une ancienne adresse pour continuer.');
 list.push({...place,...base,owner:actor,version:1,createdAt:new Date().toISOString()});
}
export function photonPlaces(data:any):Place[]{
 if(!Array.isArray(data?.features))return [];const seen=new Set<string>();const out:Place[]=[];
 for(const f of data.features.slice(0,20)){const p=f?.properties,c=f?.geometry?.coordinates;if(!p||f?.geometry?.type!=='Point'||!Array.isArray(c))continue;
 const text=(v:unknown,n=150)=>typeof v==='string'?v.trim().slice(0,n):'';
 const street=[text(p.housenumber,20),text(p.street)].filter(Boolean).join(' '),city=[text(p.postcode,20),text(p.city||p.town||p.district)].filter(Boolean).join(' ');
 const address=[street,city,text(p.country)].filter(Boolean).join(', ')||text(p.name),name=text(p.name)||street||city;
 const value={name,address,lon:c[0],lat:c[1],source:'osm',sourceId:String(p.osm_type)+String(p.osm_id)};
 const parsed=placeInput.safeParse(value);if(!parsed.success||seen.has(parsed.data.sourceId!))continue;seen.add(parsed.data.sourceId!);out.push(parsed.data);
 }return out;
}
const cache=new Map<string,{expires:number;places:Place[]}>();
export async function searchPlaces(raw:string,restaurants:boolean,rate:()=>Promise<number>){
 const q=raw.trim();if(q.length<3||q.length>150)throw new PlaceError(400,'Saisissez au moins 3 caractères et, si possible, la ville.');
 const cacheKey=restaurants+':'+q.toLocaleLowerCase(),old=cache.get(cacheKey);if(old&&old.expires>Date.now())return old.places;
 if(await rate()>50)throw new PlaceError(429,'Beaucoup de recherches ! Réessayez dans quelques minutes.');
 const url=new URL('https://photon.komoot.io/api/');url.searchParams.set('q',q);url.searchParams.set('lang','fr');url.searchParams.set('limit','8');
 if(restaurants)url.searchParams.set('osm_tag','amenity:restaurant');
 let r:Response;try{r=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(7000),redirect:'error'});}catch{throw new PlaceError(503,'La recherche de lieux est momentanément indisponible. Vous pouvez saisir l’adresse manuellement.');}
 if(!r.ok)throw new PlaceError(503,'La recherche de lieux est momentanément indisponible. Vous pouvez saisir l’adresse manuellement.');
 const places=photonPlaces(await r.json());if(cache.size>=100)cache.delete(cache.keys().next().value!);cache.set(cacheKey,{places,expires:Date.now()+300000});return places;
}
