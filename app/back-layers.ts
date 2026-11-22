// What Back closes before leaving a page, shared by the installed web app (app/use-house-navigation.ts, popstate)
// and the Android app (web/android.ts, @capacitor/app backButton), so both follow the same order:
// 1. the top open <dialog>: it receives a synthetic `cancel` event. A synthetic event does not close a native
//    dialog by itself, so every <dialog> of the app MUST handle onCancel by closing itself (see Dialog in
//    app/house-app.tsx and app/life-dialog.tsx); a dialog without it would trap Back;
// 2. the top element marked `data-back-dismiss` (a panel standing in for the keyboard, like the emoji picker):
//    it receives `nd-back-dismiss` and closes itself (app/chat-emoji.tsx).
// `before` runs only when something is about to be dismissed (the web app uses it to undo the history step).
export function dismissTopLayer(before?:()=>void):boolean{
 const dialog=[...document.querySelectorAll<HTMLDialogElement>('dialog[open]')].at(-1);
 if(dialog){before?.();dialog.dispatchEvent(new Event('cancel',{cancelable:true}));return true;}
 const layer=[...document.querySelectorAll<HTMLElement>('[data-back-dismiss]')].at(-1);
 if(layer){before?.();layer.dispatchEvent(new Event('nd-back-dismiss'));return true;}
 return false;
}
