import {z} from 'npm:zod@3.25.76';
// Gift ideas: for the two of us, for Abdellah (0), for Laura (1) for one of their children (recipient -1 + child)
// or for someone outside the household, named freely (recipient -1 + other), such as a friend of the couple. A secret idea is visible to its author only:
// it never leaves the server for the partner, never enters the shared activity feed and never triggers a push.
export type Gift={id:string;owner:number;recipient:-1|0|1;child?:string;other?:string;title:string;note:string;link:string;price:number|null;secret:boolean;bought:boolean;version:number;createdAt:string};
export class GiftError extends Error{constructor(public status:number,message:string){super(message);}}
const giftInput=z.object({id:z.string().uuid(),version:z.number().int().min(0),title:z.string().trim().min(1).max(100),recipient:z.union([z.literal(-1),z.literal(0),z.literal(1)]),child:z.string().uuid().optional(),other:z.string().trim().min(1).max(40).optional(),note:z.string().trim().max(500).default(''),link:z.union([z.literal(''),z.string().trim().max(500).url().refine(u=>/^https?:\/\//i.test(u),'Lien invalide.')]).default(''),price:z.number().int().min(0).max(99999999).nullable().default(null),secret:z.boolean().default(false),bought:z.boolean().default(false)});
const deleteInput=z.object({id:z.string().uuid(),version:z.number().int().min(1)});
export function visibleGifts(s:{gifts?:Gift[]},actor:number):Gift[]{return (s.gifts||[]).filter(g=>!g.secret||g.owner===actor);}
// No push for gift ideas: it is a wish list, not news, and a push would hint at a secret.
export function giftMutation(s:{gifts?:Gift[];children?:{id:string}[]},action:string,payload:unknown,actor:number,now:string):null{
 s.gifts??=[];
 const existing=s.gifts.find(g=>g.id===(payload as {id?:string})?.id);
 // A partner's secret is reported as missing, so its existence is not revealed either.
 if(existing&&existing.secret&&existing.owner!==actor)throw new GiftError(404,'Cette idée n’existe plus.');
 if(existing&&existing.owner!==actor)throw new GiftError(403,'Seule la personne qui a noté cette idée peut la modifier.');
 if(action==='delete-gift'){const v=deleteInput.parse(payload);if(!existing||existing.version!==v.version)throw new GiftError(409,'Cette idée a changé. Fermez puis rouvrez-la.');s.gifts=s.gifts.filter(g=>g.id!==v.id);return null;}
 const v=giftInput.parse(payload);
 if(!existing&&v.version!==0||existing&&existing.version!==v.version)throw new GiftError(409,'Cette idée a changé. Fermez puis rouvrez-la.');
 if(v.other!==undefined&&(v.recipient!==-1||v.child!==undefined))throw new GiftError(400,'Choisissez une seule personne pour cette idée.');
 if(v.child!==undefined&&(v.recipient!==-1||!(s.children||[]).some(c=>c.id===v.child)))throw new GiftError(400,'Cet enfant n’existe plus dans votre espace.');
 if(!existing&&s.gifts.length>=500)throw new GiftError(400,'La liste est pleine. Supprimez des idées avant d’en ajouter.');
 const gift:Gift={...v,owner:actor,version:v.version+1,createdAt:existing?.createdAt||now};
 if(existing){delete existing.child;delete existing.other;Object.assign(existing,gift);}else s.gifts.push(gift);
 return null;
}
