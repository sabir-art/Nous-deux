// Translate known provider failures without displaying URLs, tokens or raw payloads.
export const DAILY_PAYMENT_MESSAGE='Daily bloque les appels : ajoutez un moyen de paiement dans la rubrique Billing de votre compte Daily, puis réessayez.';
export function callFailureMessage(error:unknown):string {
 const e=error as {errorMsg?:string;message?:string;name?:string;error?:{msg?:string}}|null;
 const message=typeof error==='string'?error:e?.errorMsg||e?.message||e?.error?.msg||'';
 if(message.includes('account-missing-payment-method'))return DAILY_PAYMENT_MESSAGE;
 if(message===DAILY_PAYMENT_MESSAGE)return message;
 if(e?.name==='NotAllowedError'||/permission|not.allowed|notallowed/i.test(message))return 'Autorisation refusée. Activez le microphone et, pour la vidéo, la caméra dans les réglages du navigateur.';
 if(/expired|not-found|deleted|invalid.*token/i.test(message))return 'Cet appel n’est plus disponible. Lancez un nouvel appel.';
 if(/load.*bundle|network|connection|Connexion|connect/i.test(message))return 'La connexion à l’appel a échoué. Vérifiez votre réseau, puis réessayez.';
 return 'L’appel n’a pas pu démarrer. Réessayez dans un instant.';
}
