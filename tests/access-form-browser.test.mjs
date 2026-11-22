// Sign-in screen when the house cannot be reached: the site keeps « Actualisez la page », the Android app
// (NATIVE_APP) shows a network or server message with « Réessayer », and a late answer is ignored.
// The real lib/api-client.ts runs; only window.fetch is replaced. No network, no Supabase, no password sent.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
import {createServer} from 'node:http';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url),{build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const realClient=JSON.stringify(resolve('lib/api-client.ts'));
const client=`export {apiFetch,hasSession} from ${realClient};export const APP_BASE='/';export const NATIVE_APP=!!window.fixtureNative;`;
const bundle=await build({stdin:{contents:`import React from 'react';import{createRoot}from'react-dom/client';import AccessForm from './app/access-form';createRoot(document.getElementById('root')).render(<AccessForm/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,platform:'browser',format:'esm',write:false,jsx:'automatic',define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'fixture-client',setup(b){b.onResolve({filter:/api-client$/},()=>({path:'client',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:client,resolveDir:process.cwd(),loader:'ts'}));}}]});
const server=createServer((req,res)=>{if(new URL(req.url,'http://local').pathname==='/fixture.js'){res.setHeader('Content-Type','text/javascript');res.end(bundle.outputFiles[0].text);}else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><html lang="fr"><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const OFFLINE='Impossible de joindre la maison pour le moment. Vérifiez votre connexion à internet, puis réessayez.';
const SERVER_DOWN='La maison ne répond pas correctement pour le moment. Réessayez dans quelques instants.';
const WEB='Connexion indisponible. Actualisez la page.';
// plan[member] = {mode:'ok'|'offline'|'down', delay}; 'offline' rejects like a real network failure (TypeError).
function fixture({native,plan}){
 window.fixtureNative=native;window.fixturePlan=plan;window.fixtureCalls=[];
 window.fetch=async url=>{const member=new URL(String(url)).searchParams.get('member')||'0';window.fixtureCalls.push(member);const step=window.fixturePlan[member];
  await new Promise(r=>setTimeout(r,step.delay||0));
  if(step.mode==='offline')throw new TypeError('Failed to fetch');
  if(step.mode==='down')return new Response('{}',{status:503,headers:{'Content-Type':'application/json'}});
  return Response.json({configured:true});};
}
const{chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
try{for(const engine of process.env.CHROMIUM_EXECUTABLE?[chromium]:[chromium,webkit]){const browser=await engine.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']}:{})});try{
 const context=await browser.newContext({viewport:{width:360,height:740}});await context.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
 const errors=[];
 async function open(setup){const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(fixture,setup);await page.goto(base);return page;}
 const retry=page=>page.getByRole('button',{name:'Réessayer'});
 const password=page=>page.locator('#house-password');

 // Site: original message, no « Réessayer ».
 let page=await open({native:false,plan:{0:{mode:'offline'}}});
 await page.getByRole('alert').filter({hasText:WEB}).waitFor();assert.equal(await retry(page).count(),0);await page.close();

 // App, network failure: network message, then « Réessayer » asks again and opens the form.
 page=await open({native:true,plan:{0:{mode:'offline'}}});
 await page.getByRole('alert').filter({hasText:OFFLINE}).waitFor();assert.equal(await page.getByRole('alert').count(),1,'one message only');
 await page.evaluate(()=>{window.fixturePlan[0]={mode:'ok'};});await retry(page).click();await password(page).waitFor();
 assert.equal(await page.evaluate(()=>window.fixtureCalls.length),2,'Réessayer fetches again');assert.equal(await page.getByRole('alert').count(),0);await page.close();

 // App, server answer not OK: a server message, still with « Réessayer ».
 page=await open({native:true,plan:{0:{mode:'down'}}});
 await page.getByRole('alert').filter({hasText:SERVER_DOWN}).waitFor();await retry(page).waitFor();await page.close();

 // A late failure for the first account must not replace the form of the account chosen since.
 page=await open({native:true,plan:{0:{mode:'offline',delay:700},1:{mode:'ok'}}});
 await page.locator('#account').selectOption('1');await password(page).waitFor();await page.waitForTimeout(1000);
 assert.ok(await password(page).isVisible(),'form kept after the late answer');assert.equal(await page.getByRole('alert').count(),0);assert.equal(await retry(page).count(),0);
 assert.deepEqual(await page.evaluate(()=>window.fixtureCalls),['0','1']);await page.close();

 assert.deepEqual(errors,[]);console.log('PASS: '+engine.name()+' sign-in errors (site message, app network/server messages, Réessayer) and late answer ignored');
 await context.close();
}finally{await browser.close();}}}finally{await new Promise(r=>server.close(r));}
