// Zone d’écriture de la discussion : « Nos émojis » y apparaissent dessinés, comme un vrai émoji,
// au lieu de leur code. Le texte reste la source de vérité : chaque dessin vaut son code court
// (:nd-bisou:), qui est ce que le serveur reçoit et valide. Le champ est un contenteditable en
// texte brut : pas de mise en forme collée, retour à la ligne avec Entrée comme avant.
import {forwardRef,useEffect,useImperativeHandle,useLayoutEffect,useRef,type ClipboardEvent,type KeyboardEvent,type PointerEvent} from 'react';
import {ndEmojis,findNdEmoji,splitNdEmoji} from '../lib/nd-emojis';
import {NdEmojiIcon} from './nd-emoji';

export type ChatInputHandle={insert:(value:string,focus?:boolean)=>void;focus:()=>void;element:()=>HTMLDivElement|null};
type Props={value:string;onChange:(value:string)=>void;maxLength:number;label:string;placeholder:string;disabled?:boolean;onFocus?:()=>void;onPointerDown?:(e:PointerEvent<HTMLDivElement>)=>void};
type Span={start:number;end:number};

const svgNs='http://www.w3.org/2000/svg',painted=['fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','opacity'] as const;
const plainSupported=()=>{try{const d=document.createElement('div');d.contentEditable='plaintext-only';return d.contentEditable==='plaintext-only';}catch{return false;}};

/** Texte du champ : un dessin redevient son code, les retours à la ligne restent des \n. */
function serialize(root:Node):string{
 let out='';root.childNodes.forEach((n,i)=>{out+=nodeText(n,i===0);});return out.replace(/​/g,'');
}
function nodeText(n:Node,first:boolean):string{
 if(n.nodeType===Node.TEXT_NODE)return (n as Text).data;
 if(!(n instanceof HTMLElement))return '';
 if(n.tagName==='IMG')return n.dataset.nd&&findNdEmoji(n.dataset.nd)?':'+n.dataset.nd+':':'';
 if(n.tagName==='BR')return '\n';
 let inner='';n.childNodes.forEach((c,i)=>{inner+=nodeText(c,i===0);});
 // Mode riche de secours : chaque bloc commence une nouvelle ligne.
 return /^(DIV|P)$/.test(n.tagName)?(first?'':'\n')+(inner==='\n'?'':inner):inner;
}
const textBefore=(root:HTMLElement,node:Node,offset:number)=>{const r=document.createRange();r.selectNodeContents(root);r.setEnd(node,offset);const box=document.createElement('div');box.append(r.cloneContents());return serialize(box).length;};
function selection(root:HTMLElement):Span|null{
 const sel=getSelection();if(!sel?.rangeCount)return null;const r=sel.getRangeAt(0);
 if(!root.contains(r.startContainer)||!root.contains(r.endContainer))return null;
 return {start:textBefore(root,r.startContainer,r.startOffset),end:textBefore(root,r.endContainer,r.endOffset)};
}
/** Place le curseur à une position du texte (un dessin compte pour la longueur de son code). */
function placeCaret(root:HTMLElement,offset:number){
 const sel=getSelection();if(!sel)return;const r=document.createRange();let left=offset,done=false;
 for(const n of Array.from(root.childNodes)){
  const len=nodeText(n,false).length;
  if(n.nodeType===Node.TEXT_NODE&&left<=len){r.setStart(n,left);done=true;break;}
  if(n.nodeType!==Node.TEXT_NODE&&left<len){r.setStartBefore(n);done=true;break;}
  left-=len;
 }
 if(!done){r.selectNodeContents(root);r.collapse(false);}else r.collapse(true);
 sel.removeAllRanges();sel.addRange(r);
}
const hasCode=(root:HTMLElement)=>Array.from(root.childNodes).some(n=>n.nodeType===Node.TEXT_NODE&&splitNdEmoji((n as Text).data).some(p=>typeof p!=='string'));

export const ChatInput=forwardRef<ChatInputHandle,Props>(function ChatInput({value,onChange,maxLength,label,placeholder,disabled=false,onFocus,onPointerDown},handle){
 const box=useRef<HTMLDivElement>(null),sprite=useRef<HTMLSpanElement>(null),last=useRef(''),saved=useRef<Span|null>(null),composing=useRef(false),images=useRef(new Map<string,string>()),mode=useRef<'plaintext-only'|'true'>('true');
 // Une image par émoji, construite une seule fois à partir du dessin de NdEmojiIcon et de ses couleurs (tokens buddy-*, identiques en clair et en sombre).
 function source(id:string){
  const cached=images.current.get(id);if(cached)return cached;
  const svg=sprite.current?.querySelector(`[data-nd="${id}"] svg`);if(!(svg instanceof SVGSVGElement))return '';
  const copy=svg.cloneNode(true) as SVGSVGElement,from=[svg,...svg.querySelectorAll('*')],to=[copy,...copy.querySelectorAll('*')];
  from.forEach((el,i)=>{const style=getComputedStyle(el);for(const p of painted){const v=style.getPropertyValue(p);if(v)to[i].setAttribute(p,v);}to[i].removeAttribute('class');});
  copy.setAttribute('xmlns',svgNs);copy.setAttribute('viewBox','-1.5 -1.5 35 35');copy.setAttribute('width','35');copy.setAttribute('height','35');copy.removeAttribute('aria-hidden');copy.removeAttribute('focusable');
  const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(copy));images.current.set(id,url);return url;
 }
 function draw(root:HTMLElement,text:string){
  root.replaceChildren(...splitNdEmoji(text).map(p=>{if(typeof p==='string')return document.createTextNode(p);
   const img=document.createElement('img');img.className='nd-emoji-img';img.alt=p.label;img.dataset.nd=p.id;img.draggable=false;img.src=source(p.id);return img;}));
 }
 function commit(next:string){last.current=next;onChange(next);}
 function changed(){
  const root=box.current;if(!root)return;const next=serialize(root);
  if(next.length>maxLength){const at=Math.min(selection(root)?.start??last.current.length,last.current.length);draw(root,last.current);placeCaret(root,at);return;}
  if(!composing.current){
   if(!next&&root.childNodes.length)root.replaceChildren();
   else if(hasCode(root)){const at=selection(root)?.end??next.length;draw(root,next);placeCaret(root,at);}
  }
  commit(next);
 }
 useEffect(()=>{mode.current=plainSupported()?'plaintext-only':'true';const root=box.current;if(root&&!disabled)root.contentEditable=mode.current;
  const remember=()=>{const root=box.current;if(root&&document.activeElement===root)saved.current=selection(root)??saved.current;};
  document.addEventListener('selectionchange',remember);return()=>document.removeEventListener('selectionchange',remember);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{const root=box.current;if(root)root.contentEditable=disabled?'false':mode.current;},[disabled]);
 // Le texte change de l’extérieur (envoi, modification d’un message) : on redessine.
 useLayoutEffect(()=>{const root=box.current;if(!root)return;if(value===last.current&&serialize(root)===value)return;
  last.current=value;draw(root,value);saved.current={start:value.length,end:value.length};if(document.activeElement===root)placeCaret(root,value.length);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[value]);
 function insert(text:string,focus=true){
  const root=box.current;if(!root)return;const current=serialize(root);
  const span=(document.activeElement===root?selection(root):null)??saved.current??{start:current.length,end:current.length};
  const start=Math.min(span.start,current.length),end=Math.min(Math.max(span.end,start),current.length);
  const next=current.slice(0,start)+text+current.slice(end);if(next.length>maxLength)return;
  draw(root,next);commit(next);const at=start+text.length;saved.current={start:at,end:at};
  if(focus){root.focus({preventScroll:true});placeCaret(root,at);}
 }
 useImperativeHandle(handle,()=>({element:()=>box.current,focus:()=>box.current?.focus(),insert}));
 function copy(e:ClipboardEvent<HTMLDivElement>,cut:boolean){
  const root=box.current,sel=getSelection();if(!root||!sel?.rangeCount)return;const r=sel.getRangeAt(0);if(r.collapsed||!root.contains(r.commonAncestorContainer))return;
  const holder=document.createElement('div');holder.append(r.cloneContents());e.clipboardData.setData('text/plain',serialize(holder));e.preventDefault();
  if(cut){r.deleteContents();changed();}
 }
 function paste(e:ClipboardEvent<HTMLDivElement>){
  const text=e.clipboardData.getData('text/plain');e.preventDefault();if(!text)return;
  // execCommand garde l’annulation native ; sinon on insère à la main.
  if(!document.execCommand?.('insertText',false,text))insert(text);
 }
 function key(e:KeyboardEvent<HTMLDivElement>){
  if(e.key==='Enter'&&mode.current==='true'&&!e.nativeEvent.isComposing){e.preventDefault();document.execCommand?.('insertLineBreak');}
 }
 return <>
  <div ref={box} className="chat-input" role="textbox" aria-multiline="true" aria-label={label} aria-placeholder={placeholder} data-placeholder={placeholder} aria-disabled={disabled||undefined}
   tabIndex={disabled?-1:0} spellCheck autoCapitalize="sentences" enterKeyHint="enter" inputMode="text" suppressContentEditableWarning
   onInput={changed} onCompositionStart={()=>{composing.current=true;}} onCompositionEnd={()=>{composing.current=false;changed();}}
   onCopy={e=>copy(e,false)} onCut={e=>copy(e,true)} onPaste={paste} onKeyDown={key} onFocus={onFocus} onPointerDown={onPointerDown} onDrop={e=>e.preventDefault()}/>
  {/* Modèles des dessins, jamais affichés : servent à fabriquer les images du champ. */}
  <span ref={sprite} className="chat-input-sprite" hidden>{ndEmojis.map(e=><NdEmojiIcon key={e.id} id={e.id} label=""/>)}</span>
 </>;
});
