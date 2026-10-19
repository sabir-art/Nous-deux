// Keys a couple may put on the "Qui fait quoi ?" wheel. Labels live in app/wheel-tasks.ts.
export const wheelTaskKeys=['cuisine','vaisselle','table','courses','rangement','aspirateur','poubelles','lessive','linge','salle-de-bain','draps','plantes','animaux','petit-dej','film','resto','sortie','appel'] as const;
export const homeDrawLimit=12;
// A mission the couple writes themselves travels as « perso:<label> » (short, plain text).
export const customTask=/^perso:[\p{L}\p{N}][\p{L}\p{N} '’,.!?-]{0,39}$/u;
export const isWheelTask=(t:unknown)=>typeof t==='string'&&((wheelTaskKeys as readonly string[]).includes(t)||customTask.test(t));
