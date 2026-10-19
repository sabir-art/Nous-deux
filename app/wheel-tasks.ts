export type WheelTask={key:string;label:string;emoji:string};
export const wheelGroups:{title:string;tasks:WheelTask[]}[]=[
 {title:'À table',tasks:[{key:'cuisine',label:'Le dîner ce soir',emoji:'🍳'},{key:'vaisselle',label:'La vaisselle',emoji:'🧽'},{key:'table',label:'Mettre la table',emoji:'🍽️'},{key:'petit-dej',label:'Le petit-déj demain',emoji:'🥐'}]},
 {title:'La maison',tasks:[{key:'rangement',label:'Le rangement',emoji:'🧺'},{key:'aspirateur',label:'L’aspirateur',emoji:'🧹'},{key:'poubelles',label:'Les poubelles',emoji:'🗑️'},{key:'salle-de-bain',label:'La salle de bain',emoji:'🛁'},{key:'draps',label:'Changer les draps',emoji:'🛏️'}]},
 {title:'Le linge',tasks:[{key:'lessive',label:'Lancer une lessive',emoji:'🫧'},{key:'linge',label:'Étendre et plier',emoji:'👕'}]},
 {title:'Dehors et petits soins',tasks:[{key:'courses',label:'Les courses',emoji:'🛒'},{key:'plantes',label:'Arroser les plantes',emoji:'🪴'},{key:'animaux',label:'S’occuper des animaux',emoji:'🐾'}]},
 {title:'Nos moments',tasks:[{key:'film',label:'Choisir le film',emoji:'🎬'},{key:'resto',label:'Choisir le resto',emoji:'🍕'},{key:'sortie',label:'Organiser la sortie',emoji:'🎟️'},{key:'appel',label:'Appeler la famille',emoji:'📞'}]}
];
export const wheelTasks:Record<string,WheelTask>=Object.fromEntries(wheelGroups.flatMap(g=>g.tasks).map(t=>[t.key,t]));
export const defaultHomeTasks=['vaisselle','courses','rangement'];
export const defaultRecipeTasks=['cuisine','vaisselle','courses'];
