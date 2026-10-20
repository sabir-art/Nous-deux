// Browser copy of supabase/functions/house-api/nd-emojis.ts with a French label and a classic
// emoji as fallback. Ids must stay identical (checked by tests/chat-cards.test.mjs).
export type NdEmoji={id:string;label:string;fallback:string};
export const ndEmojis:NdEmoji[]=[
 {id:'nd-lavande',label:'Notre mascotte lavande',fallback:'💜'},
 {id:'nd-peche',label:'Notre mascotte pêche',fallback:'🧡'},
 {id:'nd-nous',label:'Nous deux',fallback:'💞'},
 {id:'nd-bisou',label:'Un bisou',fallback:'😘'},
 {id:'nd-coeur',label:'Un cœur tout doux',fallback:'💗'},
 {id:'nd-chat',label:'Le chat',fallback:'🐱'},
 {id:'nd-chien',label:'Le chien',fallback:'🐶'},
 {id:'nd-plante',label:'Une plante',fallback:'🪴'},
 {id:'nd-cactus',label:'Le cactus',fallback:'🌵'},
 {id:'nd-courses',label:'Le pot des courses',fallback:'🛒'},
 {id:'nd-maison',label:'La maison',fallback:'🏡'},
 {id:'nd-cafe',label:'Un café',fallback:'☕'},
 {id:'nd-soleil',label:'Le soleil',fallback:'☀️'},
 {id:'nd-lune',label:'La lune',fallback:'🌙'},
 {id:'nd-etoile',label:'Une étoile',fallback:'✨'},
 {id:'nd-cadeau',label:'Un cadeau',fallback:'🎁'},
];
const byId=new Map(ndEmojis.map(e=>[e.id,e]));
export const findNdEmoji=(id:string)=>byId.get(id);
export const ndCode=(id:string)=>':'+id+':';
/** Splits a message into text and known emoji codes; unknown codes stay plain text. */
export function splitNdEmoji(text:string):(string|NdEmoji)[]{
 const out:(string|NdEmoji)[]=[];let last=0;
 for(const m of text.matchAll(/:(nd-[a-z0-9-]{1,30}):/g)){const e=byId.get(m[1]);if(!e)continue;if(m.index!>last)out.push(text.slice(last,m.index));out.push(e);last=m.index!+m[0].length;}
 if(last<text.length)out.push(text.slice(last));return out;
}
/** Readable text for places that cannot draw: our codes become classic emojis. */
export const ndEmojiPlain=(text:string)=>splitNdEmoji(text).map(p=>typeof p==='string'?p:p.fallback).join('');
