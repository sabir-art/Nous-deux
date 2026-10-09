import {z} from 'npm:zod@3.25.76';
import {validDate,categories} from './domain.ts';
const label=z.string().trim().min(1).max(100);
const date=z.string().refine(validDate,'Date invalide.');
export const entryInput=z.object({id:z.string().uuid(),kind:z.enum(['expense','settlement']),title:label,cents:z.number().int().min(1).max(999999999),member:z.number().int().min(0).max(1),category:z.string().refine(v=>categories.includes(v)),date,note:z.string().trim().max(300),version:z.number().int().min(0)});
export const itemInput=z.object({id:z.string().uuid(),kind:z.enum(['shopping','task']),title:label,quantity:z.string().trim().max(50),assignee:z.number().int().min(-1).max(1),due:z.union([z.literal(''),date]),priority:z.number().int().min(0).max(1),done:z.boolean(),weekStart:date.optional(),version:z.number().int().min(0)});
export const householdInput=z.object({first:z.string().trim().min(1).max(24),second:z.string().trim().min(1).max(24),name:z.string().trim().min(1).max(50),budget:z.number().int().min(0).max(999999999),version:z.number().int().min(0)}).refine(x=>x.first.toLocaleLowerCase()!==x.second.toLocaleLowerCase(),{message:'Choisissez deux prénoms distincts.'});
export const deleteInput=z.object({id:z.string().uuid(),version:z.number().int().min(1)});
export const appointmentInput=z.object({
 visibility:z.enum(['private','shared']).default('private'),recurrence:z.enum(['none','weekly','monthly','yearly']).default('none'),endDate:z.union([z.literal(''),date]).default(''),repeatUntil:z.union([z.literal(''),date]).default(''),
 id:z.string().uuid(),title:label,category:z.enum(['medical','personal','admin','work','holiday','travel','birthday','party','absence','family','sport','study','home','other','france','christian','islam','culture']),
 person:z.number().int().min(-1).max(1),status:z.enum(['to_book','scheduled','done']),
 date:z.union([z.literal(''),date]),time:z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/),
 bookBy:z.union([z.literal(''),date]),location:z.string().trim().max(150),note:z.string().trim().max(500),
 version:z.number().int().min(0),
}).superRefine((v,ctx)=>{
 if(v.endDate&&(v.endDate<v.date||!v.date||Date.parse(v.endDate)-Date.parse(v.date)>366*86400000))ctx.addIssue({code:z.ZodIssueCode.custom,path:['endDate'],message:'La fin doit suivre le début, dans une limite de 366 jours.'});
 if(v.repeatUntil&&(v.repeatUntil<v.date||!v.date))ctx.addIssue({code:z.ZodIssueCode.custom,path:['repeatUntil'],message:'La fin de répétition doit suivre le début.'});
 if(v.status==='to_book'&&(v.endDate||v.recurrence!=='none'||v.repeatUntil))ctx.addIssue({code:z.ZodIssueCode.custom,path:['recurrence'],message:'Fixez une date avant de répéter cet événement.'});
 if(v.status!=='to_book'&&!v.date)ctx.addIssue({code:z.ZodIssueCode.custom,path:['date'],message:'Une date est nécessaire pour un rendez-vous planifié ou terminé.'});
 if(v.status==='to_book'&&(v.date||v.time))ctx.addIssue({code:z.ZodIssueCode.custom,path:['date'],message:'Un rendez-vous à prendre ne possède pas encore de date ni d’heure.'});
});

export const shoppingCheckInput=z.object({id:z.string().uuid(),version:z.number().int().min(1),done:z.boolean()});
export const templateInput=z.object({id:z.string().uuid(),title:label,weekStart:date});
export const templateApplyInput=z.object({id:z.string().uuid(),operationId:z.string().uuid(),weekStart:date});
export const chatInput=z.object({action:z.enum(['send','edit','delete']),id:z.string().uuid(),text:z.string().trim().min(1).max(2000).optional(),version:z.number().int().min(1).optional()}).refine(v=>v.action==='delete'||!!v.text);

export const chatCursorInput=z.object({before:z.string().datetime({offset:true}),beforeId:z.string().uuid()});
