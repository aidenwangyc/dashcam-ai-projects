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
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(path.resolve(__dirname,'..','VM_REC_4.0.0_UX展开图.html')).href);
    await page.waitForFunction(()=>window.UX_REVIEW);
    const phone=page.locator('#prototypePhone .phone');
    const open=id=>page.evaluate(id=>UX_REVIEW.openScreen(id),id);
    const at=id=>page.waitForFunction(id=>document.querySelector('#prototypePhone .phone')?.dataset.screenId===id,id);
    const action=name=>phone.locator(`[data-action="${name}"]`).first().click();
    const proceed=()=>phone.locator('[data-go="F04"]').click();
    const close=()=>action('dismiss-dialog');
    await open('F03');
    await page.locator('[data-share-source]').selectOption('180');
    await phone.locator('[data-action="share-start"]').fill('145');
    assert.equal(await phone.locator('[data-duration-output]').textContent(),'35 秒');
    assert.equal(await phone.locator('[data-end-time]').textContent(),'03:00');
    await phone.locator('[data-action="share-duration"]').fill('20');
    await proceed();assert(await phone.locator('[data-go="F04"]').isDisabled());await at('F04');
    assert.equal(await phone.locator('[data-share-summary]').textContent(),'20 秒 · 4K · 60 MB');
    assert.equal(await phone.locator('[data-share-range]').textContent(),'02:25 - 02:45');
    await open('F03');await page.locator('[data-share-result]').selectOption('failure');
    await proceed();await phone.getByText('生成失败，请重试',{exact:true}).waitFor();
    assert.equal(await phone.locator('[data-share-start]').textContent(),'02:25');
    await page.locator('[data-share-result]').selectOption('success');await proceed();
    await action('cancel-share-export');await at('F02');
    await phone.locator('[data-go="F03"]').click();await page.waitForTimeout(1100);await at('F03');
    assert.equal(await phone.locator('[data-share-start]').textContent(),'02:25');
    await page.locator('[data-share-result]').selectOption('space');await proceed();await at('X05');
    await phone.locator('[data-go="F01"]').click();await at('F01');
    await phone.getByRole('button',{name:'返回',exact:true}).click();await at('X05');
    await phone.locator('[data-go="F03"]').first().click();await at('F03');
    assert.equal(await phone.locator('[data-share-start]').textContent(),'02:25');
    assert.equal(await phone.locator('[data-duration-output]').textContent(),'20 秒');
    passed.push('Share start/duration are clamped to source; summary, failure, retry, cancellation and storage return preserve selection');

    for(const viewport of [{width:1440,height:1000},{width:375,height:812},{width:320,height:780}]){
      await page.setViewportSize(viewport);await open('F03');
      await page.locator('[data-share-source]').selectOption('0.5');
      assert.equal(await phone.locator('[data-duration-output]').textContent(),'0.5 秒');
      assert.equal(await phone.locator('[data-end-time]').textContent(),'00:00.5');
      const fits=await phone.evaluate(host=>[...host.querySelectorAll('.share-content,.app-actions,.range-label,.progress-caption')].every(el=>el.scrollWidth<=el.clientWidth+1));
      assert(fits);await phone.screenshot({path:path.join(out,`handoff-share-${viewport.width}.png`)});
    }
    await page.locator('[data-share-result]').selectOption('success');await proceed();
    await open('G01');await page.waitForTimeout(1100);await at('G01');
    passed.push('Sub-second sources and narrow viewports work; navigating away cancels stale export callbacks');

    await page.setViewportSize({width:1440,height:1000});await open('C01');
    await phone.locator('[data-go="F01"]').click();await at('F01');
    await phone.getByRole('button',{name:'返回',exact:true}).click();await at('C01');
    await open('X05');await phone.locator('[data-go="F01"]').click();
    await phone.getByRole('button',{name:'返回',exact:true}).click();await at('X05');
    passed.push('Local album returns to preview or storage task according to entry source');

    await open('G03');
    await phone.locator('[data-action="map-details"][data-map-id="vn"]').click();
    await action('delete-map');await close();
    assert.equal(await phone.locator('.offline-map-row').count(),3);
    await phone.locator('[data-action="map-details"][data-map-id="vn"]').click();
    await action('delete-map');await action('confirm-map-delete');
    assert.equal(await phone.locator('.offline-map-row').count(),2);
    await action('download-map');assert(await phone.locator('[data-action="start-map-download"][data-map-id="hcm"]').isDisabled());
    await phone.locator('[data-action="start-map-download"][data-map-id="vn"]').click();
    await phone.getByText('地图已下载',{exact:true}).waitFor();
    assert.equal(await phone.locator('.offline-map-row').count(),3);
    await page.locator('[data-map-catalog]').selectOption('update');
    await phone.locator('[data-action="map-details"][data-map-id="hn"]').click();
    await page.locator('[data-map-result]').selectOption('integrity');await action('start-map-download');
    await phone.getByText('地图包校验失败，请重新下载',{exact:true}).waitFor();await close();
    await phone.locator('[data-action="map-details"][data-map-id="hn"]').click();
    assert((await phone.locator('.dialog-card').textContent()).includes('2026.08'));
    await page.locator('[data-map-result]').selectOption('success');await action('start-map-download');
    await phone.getByText('地图已下载',{exact:true}).waitFor();
    await phone.locator('[data-action="map-details"][data-map-id="hn"]').click();
    assert((await phone.locator('.dialog-card').textContent()).includes('2026.09'));await close();
    passed.push('Map deletion requires confirmation, downloads avoid duplicates, and failed updates retain the older package');

    for(const [mode,message] of [['offline','网络不可用，请联网后重试'],['storage','存储空间不足，请清理后重试'],['integrity','地图包校验失败，请重新下载']]) {
      await page.locator('[data-map-catalog]').selectOption('empty');
      await page.locator('[data-map-result]').selectOption(mode);await action('download-map');
      await phone.locator('[data-action="start-map-download"][data-map-id="vn"]').click();
      await phone.getByText(message,{exact:true}).waitFor();
      assert.equal(await phone.locator('.offline-map-row').count(),0);
      await page.locator('[data-map-result]').selectOption('success');await action('start-map-download');
      await phone.getByText('地图已下载',{exact:true}).waitFor();
      assert.equal(await phone.locator('.offline-map-row').count(),1);
    }
    await page.locator('[data-map-catalog]').selectOption('empty');await action('download-map');
    await phone.locator('[data-action="start-map-download"][data-map-id="vn"]').click();
    await action('cancel-map-download');await page.waitForTimeout(1300);
    assert.equal(await phone.locator('.offline-map-row').count(),0);
    await action('download-map');await phone.locator('[data-action="start-map-download"][data-map-id="vn"]').click();
    await open('G01');await page.waitForTimeout(1300);await open('G03');
    assert.equal(await phone.locator('.offline-map-row').count(),0);
    passed.push('Map errors retry; cancellation and navigation never create false completed downloads');
    for(const width of [1440,375,320]){
      await page.setViewportSize({width,height:1000});await action('download-map');
      assert(await phone.locator('.dialog-card').evaluate(el=>el.scrollWidth<=el.clientWidth));
      await phone.screenshot({path:path.join(out,`handoff-map-picker-${width}.png`)});await close();
    }
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'handoff-audit.json'),JSON.stringify({passed,errors},null,2));
    console.log(JSON.stringify({passed,errors}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
