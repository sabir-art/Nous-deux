// Browser copy of supabase/functions/house-api/sweet-notes.ts, with a pastel tone for each card.
// Ids and texts must stay identical (checked by tests/chat-cards.test.mjs).
export type SweetTone='rose'|'lilas'|'menthe'|'beurre'|'peche'|'lavande'|'citron';
export const sweetNotes:{id:string;text:string;tone:SweetTone}[]=[
 {id:'pense',text:'Je pense à toi.',tone:'rose'},
 {id:'manque',text:'Tu me manques déjà.',tone:'lilas'},
 {id:'courage',text:'Bon courage pour aujourd’hui, tu vas assurer.',tone:'citron'},
 {id:'calin',text:'Ce soir, câlin obligatoire.',tone:'peche'},
 {id:'merci',text:'Merci pour tout ce que tu fais pour nous.',tone:'beurre'},
 {id:'journee',text:'Passe une belle journée, mon cœur.',tone:'menthe'},
 {id:'sourire',text:'Tu me fais sourire, même de loin.',tone:'citron'},
 {id:'hate',text:'J’ai hâte de te retrouver ce soir.',tone:'rose'},
 {id:'chance',text:'Quelle chance de t’avoir.',tone:'lavande'},
 {id:'soin',text:'Prends soin de toi aujourd’hui.',tone:'menthe'},
 {id:'equipe',text:'On forme une sacrée équipe, tous les deux.',tone:'beurre'},
 {id:'bisous',text:'Plein de bisous pour tenir jusqu’à ce soir.',tone:'rose'},
 {id:'je-t-aime',text:'Je t’aime, tout simplement.',tone:'peche'},
 {id:'crois',text:'Je crois en toi, toujours.',tone:'lilas'},
 {id:'rentre',text:'Rentre vite, la maison est plus douce avec toi.',tone:'lavande'},
 {id:'pardon',text:'Pardon pour tout à l’heure. On se fait un câlin ?',tone:'lilas'},
 {id:'soiree',text:'Garde ta soirée, j’ai une petite idée…',tone:'peche'},
 {id:'bonne-nuit',text:'Dors bien, à demain mon amour.',tone:'lavande'},
];
export const sweetNoteTone=(id:string):SweetTone=>sweetNotes.find(n=>n.id===id)?.tone||'rose';
