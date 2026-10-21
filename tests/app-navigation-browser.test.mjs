// Full application fixture: no production session, data, calls or notifications.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,realpathSync} from 'node:fs';
import {createServer} from 'node:http';
const require=createRequire(import.meta.url),{build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const api=`export const APP_BASE='/Nous-deux/';window.fixtureRequests=[];window.fixtureMember=0;export async function apiFetch(path,init={}){window.fixtureRequests.push({path,method:init.method||'GET'});if(init.method==='POST')throw Error('Fixture forbids writes');await new Promise(r=>setTimeout(r,25));if(path.startsWith('/api/household'))return Response.json({member:window.fixtureMember,household:{first:'Alex',second:'Camille',name:'Maison test',budget:100000,version:1},entries:[],items:[],appointments:[],ideas:[],plants:[],profiles:{},meals:{date:'2026-10-10',myVotes:{},matches:[]}});if(path.startsWith('/api/daily-calls'))return Response.json({configured:true,call:null,history:[]});if(path.startsWith('/api/chat-settings'))return Response.json({theme:'rose'});if(path.startsWith('/api/chat'))return Response.json({messages:[{id:'hello',member:1,text:'Message témoin',created_at:new Date().toISOString(),version:1}],hasMore:false,serverNow:new Date().toISOString()});if(path.startsWith('/api/recipes'))return Response.json({recipes:[],discovery:{enabled:false}});return Response.json({});}`;
const bundle=await build({stdin:{contents:`import React from 'react';import{createRoot}from'react-dom/client';import HouseApp from './app/house-app';createRoot(document.getElementById('root')).render(<HouseApp/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,platform:'browser',format:'esm',write:false,jsx:'automatic',define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'fixture-api',setup(b){b.onResolve({filter:/api-client$/},()=>({path:'api',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:api}));}}]});
const css=['design-system/tokens/tokens.css','design-system/components/bundle.css','app/application.css'].map(p=>readFileSync(p,'utf8')).join('\n');
const server=createServer((req,res)=>{const path=new URL(req.url,'http://local').pathname;if(path==='/fixture.js'){res.setHeader('Content-Type','text/javascript');res.end(bundle.outputFiles[0].text);}else if(path==='/fixture.css'){res.setHeader('Content-Type','text/css');res.end(css);}else if(path==='/outside'){res.end('<h1>Outside application</h1>');}else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><html lang="fr" data-theme="light"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const{chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
try{for(const engine of process.env.CHROMIUM_EXECUTABLE?[chromium]:[chromium,webkit]){const browser=await engine.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']}: {})});try{
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});await context.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());const page=await context.newPage(),errors=[],warnings=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&m.text().includes('same key'))warnings.push(m.text());});await page.goto(base);await page.getByRole('heading',{name:/Alex/}).waitFor();
const nav=page.getByRole('navigation',{name:'Navigation principale'});
async function choose(name){if(await page.locator('.chat-back').count()){await page.locator('.chat-back').click();await nav.waitFor();}await nav.getByRole('button',{name,exact:true}).tap();}
for(let i=0;i<3;i++){await choose('Nous');await page.getByText('Message témoin',{exact:true}).first().waitFor();await page.waitForTimeout(150);assert.equal(await page.locator('.chat-panel').count(),1,'Exactly one chat after entry');await choose(i%2?'Agenda':'Repas');await page.waitForTimeout(200);assert.equal(await page.locator('.chat-panel').count(),0,'Chat removed after leaving tab');}

await choose('Agenda');await choose('Nous');assert.equal(await nav.count(),0);await page.locator('.chat-back').click();await page.locator('.couple-navigation-tab[aria-label="Agenda"][aria-current="page"]').waitFor();
if(process.env.UX_SCREENSHOTS){await choose('Nous');await page.getByText('Message témoin',{exact:true}).waitFor();await page.screenshot({path:process.env.UX_SCREENSHOTS+'/immersive-chat.png'});}
// Poll/update and account changes must not leave stale chat DOM behind.
await choose('Nous');await page.getByText('Message témoin',{exact:true}).waitFor();
await page.evaluate(()=>{window.fixtureMember=1;window.dispatchEvent(new Event('focus'));});await page.locator('.chat-header h2').filter({hasText:'Alex'}).waitFor();assert.equal(await page.locator('.chat-panel').count(),1);
await page.evaluate(()=>{window.fixtureMember=0;window.dispatchEvent(new Event('focus'));});await page.locator('.chat-header h2').filter({hasText:'Camille'}).waitFor();
await page.waitForTimeout(3200);assert.equal(await page.locator('.chat-panel').count(),1);
// A normal browser has page history, including Forward and refresh, without an exit trap.
await page.goto(base+'/?view=home');await page.getByRole('heading',{name:/Alex/}).waitFor();
for(const name of ['Agenda','Repas','Nous'])await choose(name);
await page.goBack();await page.locator('.couple-navigation-tab[aria-current="page"][aria-label="Repas"]').waitFor();assert.equal(await page.locator('.chat-panel').count(),0);
await page.goBack();await page.locator('.couple-navigation-tab[aria-current="page"][aria-label="Agenda"]').waitFor();
await page.goForward();await page.locator('.couple-navigation-tab[aria-current="page"][aria-label="Repas"]').waitFor();
const length=await page.evaluate(()=>history.length);await choose('Repas');assert.equal(await page.evaluate(()=>history.length),length);
await page.reload();await page.locator('.couple-navigation-tab[aria-current="page"][aria-label="Repas"]').waitFor();assert.equal(await page.evaluate(()=>history.length),length);
await choose('Agenda');await page.getByRole('button',{name:'Ajouter',exact:true}).tap();await page.locator('dialog[open]').waitFor();await page.goBack();await page.locator('dialog[open]').waitFor({state:'hidden'});await page.waitForFunction(()=>new URLSearchParams(location.search).get('view')==='calendar');assert.equal(await nav.getByRole('button',{name:'Agenda',exact:true}).getAttribute('aria-current'),'page');
// Simulate the same TouchEvent coordinates on both engines, with diagonal drift.
async function swipe(selector,dx,dy=4,cancel=false){await page.locator(selector).first().evaluate((target,{dx,dy,cancel})=>{const x=dx<0?300:90,y=300;function touch(type,cx,cy){const event=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(event,'touches',{value:type==='touchend'||type==='touchcancel'?[]:[{clientX:cx,clientY:cy,target}]});target.dispatchEvent(event);}touch('touchstart',x,y);touch('touchmove',x+dx/4,y+dy/4);touch('touchmove',x+dx,y+dy);touch(cancel?'touchcancel':'touchend',x+dx,y+dy);},{dx,dy,cancel});}
await choose('Accueil');await swipe('.page-heading h1',-180,12);await page.locator('.couple-navigation-tab[aria-label="Agenda"][aria-current="page"]').waitFor();
await swipe('.page-heading h1',-180,10);await page.locator('.couple-navigation-tab[aria-label="Repas"][aria-current="page"]').waitFor();
await page.locator('.swipe-card').waitFor();await swipe('.swipe-card',-180);assert.equal(await nav.getByRole('button',{name:'Repas',exact:true}).getAttribute('aria-current'),'page');
await swipe('.page-heading h1',20,180);assert.equal(await nav.getByRole('button',{name:'Repas',exact:true}).getAttribute('aria-current'),'page');
await swipe('.page-heading h1',180,10,true);assert.equal(await nav.getByRole('button',{name:'Repas',exact:true}).getAttribute('aria-current'),'page');
await swipe('.page-heading h1',180);await page.locator('.couple-navigation-tab[aria-label="Agenda"][aria-current="page"]').waitFor();
await choose('Nous');await page.getByText('Message témoin',{exact:true}).waitFor();await swipe('.chat-composer [role=textbox]',180);assert.equal(await page.locator('.chat-panel').count(),1);assert.equal(await nav.count(),0);await swipe('.chat-messages',180,8);await page.locator('.couple-navigation-tab[aria-label="Argent"][aria-current="page"]').waitFor();assert.equal(await page.locator('.chat-panel').count(),0);
// Existing horizontal scrolling owns the gesture, even at its boundary.
await page.evaluate(()=>{const scroller=document.createElement('div');scroller.id='fixture-carousel';scroller.style.cssText='width:120px;overflow-x:auto';scroller.innerHTML='<div style="width:500px">Horizontal content</div>';document.querySelector('main').append(scroller);});await swipe('#fixture-carousel>div',-180);assert.equal(await nav.getByRole('button',{name:'Argent',exact:true}).getAttribute('aria-current'),'page');await page.evaluate(()=>document.querySelector('#fixture-carousel').remove());
if(engine===chromium){
 await choose('Accueil');const heading=page.locator('.page-heading h1');await heading.waitFor();const box=await heading.boundingBox(),y=box.y+box.height/2;const input=await context.newCDPSession(page);
 await input.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y}]});for(let x=280;x>=100;x-=30){await input.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+5}]});await page.waitForTimeout(20);}await input.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.locator('.couple-navigation-tab[aria-label="Agenda"][aria-current="page"]').waitFor();await input.detach();
}
// Installed Android: Back traverses pages, warns at root, then allows actual exit.
const android=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 15; SM-A266B) AppleWebKit/537.36 Chrome/143.0.0.0 Mobile Safari/537.36'});
await android.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
await android.addInitScript(()=>{const original=window.matchMedia.bind(window);window.matchMedia=query=>{const result=original(query);if(query==='(display-mode: standalone)')Object.defineProperty(result,'matches',{value:true});return result;};});
const ap=await android.newPage();await ap.goto(base+'/outside');await ap.goto(base+'/?view=home');await ap.getByRole('heading',{name:/Alex/}).waitFor();const anav=ap.getByRole('navigation');
for(const name of ['Agenda','Repas','Nous'])await anav.getByRole('button',{name,exact:true}).tap();
for(const name of ['Repas','Agenda','Accueil']){await ap.goBack();await ap.locator('.couple-navigation-tab[aria-label="'+name+'"][aria-current="page"]').waitFor();}
await ap.goBack();await ap.getByText('Appuyez encore sur Retour pour quitter.',{exact:true}).waitFor();assert.equal(await anav.getByRole('button',{name:'Accueil',exact:true}).getAttribute('aria-current'),'page');
await ap.waitForTimeout(2400);await ap.goBack();await ap.waitForFunction(()=>history.state.nousDeuxRoute.exit===true);await ap.goBack();await ap.getByRole('heading',{name:'Outside application'}).waitFor();await android.close();

assert.deepEqual(warnings,[],'No duplicate React keys');assert.deepEqual(errors,[]);console.log('PASS: '+engine.name()+' full app chat lifecycle, account isolation, page swipes, exclusions, Back/Forward, modal Back and Android double-Back');await context.close();
}finally{await browser.close();}}}finally{await new Promise(r=>server.close(r));}
