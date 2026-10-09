export function swipeAxis(dx:number,dy:number,axis:'pending'|'x'|'y'){
 if(axis!=='pending'||Math.max(Math.abs(dx),Math.abs(dy))<8)return axis;
 return Math.abs(dx)>Math.abs(dy)*1.15?'x':'y';
}
export function swipeChoice(dx:number,dy:number,ms:number,width:number,axis:'pending'|'x'|'y'):boolean|null{
 if(axis!=='x'||Math.abs(dx)<Math.abs(dy)*1.15)return null;
 const distance=Math.abs(dx),fast=distance>=28&&distance/Math.max(1,ms)>.55;
 return distance>=Math.max(50,width*.22)||fast?dx>0:null;
}
