import {chromium} from '@playwright/test';
import {mkdirSync} from 'node:fs';
mkdirSync('work',{recursive:true});
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle'});await page.screenshot({path:'work/desktop.png',fullPage:true});console.log(JSON.stringify({errors,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));await browser.close();
