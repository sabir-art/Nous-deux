// Ready-made sweet notes for the chat (« Un petit mot doux »). The browser only sends the id;
// the text is taken from this fixed list and kept as a snapshot. Keep in sync with lib/sweet-notes.ts
// (checked by tests/chat-cards.test.mjs). Never rename an id already sent: add new ones instead.
export const sweetNotes=[
 ['pense','Je pense à toi.'],
 ['manque','Tu me manques déjà.'],
 ['courage','Bon courage pour aujourd’hui, tu vas assurer.'],
 ['calin','Ce soir, câlin obligatoire.'],
 ['merci','Merci pour tout ce que tu fais pour nous.'],
 ['journee','Passe une belle journée, mon cœur.'],
 ['sourire','Tu me fais sourire, même de loin.'],
 ['hate','J’ai hâte de te retrouver ce soir.'],
 ['chance','Quelle chance de t’avoir.'],
 ['soin','Prends soin de toi aujourd’hui.'],
 ['equipe','On forme une sacrée équipe, tous les deux.'],
 ['bisous','Plein de bisous pour tenir jusqu’à ce soir.'],
 ['je-t-aime','Je t’aime, tout simplement.'],
 ['crois','Je crois en toi, toujours.'],
 ['rentre','Rentre vite, la maison est plus douce avec toi.'],
 ['pardon','Pardon pour tout à l’heure. On se fait un câlin ?'],
 ['soiree','Garde ta soirée, j’ai une petite idée…'],
 ['bonne-nuit','Dors bien, à demain mon amour.'],
] as const;
export const sweetNoteIds=sweetNotes.map(n=>n[0]) as unknown as [string,...string[]];
export const sweetNoteText=(id:string)=>sweetNotes.find(n=>n[0]===id)?.[1];
