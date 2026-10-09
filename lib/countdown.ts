// Convert a wall-clock event in Europe/Paris, independently of the phone timezone.
export function parisTimestamp(date:string,time='00:00'){
 const target=Date.parse(date+'T'+(time||'00:00')+':00Z');
 if(!Number.isFinite(target))return NaN;
 const local=(n:number)=>{const parts=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(n);const get=(type:string)=>parts.find(p=>p.type===type)!.value;return Date.parse(`${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}Z`);};
 const offsets=[...new Set([-36,0,36].map(hours=>{const instant=target+hours*3600000;return local(instant)-instant;}))];const candidates=offsets.map(offset=>target-offset);const exact=candidates.filter(instant=>local(instant)===target);if(exact.length)return Math.min(...exact);
 // For a spring-forward gap, move forward by the gap instead of counting to an earlier hour.
 return candidates.filter(instant=>local(instant)>target).sort((a,b)=>local(a)-local(b))[0]??NaN;
}
export function countdown(target:number,now:number){const seconds=Math.max(0,Math.floor((target-now)/1000));return [Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60];}
