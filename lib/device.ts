let memoryId='';
export function deviceId(){
 if(memoryId)return memoryId;
 try{const saved=localStorage.getItem('adeux-device');if(saved&&/^[0-9a-f-]{36}$/.test(saved))return memoryId=saved;memoryId=crypto.randomUUID();localStorage.setItem('adeux-device',memoryId);}catch{memoryId=crypto.randomUUID();}
 return memoryId;
}
