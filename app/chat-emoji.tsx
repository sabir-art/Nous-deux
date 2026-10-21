import {useEffect,useRef,useState} from 'react';
import {CoupleSticker,coupleStickers} from './couple-stickers';
import {X} from './icons';
import {NdEmojiIcon} from './nd-emoji';
import {ndEmojis,ndCode} from '../lib/nd-emojis';
export const chatEmojis=[['❤️','Cœur rouge'],['🥰','Visage amoureux'],['😘','Bisou'],['😍','Yeux en cœur'],['💕','Deux cœurs'],['💋','Baiser'],['😂','Mort de rire'],['😊','Sourire'],['😁','Grand sourire'],['😉','Clin d’œil'],['😎','Cool'],['🥹','Ému'],['😭','Pleure'],['😴','Dodo'],['🤔','Réfléchit'],['🙄','Lève les yeux'],['😅','Rire gêné'],['😋','Miam'],['🫶','Mains en cœur'],['👍','Pouce en l’air'],['🙏','Merci'],['👏','Bravo'],['🙌','Youpi'],['🤞','Doigts croisés'],['🎉','Fête'],['✨','Étincelles'],['🌸','Fleur'],['🌻','Tournesol'],['☀️','Soleil'],['🌙','Lune'],['☕','Café'],['🍽️','À table'],['🍕','Pizza'],['🍓','Fraise'],['🏡','Maison'],['🌱','Plante'],['✈️','Voyage'],['💌','Lettre d’amour'],['🔥','Feu'],['✅','C’est fait']];
/** Stickers exclusifs du couple (ouverts en premier) et émojis du clavier. Un sticker s’envoie directement. */
export function EmojiPicker({onChoose,onClose,onSticker,busy=false,initialTab='stickers'}:{onChoose:(emoji:string)=>void;onClose:()=>void;onSticker?:(id:string)=>void;busy?:boolean;initialTab?:'emoji'|'stickers'}){
 const[tab,setTab]=useState<'emoji'|'stickers'>(onSticker?initialTab:'emoji'),box=useRef<HTMLElement>(null),close=useRef(onClose);close.current=onClose;
 // The phone’s Back button closes the picker first (see use-house-navigation), like a dialog.
 useEffect(()=>{const el=box.current,back=()=>close.current();el?.addEventListener('nd-back-dismiss',back);return()=>el?.removeEventListener('nd-back-dismiss',back);},[]);
 return <section ref={box} data-back-dismiss="" className="chat-emoji-picker" aria-label="Choisir un émoji ou un sticker" onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();onClose();}}}><header><strong>{tab==='stickers'&&onSticker?'Rien qu’à nous':'Un peu d’émotion'}</strong>{onSticker&&<div className="chat-emoji-tabs" role="group" aria-label="Type d’expression"><button type="button" aria-pressed={tab==='emoji'} onClick={()=>setTab('emoji')}>Émojis</button><button type="button" aria-pressed={tab==='stickers'} onClick={()=>setTab('stickers')}>Nos stickers</button></div>}<button type="button" className="icon-button" aria-label="Fermer les émojis" onClick={onClose}><X size={18}/></button></header>
 {tab==='emoji'||!onSticker?<div className="chat-emoji-sections">
  {/* Nos émojis : un code court validé par le serveur, dessiné dans la ligne du message. */}
  <h3 className="chat-emoji-heading">Les nôtres</h3><div className="chat-emoji-grid chat-nd-emoji-grid">{ndEmojis.map(e=><button type="button" key={e.id} aria-label={e.label} title={e.label} onClick={()=>onChoose(ndCode(e.id))}><NdEmojiIcon id={e.id} label=""/></button>)}</div>
  <h3 className="chat-emoji-heading">Les classiques</h3><div className="chat-emoji-grid">{chatEmojis.map(([emoji,label])=><button type="button" key={emoji} aria-label={label} onClick={()=>onChoose(emoji)}><span aria-hidden="true">{emoji}</span></button>)}</div></div>
 :<><p className="helper-copy">Vos mascottes de Nous deux : vous deux, le chat, le chien, les plantes… Touchez un sticker pour l’envoyer.</p><div className="chat-sticker-grid">{coupleStickers.map(s=><button type="button" key={s.id} aria-label={'Envoyer le sticker « '+s.word+' »'} title={s.word} disabled={busy} onClick={()=>onSticker?.(s.id)}><CoupleSticker id={s.id} size={92} className="still"/></button>)}</div></>}
 </section>;
}
