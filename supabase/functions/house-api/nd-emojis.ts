// « Nos émojis » : small drawings of the app's mascots, written in a message as a short code
// such as :nd-chat:. The server only accepts known codes; the text stays readable as a fallback
// (notifications never show message text). Keep in sync with lib/nd-emojis.ts (tests/chat-cards.test.mjs).
// Never rename an id already sent: add new ones instead.
export const ndEmojiIds=['nd-lavande','nd-peche','nd-nous','nd-bisou','nd-coeur','nd-chat','nd-chien','nd-plante','nd-cactus','nd-courses','nd-maison','nd-cafe','nd-soleil','nd-lune','nd-etoile','nd-cadeau'] as const;
const known=new Set<string>(ndEmojiIds);
/** Returns the first code that looks like one of ours but is not in the list. */
export function unknownNdEmoji(text:string){for(const m of text.matchAll(/:(nd-[a-z0-9-]{1,30}):/g))if(!known.has(m[1]))return m[1];return null;}
