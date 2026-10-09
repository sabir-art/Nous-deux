// The raw provider response and the key never reach a client response or a log.
export class AISettingsError extends Error{constructor(public status:number,message:string){super(message);}}
export const validAIKey=(key:unknown):key is string=>typeof key==='string'&&/^sk-[A-Za-z0-9_-]{20,500}$/.test(key);
export async function verifyAIKey(key:string,model:string,fetcher:typeof fetch=fetch){
 let response:Response;try{response=await fetcher('https://api.openai.com/v1/models/'+encodeURIComponent(model),{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(12000),redirect:'error'});}catch{throw new AISettingsError(502,'OpenAI ne répond pas. Réessayez dans un instant.');}
 if(response.ok)return;
 if(response.status===401)throw new AISettingsError(400,'Cette clé OpenAI est invalide ou révoquée. Créez une nouvelle clé.');
 if(response.status===403||response.status===404)throw new AISettingsError(400,'Cette clé ne permet pas d’utiliser le modèle de recettes. Vérifiez les permissions du projet OpenAI.');
 if(response.status===429)throw new AISettingsError(429,'OpenAI limite les requêtes. Vérifiez votre compte puis réessayez.');
 throw new AISettingsError(502,'La vérification OpenAI a échoué. La clé précédente est conservée.');
}
