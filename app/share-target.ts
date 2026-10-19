// Web Share Target (manifest `share_target`, GET): « Partager → Nous deux » from a
// browser opens /Nous-deux/?share_title=…&share_text=…&share_url=…
// The link is kept in memory only (it survives the sign-in screen, not a reload),
// the parameters are removed from the address bar and the app opens « À table ».
let pending='';
const PARAMS=['share_url','share_text','share_title'];
/** First https link of a shared value; Android often puts it in `text`. */
export function sharedLink(values:(string|null|undefined)[]):string{
 for(const value of values){const found=value?.match(/https:\/\/[^\s<>"']+/)?.[0]?.replace(/[).,;:!?»”’]+$/,'');if(found&&found.length<=2000)return found;}
 return '';
}
export function captureSharedRecipe(){
 try{
  const params=new URLSearchParams(location.search);if(!PARAMS.some(k=>params.has(k)))return;
  pending=sharedLink(PARAMS.map(k=>params.get(k)));
  const url=new URL(location.href);url.search='?view=meals';url.hash='';history.replaceState(null,'',url);
 }catch{/* A malformed share never blocks the app. */}
}
/** Returns the shared link once, then forgets it. */
export function takeSharedRecipe(){const url=pending;pending='';return url;}
