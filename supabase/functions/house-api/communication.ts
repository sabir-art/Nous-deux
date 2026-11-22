import {z} from 'npm:zod@3.25.76';
export const notificationCategories=['shopping','tasks','expenses','calendar','calls','ideas','plants','chat','reminders','pets'] as const;
export type NotificationCategory=typeof notificationCategories[number];
export const preferenceInput=z.object({shopping:z.boolean(),tasks:z.boolean(),expenses:z.boolean(),calendar:z.boolean(),calls:z.boolean(),ideas:z.boolean().default(true),plants:z.boolean().default(true),chat:z.boolean().default(true),reminders:z.boolean().default(true),pets:z.boolean().default(true)}).strict();
export type Preferences=z.infer<typeof preferenceInput>;
export const defaultPreferences:Preferences={shopping:true,tasks:true,expenses:true,calendar:true,calls:true,ideas:true,plants:true,chat:true,reminders:true,pets:true};
export const deviceInput=z.string().uuid();
export const memberInput=z.number().int().min(0).max(1);
// Restrict outbound push requests to known browser push services (no arbitrary URLs).
export function allowedPushEndpoint(value:string){
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')&&!u.hash&&(
 u.hostname==='fcm.googleapis.com'||u.hostname==='web.push.apple.com'||u.hostname.endsWith('.push.apple.com')||u.hostname==='updates.push.services.mozilla.com'||u.hostname.endsWith('.notify.windows.com'));}catch{return false;}
}
export const subscriptionInput=z.object({endpoint:z.string().max(2048).refine(allowedPushEndpoint),expirationTime:z.number().nullable().optional(),keys:z.object({p256dh:z.string().regex(/^[A-Za-z0-9_-]{87}=?$/),auth:z.string().regex(/^[A-Za-z0-9_-]{22}={0,2}$/)})});
// The Android app (22 November 2026) registers an FCM token instead of a browser subscription.
export const fcmInput=z.object({token:z.string().min(20).max(4096).regex(/^[A-Za-z0-9_:.\-]+$/)}).strict();
// The push address of a device: its browser endpoint, or its FCM token prefixed with « fcm: ».
export function pushAddress(d:{subscription?:{endpoint?:string};fcm?:{token?:string}}|null|undefined){
 return d?.subscription?.endpoint||(d?.fcm?.token?'fcm:'+d.fcm.token:'');
}
// Which push service a subscription uses, for a readable diagnosis (never the address itself).
export type PushService='apple'|'google'|'mozilla'|'microsoft'|'app'|'other';
export function pushService(endpoint:string):PushService{
 if(endpoint.startsWith('fcm:'))return 'app';
 try{const h=new URL(endpoint).hostname;return h==='web.push.apple.com'||h.endsWith('.push.apple.com')?'apple':h==='fcm.googleapis.com'?'google':h==='updates.push.services.mozilla.com'?'mozilla':h.endsWith('.notify.windows.com')?'microsoft':'other';}catch{return 'other';}
}
// One push per browser subscription or app token: if an older record shares the push address of a newer one, the newest wins.
export function pushTargets<T extends {subscription?:{endpoint?:string};fcm?:{token?:string}}>(devices:T[]):T[]{
 const seen=new Set<string>(),out:T[]=[];for(const d of [...devices].reverse()){const e=pushAddress(d);if(e&&seen.has(e))continue;if(e)seen.add(e);out.unshift(d);}return out;
}
// Sober rule (21 October 2026): the partner's phone only rings for what asks for an answer or a gesture —
// chat messages and calls (their own routes), an invitation or its answer, and « J'ai fini la liste ».
// Routine changes (articles, purchases, expenses, appointments, missions, plant care…) only enter
// « Les nouvelles de la maison »; agenda, mission and plant reminders come from the scheduler instead.
export const partnerPushActions=['idea','idea-response','shopping-finished'] as const;
export const pushesPartner=(action:unknown)=>typeof action==='string'&&(partnerPushActions as readonly string[]).includes(action);
export function changeDescription(action:string,p:{kind?:string;version?:number;done?:boolean;title?:string}):{category:NotificationCategory;message:string}|null{
 if(action==='item')return {category:p.kind==='shopping'?'shopping':'tasks',message:p.done?'a coché un élément.':p.version===0?(p.kind==='shopping'?'a ajouté un article aux courses.':'a ajouté une tâche.'):'a modifié une liste.'};
 if(action==='entry')return {category:'expenses',message:p.kind==='settlement'?'a enregistré un remboursement.':p.version===0?'a ajouté une dépense.':'a modifié une dépense.'};
 if(action==='appointment')return {category:'calendar',message:p.version===0?'a ajouté un rendez-vous.':'a mis à jour un rendez-vous.'};
 if(action==='delete-appointment')return {category:'calendar',message:'a supprimé un rendez-vous.'};
 if(action==='delete-entry')return {category:'expenses',message:'a supprimé une dépense ou un remboursement.'};
 return null;
}
