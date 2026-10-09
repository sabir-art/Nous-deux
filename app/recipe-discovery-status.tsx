import {Sparkles,RefreshCw} from './icons';
import type {RecipeDiscovery} from './use-recipe-library';
export default function RecipeDiscoveryStatus({discovery,loading,error,onDiscover,onToggle}:{discovery:RecipeDiscovery|null;loading:boolean;error:string;onDiscover:()=>void;onToggle:(enabled:boolean)=>void}){
 if(error)return <p role="status" className="ai-status">{error}</p>;
 if(!discovery)return null;
 const working=discovery.status==='working',due=Date.now()>=discovery.nextAttemptAt;
 return <section className="ai-status" aria-label="Notre commis gourmand"><Sparkles size={22} aria-hidden="true"/><span><strong>Notre commis gourmand</strong><br/>{!discovery.configured?'La découverte de recettes attend son activation.':!discovery.enabled?'La recherche de nouvelles recettes est en pause.':working?'De nouvelles envies mijotent… Revenez dans un instant.':discovery.status==='failed'?'La dernière recherche n’a pas abouti. Le carnet reste disponible.':discovery.lastUpdated?`${discovery.count} recettes découvertes · Une nouvelle sélection chaque semaine.`:'Quatre nouvelles idées à découvrir chaque semaine.'}</span>{discovery.configured&&<><button className="text-link" disabled={loading} onClick={()=>onToggle(!discovery.enabled)}>{discovery.enabled?'Mettre en pause':'Reprendre'}</button>{discovery.enabled&&!working&&due&&<button className="secondary" disabled={loading} onClick={onDiscover}><RefreshCw size={16} aria-hidden="true"/>{loading?'On regarde…':'Trouver des idées'}</button>}</>}</section>;
}
