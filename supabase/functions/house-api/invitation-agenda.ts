import {validDate} from './domain.ts';
import type {State} from './model.ts';
// Invitations and their derived shared event are committed in the same household CAS.
export function synchronizeInvitation(s:State,ideaId:string,now:string){
 const idea=s.ideas?.find(i=>i.id===ideaId),existing=s.appointments.find(a=>a.sourceIdeaId===ideaId);
 if(!idea||idea.status!=='accepted'||!validDate(idea.date)||![0,1].includes(idea.owner)){
  if(existing)s.appointments=s.appointments.filter(a=>a.sourceIdeaId!==ideaId);
  return;
 }
 if(existing?.sourceIdeaVersion===idea.version)return;
 const category=({restaurant:'party',outing:'party',home:'home',trip:'travel',surprise:'personal'} as Record<string,string>)[idea.category]||'personal';
 const event={id:existing?.id||crypto.randomUUID(),sourceIdeaId:idea.id,sourceIdeaVersion:idea.version,owner:idea.owner,visibility:'shared',person:-1,title:idea.title,category,status:'scheduled',date:idea.date,time:idea.time||'',endDate:'',recurrence:'none',repeatUntil:'',bookBy:'',location:[idea.place?.name,idea.place?.address,idea.location].filter(Boolean).join(' · ').slice(0,150),place:idea.place||null,note:(idea.description||'').slice(0,500),createdAt:existing?.createdAt||idea.respondedAt||now,version:(existing?.version||0)+1};
 if(existing)s.appointments[s.appointments.indexOf(existing)]=event;else s.appointments.push(event);
}
