import type {Appointment} from '../lib/domain';
import type {Idea} from '../lib/life';
import {SuitcaseBuddy} from './travel-buddy';
export type MomentKind=Idea['category']|'birthday'|'family'|'event';
export function momentKind(event:Appointment,ideas:Idea[]=[]):MomentKind{
 const idea=event.sourceIdeaId&&ideas.find(i=>i.id===event.sourceIdeaId);if(idea)return idea.category;
 if(event.category==='travel'||event.category==='holiday')return 'trip';
 if(event.category==='home')return 'home';
 if(event.category==='party')return 'outing';
 if(event.category==='birthday')return 'birthday';
 if(event.category==='family')return 'family';
 return 'event';
}
export const momentLabels:Record<MomentKind,string>={restaurant:'Restaurant',outing:'Sortie',home:'À la maison',trip:'Escapade',surprise:'Surprise',birthday:'Anniversaire',family:'Famille',event:'Notre rendez-vous'};
function Face(){return <><ellipse cx="51" cy="66" rx="11" ry="14" fill="var(--eye)"/><ellipse cx="77" cy="66" rx="11" ry="14" fill="var(--eye)"/><g className="moment-pupils" fill="var(--pupil)"><circle cx="54" cy="67" r="5"/><circle cx="80" cy="67" r="5"/></g><path d="M54 88q10 10 21 0" fill="none" stroke="var(--pupil)" strokeWidth="4" strokeLinecap="round"/></>;}
/** SVG companions extend the supplied buddy palette, contours and facial features. */
export function MomentBuddy({kind}:{kind:MomentKind}){
 if(kind==='trip')return <SuitcaseBuddy/>;
 return <svg className="travel-buddy moment-buddy" data-moment-kind={kind} viewBox="0 0 128 136" aria-hidden="true">
  {kind==='restaurant'?<><circle cx="64" cy="70" r="43" fill="var(--buddy-peche)"/><circle cx="64" cy="70" r="34" fill="var(--buddy-citron)"/><path d="M9 39v24m-5-24v12q5 9 10 0V39M9 61v41m109-64v64m0-64q-15 21 0 25" fill="none" stroke="var(--pupil)" strokeWidth="4" strokeLinecap="round"/><Face/><path d="m49 21 4-9m15 6 1-10m14 15 5-8" stroke="var(--marque)" strokeWidth="4" strokeLinecap="round"/></>:
  kind==='outing'?<><path d="M22 27h84v28q-16 8 0 16v41H22V71q16-8 0-16Z" fill="var(--buddy-menthe)"/><path d="M32 36h64M32 103h64" stroke="var(--pupil)" strokeOpacity=".25" strokeWidth="3" strokeDasharray="3 5"/><Face/><path d="m101 10 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" fill="var(--marque)"/></>:
  kind==='home'?<><path d="M19 58 64 19l45 39v53q0 9-9 9H28q-9 0-9-9Z" fill="var(--buddy-lavande)"/><path d="m12 58 52-45 52 45" fill="none" stroke="var(--marque)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/><path d="M86 27V14h13v25" fill="var(--buddy-peche)"/><Face/><rect x="55" y="104" width="19" height="16" rx="8" fill="var(--pupil)"/></>:
  kind==='surprise'?<><rect x="23" y="48" width="83" height="70" rx="18" fill="var(--buddy-rose)"/><path d="M61 34C30 5 29 44 61 42m4-8c31-29 34 10 2 8" fill="none" stroke="var(--marque)" strokeWidth="7" strokeLinecap="round"/><rect x="17" y="35" width="95" height="21" rx="8" fill="var(--buddy-citron)"/><Face/><path d="m114 73 2 5 5 2-5 2-2 5-2-5-5-2 5-2" fill="var(--pupil)"/></>:
  kind==='birthday'?<><rect x="23" y="47" width="83" height="70" rx="19" fill="var(--buddy-rose)"/><path d="M24 50q10-18 20 0t20 0 20 0 21 0" fill="none" stroke="var(--eye)" strokeWidth="10" strokeLinecap="round"/><path d="M65 38V24" stroke="var(--marque)" strokeWidth="7"/><path d="M65 9q-14 16 0 15 13-2 0-15" fill="var(--buddy-citron)"/><Face/></>:
  kind==='family'?<><path d="M64 33C19-8-18 61 64 122 146 61 109-8 64 33" fill="var(--buddy-rose)"/><Face/></>:
  <><rect x="23" y="28" width="84" height="88" rx="21" fill="var(--buddy-lavande)"/><path d="M41 18v21m48-21v21" stroke="var(--pupil)" strokeWidth="6" strokeLinecap="round"/><Face/></>}
 </svg>;
}
