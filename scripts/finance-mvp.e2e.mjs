import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4174','--strictPort'],{stdio:'ignore'});
const base='http://127.0.0.1:4174';
async function waitForServer(){for(let i=0;i<50;i++){try{const r=await fetch(base+'/finance');if(r.ok)return;}catch{}await new Promise(resolve=>setTimeout(resolve,450));}throw new Error('Preview server did not start');}
let browser;
try{
 await waitForServer();
 browser=await chromium.launch({headless:true});
 for(const size of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport:size});
  const errs=[];page.on('pageerror',error=>errs.push(error.message));
  await page.goto(base+'/finance',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:/Find the funding/i}).waitFor();
  await page.getByRole('link',{name:/Explore opportunities/i}).click();
  assert.match(page.url(),/\/finance\/discover/);
  await page.getByRole('textbox',{name:'Search opportunities'}).fill('Blue');
  await page.getByText('Blue Coast 2026').first().waitFor();
  await page.getByRole('button',{name:/save/i}).first().click();
  await page.goto(base+'/finance/my/pipeline',{waitUntil:'domcontentloaded'});
  await page.getByText('Blue Coast 2026').first().waitFor();
  await page.goto(base+'/finance/my/projects',{waitUntil:'domcontentloaded'});
  await page.getByRole('textbox',{name:'Project name'}).fill('Ocean protection research');
  await page.getByRole('button',{name:/Create demo project/i}).click();
  await page.getByText('Ocean protection research').first().waitFor();
  await page.goto(base+'/finance/my/pipeline',{waitUntil:'domcontentloaded'});
  await page.getByRole('combobox',{name:/Project for Blue Coast 2026/i}).selectOption({label:'Ocean protection research'});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('combobox',{name:/Project for Blue Coast 2026/i}).waitFor();
  assert.equal(await page.getByRole('combobox',{name:/Project for Blue Coast 2026/i}).inputValue()!=='',true);
  await page.goto(base+'/finance/my/graph',{waitUntil:'domcontentloaded'});
  await page.getByText('Ocean protection research').first().waitFor();
  await page.goto(base+'/finance/my/calendar',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Next month'}).click();
  await page.getByText('November 2026').first().waitFor();
  assert.deepEqual(errs,[],'browser page errors');
  console.log('PASS finance e2e viewport '+size.width);
  await page.close();
 }
}finally{if(browser)await browser.close();server.kill('SIGTERM');}
