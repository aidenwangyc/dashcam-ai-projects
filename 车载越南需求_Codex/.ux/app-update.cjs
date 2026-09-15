const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(__dirname,'checks');

(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const errors=[],passed=[];
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname,'..','VM_REC_4.0.0_UX展开图.html')).href);
    await page.waitForFunction(()=>window.UX_REVIEW);
    const phone=page.locator('#prototypePhone .phone');
    const open=id=>page.evaluate(id=>UX_REVIEW.openScreen(id),id);
    const row=phone.locator('[data-app-update-row]');
    const rowLayout=()=>row.evaluate(el=>{const rect=el.getBoundingClientRect(),frame=el.closest('.phone').getBoundingClientRect();return {left:rect.left-frame.left,top:rect.top-frame.top,width:rect.width,height:rect.height};});
    const choose=result=>page.locator('[data-app-update-result]').selectOption(result);
    const atInfo=async()=>assert.equal(await phone.getAttribute('data-screen-id'),'G01');
    const resultToast=async text=>{await phone.locator('.inline-toast').waitFor();assert.equal(await phone.locator('.inline-toast').textContent(),text);assert.equal(await phone.locator('.app-loading-toast').count(),0);assert(await row.isEnabled());await atInfo();};
    assert.equal(await page.locator('#screen-G04,#screen-G08,#screen-X08,[data-go="G04"],[data-go="G08"],[data-go="X08"]').count(),0);
    assert((await page.evaluate(()=>UX_REVIEW.screens.map(s=>s.id))).every(id=>!['G04','G08','X08'].includes(id)));
    passed.push('No standalone App update result or error pages, navigation targets or selector entries');

    for(const viewport of [{width:1440,height:1000},{width:375,height:812},{width:320,height:780},{width:812,height:375}]) {
      await page.setViewportSize(viewport);await open('G01');await choose('latest');
      const before=await row.innerHTML(),bounds=await rowLayout();
      await row.click();
      assert(await phone.locator('.app-loading-toast').isVisible());
      assert.equal(await row.innerHTML(),before);
      assert.equal(await row.getAttribute('aria-busy'),'true');
      assert.equal(await phone.locator('.app-main .app-loading-toast').count(),0);
      assert.deepEqual(await rowLayout(),bounds);
      const layout=await phone.evaluate(host=>{
        const toast=host.querySelector('.app-loading-toast'),box=toast.getBoundingClientRect(),frame=host.getBoundingClientRect();
        return {centered:Math.abs((box.left+box.right-frame.left-frame.right)/2)<1 && Math.abs((box.top+box.bottom-frame.top-frame.bottom)/2)<1,fits:toast.scrollWidth<=toast.clientWidth && box.left>=frame.left && box.right<=frame.right};
      });
      assert.deepEqual(layout,{centered:true,fits:true});
      if(viewport.height>500)await phone.screenshot({path:path.join(out,`app-update-loading-${viewport.width}.png`)});
      await resultToast('当前已是最新版本');
    }
    passed.push('Loading Toast stays centered; Info row content and bounds remain unchanged on desktop, narrow phones and landscape');

    await page.setViewportSize({width:1440,height:1000});await open('G01');await choose('available');
    await row.evaluate(el=>{el.click();el.click();el.click();});
    assert.equal(await phone.locator('.app-loading-toast').count(),1);
    await phone.locator('.dynamic-layer').waitFor();
    assert.equal(await phone.locator('.dynamic-layer').count(),1);
    assert.equal(await phone.locator('.app-loading-toast').count(),0);
    assert((await phone.locator('.dialog-card').textContent()).includes('发现新版本'));
    const buttons=await phone.locator('.dynamic-layer .dialog-actions button').evaluateAll(nodes=>nodes.map(el=>({label:el.textContent,rect:el.getBoundingClientRect().toJSON()})));
    assert.deepEqual(buttons.map(b=>b.label),['取消','立即更新']);
    assert(Math.abs(buttons[0].rect.top-buttons[1].rect.top)<1 && buttons[0].rect.right<=buttons[1].rect.left);
    await phone.screenshot({path:path.join(out,'app-update-available.png')});
    await phone.locator('[data-action="dismiss-dialog"]').click();await atInfo();
    assert(await phone.locator('[data-app-update-dot]').isVisible());
    passed.push('Repeated taps create one check and one centered update dialog with horizontal actions');

    for(const [mode,message] of [['offline','网络不可用，请联网后重试'],['timeout','检查更新超时，请重试'],['failure','检查更新失败，请稍后重试']]) {
      await choose(mode);await row.click();await resultToast(message);
      assert(await phone.locator('[data-app-update-dot]').isVisible());
      assert.equal(await phone.locator('[data-app-version]').textContent(),'4.0.0');
    }
    await choose('latest');await row.click();await resultToast('当前已是最新版本');
    assert(await phone.locator('[data-app-update-dot]').isHidden());
    passed.push('Failures remain on Info and retain known version; retry resolves correctly without a false latest result');

    await choose('available');await row.click();
    await phone.locator('[data-tab="device"]').click();
    await page.waitForTimeout(1100);
    assert.equal(await phone.locator('.app-loading-toast,.dynamic-layer,.inline-toast').count(),0);
    await open('G01');assert(await row.isEnabled());
    await row.click();await page.evaluate(()=>UX_REVIEW.closePrototype());
    await open('G01');await page.waitForTimeout(1100);
    assert.equal(await phone.locator('.app-loading-toast,.dynamic-layer,.inline-toast').count(),0);
    assert(await row.isEnabled());
    await page.emulateMedia({reducedMotion:'reduce'});await choose('latest');await row.click();
    assert.equal(await phone.locator('.app-loading-toast .icon').evaluate(el=>getComputedStyle(el).animationName),'none');
    await resultToast('当前已是最新版本');
    passed.push('Leaving or closing cancels loading and stale callbacks; reduced-motion retains readable feedback');
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'app-update-audit.json'),JSON.stringify({passed,errors},null,2));
    console.log(JSON.stringify({passed,errors}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
