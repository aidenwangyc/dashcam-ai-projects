const fs = require('fs');
const path = require('path');
const {pathToFileURL} = require('url');
const {chromium} = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname,'..');
const out = path.join(__dirname,'checks');
fs.mkdirSync(out,{recursive:true});

(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',error=>{errors.push(error.message);console.error('PAGE ERROR:',error.message);});
  const requests=[];
  page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});
  await page.goto(pathToFileURL(path.join(root,'VM_REC_4.0.0_UX展开图.html')).href);
  try {
    await page.waitForFunction(()=>window.UX_REVIEW && document.images.length>0 && [...document.images].every(image=>image.complete),{},{timeout:10000});
  } catch(error) {
    await browser.close();
    throw error;
  }
  const audit=await page.evaluate(()=>{
    const ids=UX_REVIEW.screens.map(s=>s.id);
    const overflow=[...document.querySelectorAll('.phone .app-content:not(.scroll-content),.phone .app-main,.phone .app-actions')].map(el=>({id:el.closest('.phone').dataset.screenId,part:el.className,width:el.clientWidth,scrollWidth:el.scrollWidth,height:el.clientHeight,scrollHeight:el.scrollHeight})).filter(item=>item.scrollWidth>item.width+2 || item.scrollHeight>item.height+3);
    const titleIssues=[...document.querySelectorAll('.phone .app-nav')].flatMap(nav=>{
      const title=nav.querySelector('h4,.device-switch,.album-view-switch');
      const rect=title.getBoundingClientRect(),actions=nav.querySelector('.nav-actions').getBoundingClientRect();
      return title.scrollWidth>title.clientWidth+1 || rect.right>actions.left+1 || title.scrollHeight>title.clientHeight+1 ? [nav.closest('.phone').dataset.screenId] : [];
    });
    const navigationIssues=[...document.querySelectorAll('.phone .bottom-nav')].filter(nav=>nav.textContent!=='设备Data信息' || nav.querySelectorAll('[aria-current="page"]').length!==1).map(nav=>nav.closest('.phone').dataset.screenId);
    return {screenCount:ids.length,uniqueIds:new Set(ids).size,brokenImages:[...document.images].filter(image=>!image.naturalWidth).length,missingTargets:[...document.querySelectorAll('[data-go]')].map(el=>el.dataset.go).filter(id=>!ids.includes(id)),overflow,titleIssues,navigationIssues,documentOverflow:document.documentElement.scrollWidth>innerWidth};
  });
  await page.screenshot({path:path.join(out,'desktop.png')});
  await page.evaluate(()=>UX_REVIEW.goToSection('album'));
  await page.waitForFunction(()=>{const top=document.querySelector('#album').getBoundingClientRect().top-document.querySelector('#viewport').getBoundingClientRect().top;return top>=0&&top<70;},{},{timeout:3000});
  await page.screenshot({path:path.join(out,'timeline.png')});
  await page.evaluate(()=>UX_REVIEW.openScreen('B03'));
  await page.screenshot({path:path.join(out,'prototype-home.png')});
  await page.evaluate(()=>UX_REVIEW.openScreen('D02'));
  await page.screenshot({path:path.join(out,'prototype-timeline.png')});
  for(const id of ['A02','A06','A07','B03','G02','G01','C03','F03']) {
    await page.evaluate(id=>UX_REVIEW.openScreen(id),id);
    await page.locator('#prototypePhone .phone').screenshot({path:path.join(out,`navigation-${id}.png`)});
  }
  await page.evaluate(()=>UX_REVIEW.closePrototype());
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{UX_REVIEW.setZoom(.94);document.querySelector('#viewport').scrollTo({top:0,left:0,behavior:'instant'});});
  await page.screenshot({path:path.join(out,'mobile.png')});
  await page.evaluate(()=>UX_REVIEW.openScreen('G06'));
  await page.screenshot({path:path.join(out,'mobile-feedback.png')});
  const mobileAudit=await page.evaluate(()=>({documentOverflow:document.documentElement.scrollWidth>innerWidth,dialogWidth:document.querySelector('#prototypeDialog').getBoundingClientRect().width,viewportWidth:innerWidth}));
  const result={audit,mobileAudit,errors,externalRequests:requests};
  fs.writeFileSync(path.join(out,'layout-audit.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
  await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
