const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(__dirname,'checks');

(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const errors=[],passed=[];
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname,'..','VM_REC_4.0.0_UX展开图.html')).href);
    await page.waitForFunction(()=>window.UX_REVIEW);
    const phone=page.locator('#prototypePhone .phone');
    const open=id=>page.evaluate(id=>UX_REVIEW.openScreen(id),id);
    const row=id=>phone.locator(`[data-package-id="${id}"]`);
    const download=id=>row(id).locator('[data-action="download-data"]').click();
    const choose=value=>page.locator('[data-data-result]').selectOption(value);
    const atStatus=(id,status)=>page.waitForFunction(({id,status})=>document.querySelector(`#prototypePhone [data-package-id="${id}"]`)?.dataset.status===status,{id,status});
    const restart=async()=>{await page.locator('[data-command="restart"]').click();await open('G02');};

    await open('G02');
    for(const viewport of [{width:1440,height:1000},{width:375,height:812},{width:320,height:780}]) {
      await page.setViewportSize(viewport);
      assert.equal(await phone.locator('.data-package-row').count(),5);
      assert.equal(await phone.locator('.data-package-version').count(),5);
      assert.equal(await phone.locator('input,img,[data-action="refresh-data"],[data-refresh-time]').count(),0);
      assert.equal(await phone.locator('.bottom-nav [aria-current="page"]').textContent(),'Data');
      const fits=await phone.evaluate(host=>[...host.querySelectorAll('.data-package-row,.data-package-main,.data-package-row .btn')].every(el=>el.scrollWidth<=el.clientWidth+1));
      assert(fits,'Data rows must not overflow on narrow phones');
      await phone.screenshot({path:path.join(out,`data-idle-${viewport.width}.png`)});
    }
    passed.push('Data contains per-model versions and single-item downloads; unsupported fields and controls are absent at all three widths');

    await page.setViewportSize({width:1440,height:1000});
    const unchanged=await row('m1').elementHandle();
    await row('m2').locator('button').evaluate(el=>{el.click();el.click();el.click();});
    await atStatus('m2','downloading');
    assert(await row('m2').locator('button').isDisabled());
    await row('m1').locator('button').focus();
    await atStatus('m2','checking');
    assert.equal(await row('m2').locator('[role="progressbar"]').getAttribute('aria-valuenow'),'100');
    assert(await unchanged.evaluate(el=>el.isConnected && el.contains(document.activeElement)));
    await atStatus('m2','downloaded');
    assert(await row('m2').locator('button').isDisabled());
    assert.equal(await row('m2').locator('[role="progressbar"]').count(),0);
    assert.equal(await row('m1').getAttribute('data-status'),'idle');
    assert.equal(await phone.getAttribute('data-screen-id'),'G02');
    assert.equal(await phone.locator('.sheet-layer').count(),0);
    await phone.locator('[data-tab="info"]').click();
    await phone.locator('[data-tab="radar"]').click();
    assert.equal(await row('m2').getAttribute('data-status'),'downloaded');
    await phone.screenshot({path:path.join(out,'data-downloaded.png')});
    passed.push('Repeated requests are guarded, progress only changes the selected row, and completion persists after navigating away and back');

    await page.evaluate(()=>{DATA_PACKAGES.find(item=>item.id==='m2').version='2026.10';UX_REVIEW.openScreen('G02');});
    assert.equal(await row('m2').getAttribute('data-status'),'idle');
    assert(await row('m2').locator('button').isEnabled());
    await choose('offline');await download('m2');await atStatus('m2','error');
    await page.evaluate(()=>{DATA_PACKAGES.find(item=>item.id==='m2').version='2026.09';UX_REVIEW.openScreen('G02');});
    assert.equal(await row('m2').getAttribute('data-status'),'downloaded');
    passed.push('A new package version can be downloaded without overwriting the valid older package state');

    for(const [mode,message] of [['offline','网络不可用，请联网后重试'],['storage','存储空间不足，请清理后重试'],['integrity','数据包校验失败，请重新下载']]) {
      await restart();await choose(mode);await download('m1');await atStatus('m1','error');
      assert.equal(await row('m1').locator('[role="status"]').textContent(),message);
      assert(await row('m1').locator('button').isEnabled());
      assert.equal(await row('m1').locator('[role="progressbar"]').count(),0);
      assert.equal(await phone.getAttribute('data-screen-id'),'G02');
      await phone.screenshot({path:path.join(out,`data-error-${mode}.png`)});
      await choose('success');await download('m1');await atStatus('m1','downloaded');
    }
    passed.push('Network, storage and integrity failures show distinct row-level errors and can retry successfully');

    await restart();await choose('success');await download('m2');
    await choose('offline');await download('s720');
    await atStatus('s720','error');await atStatus('m2','downloaded');
    assert.equal(await row('m1').getAttribute('data-status'),'idle');
    passed.push('Downloads for different models retain independent outcomes');

    await restart();await download('m2');
    await phone.locator('[data-tab="info"]').click();await page.waitForTimeout(1600);
    assert.equal(await phone.getAttribute('data-screen-id'),'G01');
    await phone.locator('[data-tab="radar"]').click();
    assert.equal(await row('m2').getAttribute('data-status'),'idle');
    await download('m2');await page.evaluate(()=>UX_REVIEW.closePrototype());
    await open('G02');await page.waitForTimeout(1600);
    assert.equal(await row('m2').getAttribute('data-status'),'idle');
    await open('B04');await phone.locator('[data-device="s720"]').click();
    await phone.locator('[data-tab="radar"]').click();await choose('success');
    await download('m2');await atStatus('m2','downloaded');
    assert.equal(await phone.getAttribute('data-screen-id'),'G02');
    assert.equal(await phone.locator('.sheet-layer').count(),0);
    passed.push('Leaving or closing cancels pending demonstration callbacks; Data download does not force a device Wi-Fi connection');

    await restart();await page.setViewportSize({width:320,height:780});
    await choose('storage');await download('m2');await atStatus('m2','error');
    assert(await row('m2').evaluate(el=>el.scrollWidth<=el.clientWidth && el.querySelector('.data-package-main').scrollWidth<=el.querySelector('.data-package-main').clientWidth));
    await phone.screenshot({path:path.join(out,'data-error-320.png')});
    await page.emulateMedia({reducedMotion:'reduce'});await choose('success');await download('m2');
    assert.equal(await row('m2').locator('.icon').evaluate(el=>getComputedStyle(el).animationName),'none');
    await atStatus('m2','downloaded');
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'data-audit.json'),JSON.stringify({passed,errors},null,2));
    console.log(JSON.stringify({passed,errors}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
