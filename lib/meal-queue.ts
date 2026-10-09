import type {Meals} from './domain';
export type MealBallot={date:string;recipeId:string;like:boolean};
export type MealQueueState={meals?:Meals;pending:number;error:string};
/** Ballots are final and idempotent on the server. Only the current member's
 * own choices are optimistic; matches always come from the server. */
export class MealQueue {
 private ballots:MealBallot[]=[];
 private confirmed?:Meals;
 private running=false;
 private stopped=false;
 private listeners=new Set<()=>void>();
 private view:MealQueueState={pending:0,error:''};
 constructor(private send:(ballot:MealBallot)=>Promise<Meals>){}
 subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn);};};
 snapshot=()=>this.view;
 private emit(error=this.view.error){
  const meals=this.confirmed&&{...this.confirmed,myVotes:{...this.confirmed.myVotes}};
  if(meals)for(const b of this.ballots)if(b.date===meals.date)meals.myVotes[b.recipeId]=b.like;
  this.view={meals,pending:this.ballots.length,error};this.listeners.forEach(fn=>fn());
 }
 hydrate(incoming:Meals){
  if(this.confirmed&&incoming.date<this.confirmed.date)return;
  const same=this.confirmed?.date===incoming.date;
  this.confirmed=same?{...incoming,myVotes:{...this.confirmed!.myVotes,...incoming.myVotes},matches:[...new Map([...this.confirmed!.matches,...incoming.matches].map(m=>[m.recipeId,m])).values()]}:incoming;
  const expired=this.ballots.some(b=>b.date!==incoming.date);
  this.ballots=this.ballots.filter(b=>b.date===incoming.date&&!Object.hasOwn(incoming.myVotes,b.recipeId));
  this.emit(expired?'Une nouvelle journée commence. Les choix non envoyés d’hier ont expiré.':this.view.error);
 }
 vote=(recipeId:string,like:boolean)=>{
  if(this.stopped||!this.confirmed||Object.hasOwn(this.view.meals!.myVotes,recipeId))return;
  this.ballots.push({date:this.confirmed.date,recipeId,like});this.emit();void this.flush();
 };
 retry=()=>{void this.flush();};
 stop=()=>{this.stopped=true;this.ballots=[];};
 start=()=>{this.stopped=false;};
 private async flush(){
  if(this.running||this.stopped)return;this.running=true;this.emit('');
  try{while(this.ballots.length&&!this.stopped){
   const ballot=this.ballots[0];
   try{const result=await this.send(ballot);this.ballots=this.ballots.filter(b=>b!==ballot);this.hydrate(result);}
   catch(e){this.emit(e instanceof Error?e.message:'Connexion interrompue. Vos choix attendent ici.');break;}
  }}finally{this.running=false;this.emit();}
 }
}
