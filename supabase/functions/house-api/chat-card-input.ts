// Input schemas for shared chat cards. Kept free of model imports to avoid an import cycle with validation.ts.
import {z} from 'npm:zod@3.25.76';
import {validDate} from './domain.ts';
import {sweetNoteIds} from './sweet-notes.ts';
const monday=(v:string)=>validDate(v)&&new Date(v+'T12:00:00Z').getUTCDay()===1;
/** Keep in sync with app/couple-stickers.tsx (checked by tests/chat-cards.test.mjs). */
// The first 20 ids were sent before the redesign and must keep rendering: never remove or rename one.
export const chatStickerIds=['bisou','calin','je-t-aime','coucou','bonne-nuit','cafe','a-table','courses','arrosage','merci','bravo','pardon','boude','j-arrive','tu-me-manques','fete','film','pluie','vacances','courage',
 'chat-faim','ronron','sieste','balade','ouaf','ca-pousse','bisou-piquant','resto','je-rentre','surprise','anniv','rendez-vous'] as const;
export const chatCardKinds=['shopping','expense','plant','task','appointment','recipe','menu','mot'] as const;
export type ChatCardKind=typeof chatCardKinds[number];
const uuid=z.string().uuid();
export const chatCardInput=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('shopping'),weekStart:z.string().refine(monday).optional()}).strict(),
 z.object({kind:z.literal('expense'),id:uuid}).strict(),
 z.object({kind:z.literal('plant'),id:uuid}).strict(),
 z.object({kind:z.literal('task'),id:uuid}).strict(),
 z.object({kind:z.literal('appointment'),id:uuid}).strict(),
 z.object({kind:z.literal('recipe'),id:z.string().min(1).max(100)}).strict(),
 z.object({kind:z.literal('menu'),id:uuid}).strict(),
 z.object({kind:z.literal('mot'),id:z.enum(sweetNoteIds)}).strict(),
]);
export type ChatCardRef=z.infer<typeof chatCardInput>;
export const chatStickerInput=z.enum(chatStickerIds);
export const MAX_CARD_NOTE=280;
