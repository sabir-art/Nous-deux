import type {ReactNode} from 'react';
import {HeroCard,CategoryTile,PiggyBank,SplitBar,RankedBars,BillCard,Button,StatTile} from '../design-system/runtime';
import {categories,money,type Entry} from '../lib/domain';
export function HomeOverview({counts,onNavigate,children}:{counts:{shopping:number;tasks:number;matches:number;ideas:number;plants:number};onNavigate:(tab:string)=>void;children:ReactNode}){
 return <div className="overview"><HeroCard tone="citron" title={<>Notre quotidien,<br/><em>à deux.</em></>} text="Un peu d’organisation, beaucoup de nous." action="Voir notre journée" onAction={()=>onNavigate('calendar')} buddy={{shape:'flower',tone:'lavande',mood:'happy'}}/>
 <section aria-label="Les espaces de notre maison"><div className="section-title"><h2>On fait quoi ?</h2></div><div className="category-grid">
 <CategoryTile title="Les courses" count={`${counts.shopping} à acheter`} tone="menthe" onClick={()=>onNavigate('shopping')}/>
 <CategoryTile title="À table" count={counts.matches?`${counts.matches} envies en commun`:'Trouver notre menu'} tone="rose" onClick={()=>onNavigate('meals')}/>
 <CategoryTile title="Les corvées" count={`${counts.tasks} à faire`} tone="lavande" onClick={()=>onNavigate('tasks')}/>
 <CategoryTile title="Nos idées" count={counts.ideas?`${counts.ideas} invitations à ouvrir`:'Un moment pour nous'} tone="beurre" onClick={()=>onNavigate('ideas')}/>
 <CategoryTile title="Le jardin" count={`${counts.plants} petites pousses`} tone="menthe" onClick={()=>onNavigate('plants')}/>
 <CategoryTile title="Notre argent" count="Les comptes au clair" tone="peche" onClick={()=>onNavigate('expenses')}/>
 </div></section>{children}<div className="home-utilities"><Button variant="secondary" onClick={()=>onNavigate('calls')}>S’appeler</Button><Button variant="secondary" onClick={()=>onNavigate('notifications')}>Nos nouvelles</Button><Button variant="ghost" onClick={()=>onNavigate('settings')}>Notre espace</Button></div></div>;
}
export function BudgetOverview({entries,names,total,paid,credit,budget,monthPicker,onSettle,onSettings}:{entries:Entry[];names:string[];total:number;paid:number[];credit:number;budget:number;monthPicker:ReactNode;onSettle:()=>void;onSettings:()=>void}){
 const verdict=credit===0?'On est à l’équilibre.':`${names[credit>0?1:0]} doit ${money(Math.abs(credit))} à ${names[credit>0?0:1]}.`;
 const tones=['menthe','lilas','beurre','rose','peche','lavande'] as const;
 const sums=categories.map((label,i)=>({label,value:entries.filter(e=>e.category===label).reduce((n,e)=>n+e.cents,0)/100,tone:tones[i]})).filter(c=>c.value>0);
 return <div className="budget-overview"><div className="section-title"><h2>Ce mois-ci</h2>{monthPicker}</div><div className="budget-grid">
 {budget>0?<PiggyBank variant="classique" label="Notre budget commun" value={total/100} goal={budget/100} note={total>budget?`${money(total-budget)} au-delà du budget`:`Il reste ${money(budget-total)} ce mois-ci`}/>:<div className="budget-no-goal"><StatTile label="Nos dépenses du mois" value={money(total)} tone="peche"/><Button variant="secondary" onClick={onSettings}>Définir notre budget</Button></div>}
 <div className="budget-detail"><BillCard label="L’équilibre entre nous" amount={money(Math.abs(credit))} status={credit===0?'paid':'unpaid'} statusText={credit===0?'À jour':'À rembourser'}><p>{verdict}</p><p className="helper-copy">Depuis le début, remboursements compris.</p>{credit!==0&&<Button variant="primary" onClick={onSettle}>Noter un remboursement</Button>}</BillCard>
 {total>0?<SplitBar title="Qui a avancé quoi ?" subtitle="Les dépenses du mois sélectionné" items={names.map((name,i)=>({name,value:paid[i]/100,color:i===0?'data-1':'data-2'}))} verdict={verdict}/>:<StatTile label="Ce que chacun a avancé" value="Aucune dépense" tone="lavande"/>}</div></div>
 {sums.length>0&&<RankedBars title="Où va notre argent ?" subtitle="Les dépenses du mois, par catégorie" items={sums}/>}</div>;
}
