// Invitation de « Nos idées » partagée dans la discussion.
// Le navigateur n'envoie que l'identifiant : l'idée est relue ici avec les droits
// de l'expéditeur et seul un instantané minimal (sans description ni lieu) est gardé.
import {ApiError,type State} from './model.ts';

const categories=['restaurant','outing','home','trip','surprise'];
const short=(v:unknown,n=100)=>String(v??'').slice(0,n);
/** Une idée marquée privée ou secrète (champ futur éventuel) ne quitte jamais son auteur, même vers la discussion. */
export const secretIdea=(idea:any)=>idea?.secret===true||idea?.private===true||(typeof idea?.visibility==='string'&&idea.visibility!=='shared');

export function buildInvitationCard(s:State,id:string,actor:number):{ref:string;data:Record<string,unknown>;summary:string;push:string}{
 const idea=(s.ideas||[]).find(i=>i&&i.id===id);
 // Une idée secrète de l'autre est indiscernable d'une idée inexistante.
 if(!idea||(secretIdea(idea)&&idea.owner!==actor))throw new ApiError(404,'Cette invitation n’existe plus dans la maison.');
 if(secretIdea(idea))throw new ApiError(403,'Cette idée est gardée secrète : elle reste en dehors de la discussion.');
 const category=categories.includes(idea.category)?idea.category:'outing',status=['pending','accepted','declined'].includes(idea.status)?idea.status:'pending';
 const date=/^\d{4}-\d{2}-\d{2}$/.test(idea.date||'')?idea.date:'',time=date&&/^\d{2}:\d{2}$/.test(idea.time||'')?idea.time:'';
 const owner=idea.owner===0||idea.owner===1?idea.owner:-1,title=short(idea.title);
 const when=date?' · '+new Date(date+'T12:00:00Z').toLocaleDateString('fr-FR',{day:'numeric',month:'short',timeZone:'UTC'}):'';
 return {ref:idea.id,data:{title,category,owner,date,time,status},summary:`💌 Invitation : ${title}${when}`,push:'💌 Une invitation dans votre discussion'};
}
