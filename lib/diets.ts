import type {Recipe} from './recipes';
// Keep the keys in sync with supabase/functions/house-api/diets.ts.
export const diets=[
 {key:'sans-porc',label:'Sans porc'},
 {key:'vegetarien',label:'Végétarien'},
 {key:'vegetalien',label:'Végétalien'},
 {key:'sans-gluten',label:'Sans gluten'},
 {key:'sans-lactose',label:'Sans lactose'},
 {key:'sans-oeufs',label:'Sans œufs'},
 {key:'sans-fruits-a-coque',label:'Sans fruits à coque'},
 {key:'sans-poisson',label:'Sans poisson ni fruits de mer'},
 {key:'halal',label:'Halal'},
 {key:'casher',label:'Casher'},
] as const;
export type DietKey=typeof diets[number]['key'];
export type MemberDiet={diets:string[];allergies:string;version:number;updatedAt?:string};
export type Diets=Record<string,MemberDiet|undefined>;
export const dietLabel=(key:string)=>diets.find(d=>d.key===key)?.label||key;
export const allergiesMax=300;
export const normalizedText=(s:string)=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLocaleLowerCase('fr').replace(/œ/g,'oe').replace(/æ/g,'ae').replace(/[’`]/g,"'");
// Simple keyword lists, written as displayed: a hint to read the labels, never a medical guarantee.
const pork=['porc','bacon','lard','lardon','jambon','chorizo','saucisson','saindoux','gélatine','pancetta','prosciutto','guanciale','mortadelle','salami','pepperoni','andouille','andouillette','boudin','rillettes'];
const meat=['poulet','bœuf','viande','agneau','veau','dinde','canard','merguez','steak','escalope','filet mignon','mouton','lapin','chair à saucisse','kefta','kebab','bouillon de volaille','bouillon de bœuf','fond de volaille','volaille','gibier','foie'];
const shellfish=['crevette','gambas','moule','calamar','encornet','poulpe','seiche','crabe','homard','langoustine','saint-jacques','surimi','fruits de mer','huître','palourde'];
const fish=['poisson','saumon','thon','cabillaud','colin','merlu','dorade','sardine','anchois','maquereau','truite','lieu noir','bar de ligne','nuoc-mâm','nuoc mam','sauce poisson','tarama','haddock',...shellfish];
const dairy=['lait','beurre','crème','fromage','yaourt','yogourt','parmesan','mozzarella','feta','ricotta','mascarpone','emmental','gruyère','comté','cheddar','chèvre','burrata','béchamel','raclette','reblochon','camembert','brie','skyr','petit-suisse','lactose','ghee','labneh'];
const dairySafe=['lait de coco','crème de coco','lait d’amande','lait d’avoine','lait de soja','lait végétal','crème végétale','beurre de cacahuète','beurre d’arachide','sans lactose','végétal','végétale'];
const eggs=['œuf','mayonnaise','meringue'];
const gluten=['pâte','spaghetti','tagliatelle','penne','fusilli','macaroni','nouille','farine','pain','semoule','couscous','blé','boulgour','chapelure','tortilla','wrap','sauce soja','biscuit','crêpe','orge','seigle','lasagne','gnocchi','brioche','pita','naan','croûton','panure','épeautre','vermicelle','ravioli','tortellini','fregola','orzo','bière'];
const glutenSafe=['farine de riz','farine de maïs','farine de pois chiche','farine de sarrasin','farine de châtaigne','pain sans gluten','pâtes sans gluten','sans gluten','vermicelle de riz','vermicelles de riz','nouille de riz','nouilles de riz','sauce tamari','pâte de curry','pâte d’arachide'];
const nuts=['amande','noix','noisette','pistache','cajou','pécan','macadamia','cacahuète','arachide','pignon','pesto','praliné','nougat','frangipane','gianduja'];
const nutSafe=['noix de coco','noix de muscade','noix de saint-jacques','lait de coco','crème de coco'];
const alcohol=['vin','bière','rhum','cognac','kirsch','marsala','porto','calvados','whisky','vodka','liqueur','alcool','cidre','saké','mirin','grand marnier','armagnac'];
const alcoholSafe=['vinaigre de cidre','vinaigre de vin','vinaigre de vin rouge','vinaigre de vin blanc','vinaigre de xérès','vinaigre balsamique','sans alcool'];
const escape=(w:string)=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function strip(text:string,safe:string[]){let out=text;for(const s of safe)out=out.replace(new RegExp(`(^|[^a-z])${escape(normalizedText(s))}s?(?=$|[^a-z])`,'g'),'$1 ');return out;}
// Whole words only (« lait » never matches « laitue »), with an optional plural.
function found(text:string,words:string[]){return words.filter(w=>new RegExp(`(^|[^a-z])${escape(normalizedText(w))}(s|x)?(?=$|[^a-z])`).test(text));}
const groupMeat=(r:Recipe)=>r.group==='Poulet'||r.group==='Bœuf';
export type DietIssue={member:number;reason:string;words:string[];hard:boolean};
function dietIssues(r:Recipe,diet:string,text:string):{words:string[];hard:boolean;why?:string}|null{
 const hit=(list:string[],safe:string[]=[])=>found(strip(text,safe),list);
 let words:string[]=[];
 switch(diet){
  case 'sans-porc':words=hit(pork);break;
  case 'vegetarien':words=[...hit(meat),...hit(pork),...hit(fish)];if(!words.length&&(groupMeat(r)||r.group==='Poisson'))words=[r.group.toLocaleLowerCase('fr')];break;
  case 'vegetalien':words=[...hit(meat),...hit(pork),...hit(fish),...hit(dairy,dairySafe),...hit(eggs),...hit(['miel'])];if(!words.length&&(groupMeat(r)||r.group==='Poisson'))words=[r.group.toLocaleLowerCase('fr')];break;
  case 'sans-gluten':words=hit(gluten,glutenSafe);break;
  case 'sans-lactose':words=hit(dairy,dairySafe);break;
  case 'sans-oeufs':words=hit(eggs);break;
  case 'sans-fruits-a-coque':words=hit(nuts,nutSafe);break;
  case 'sans-poisson':words=hit(fish);if(!words.length&&r.group==='Poisson')words=['poisson'];break;
  case 'halal':words=[...hit(pork),...hit(alcohol,alcoholSafe)];if(!words.length&&(groupMeat(r)||hit(meat).length))return {words:[],hard:false,why:'viande à choisir halal'};break;
  case 'casher':{words=[...hit(pork),...hit(shellfish)];const m=hit(meat),d=hit(dairy,dairySafe);if(!words.length&&m.length&&d.length)words=[...m,...d];if(!words.length&&(groupMeat(r)||m.length))return {words:[],hard:false,why:'viande à choisir casher'};break;}
  default:return null;
 }
 return words.length?{words:[...new Set(words)],hard:true}:null;
}
// Free text allergies: each comma/line separated term is looked up in the ingredients.
export function allergyTerms(text:string){return [...new Set(normalizedText(text).split(/[,;\n/]+|\s+et\s+|\s+ou\s+/).map(t=>t.trim().replace(/^(allergies?|allergiques?|intolerances?|intolerante?s?)\s+(aux|au|a la|a l'|a|d'|de|du|des)\s*/,'').replace(/^(les|le|la|des|du|de)\s+|^(l|d)'/,'').trim()).filter(t=>t.length>=3&&!/^(aucune?|rien|non|pas)$/.test(t)).map(t=>t.replace(/(s|x)$/,'')))].slice(0,20);}
export function recipeIssues(r:Recipe,members:Diets):DietIssue[]{
 const text=normalizedText(r.title+' | '+r.ingredients.join(' | '));const issues:DietIssue[]=[];
 for(const member of [0,1]){const d=members[member];if(!d)continue;
  for(const key of d.diets){const issue=dietIssues(r,key,text);if(issue)issues.push({member,reason:issue.why||dietLabel(key).toLocaleLowerCase('fr'),words:issue.words,hard:issue.hard});}
  const allergies=allergyTerms(d.allergies||'').filter(t=>found(text,[t]).length);if(allergies.length)issues.push({member,reason:'allergie',words:allergies,hard:true});
 }
 return issues;
}
export const compatibleWithUs=(r:Recipe,members:Diets)=>!recipeIssues(r,members).some(i=>i.hard);
export const hasDiets=(members:Diets)=>[0,1].some(m=>!!members[m]&&(members[m]!.diets.length>0||allergyTerms(members[m]!.allergies||'').length>0));
export function issueSentence(issue:DietIssue,names:string[]){
 const who=names[issue.member]||'L’un de vous';const what=issue.words.slice(0,3).join(', ');
 if(!issue.hard)return `${who} : ${issue.reason}.`;
 if(issue.reason==='allergie')return `Contient peut-être ${what} : allergie de ${who}.`;
 return `Contient peut-être ${what}, à éviter pour ${who} (${issue.reason}).`;
}
