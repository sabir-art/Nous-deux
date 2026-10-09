import {z} from 'zod';
import {validDate,categories} from './domain';
const label=z.string().trim().min(1).max(100);
const date=z.string().refine(validDate,'Date invalide.');
export const entryInput=z.object({id:z.string().uuid(),kind:z.enum(['expense','settlement']),title:label,cents:z.number().int().min(1).max(999999999),member:z.number().int().min(0).max(1),category:z.string().refine(v=>categories.includes(v)),date,note:z.string().trim().max(300),version:z.number().int().min(0)});
export const itemInput=z.object({id:z.string().uuid(),kind:z.enum(['shopping','task']),title:label,quantity:z.string().trim().max(50),assignee:z.number().int().min(-1).max(1),due:z.union([z.literal(''),date]),priority:z.number().int().min(0).max(1),done:z.boolean(),version:z.number().int().min(0)});
export const householdInput=z.object({first:z.string().trim().min(1).max(24),second:z.string().trim().min(1).max(24),name:z.string().trim().min(1).max(50),budget:z.number().int().min(0).max(999999999),version:z.number().int().min(0)}).refine(x=>x.first.toLocaleLowerCase()!==x.second.toLocaleLowerCase(),{message:'Choisissez deux prénoms distincts.'});
export const deleteInput=z.object({id:z.string().uuid(),version:z.number().int().min(1)});
export const appointmentInput=z.object({
 id:z.string().uuid(),title:label,category:z.enum(['medical','personal','admin','other']),
 person:z.number().int().min(-1).max(1),status:z.enum(['to_book','scheduled','done']),
 date:z.union([z.literal(''),date]),time:z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/),
 bookBy:z.union([z.literal(''),date]),location:z.string().trim().max(150),note:z.string().trim().max(500),
 version:z.number().int().min(0),
}).superRefine((v,ctx)=>{
 if(v.status!=='to_book'&&!v.date)ctx.addIssue({code:z.ZodIssueCode.custom,path:['date'],message:'Une date est nécessaire pour un rendez-vous planifié ou terminé.'});
 if(v.status==='to_book'&&(v.date||v.time))ctx.addIssue({code:z.ZodIssueCode.custom,path:['date'],message:'Un rendez-vous à prendre ne possède pas encore de date ni d’heure.'});
});
