const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const {pathToFileURL} = require('url');
const {chromium} = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname,'..');
const out = path.join(__dirname,'checks');
fs.mkdirSync(out,{recursive:true});

(async()=>{
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000},hasTouch:true});
  const errors = [], passed = [];
  page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto(pathToFileURL(path.join(root,'VM_REC_4.0.0_UX展开图.html')).href);
    await page.waitForFunction(()=>window.UX_REVIEW);
    const phone = page.locator('#prototypePhone');
    const open = id=>page.evaluate(id=>UX_REVIEW.openScreen(id),id);
    const at = id=>page.waitForFunction(id=>document.querySelector('#prototypePhone .phone')?.dataset.screenId===id,id,{timeout:8000});
    const go = async id=>{const layers=phone.locator('.sheet-layer');const scope=await layers.count()?layers.last():phone;await scope.locator(`[data-go="${id}"]`).first().click();await at(id);};
    const action = name=>phone.locator(`[data-action="${name}"]`).first().click();
    const reset = ()=>page.locator('[data-command="restart"]').click();
    const selectedPage = (index,selector='#prototypePhone')=>page.waitForFunction(({index,selector})=>{
      const host=document.querySelector(selector),viewport=host.querySelector('.discovered-viewport');
      const dot=host.querySelectorAll('.discovered-dot')[index],bounds=viewport.getBoundingClientRect();
      const cards=[...viewport.querySelectorAll('.found-device-preview')].slice(index,index+2);
      return dot?.getAttribute('aria-current')==='true' && cards.length>0 && cards.every(card=>{
        const rect=card.getBoundingClientRect();
        return rect.left>=bounds.left-1 && rect.right<=bounds.right+1;
      });
    },{index,selector});
    const completeDevices = viewport=>viewport.evaluate(el=>{
      const bounds=el.getBoundingClientRect();
      return [...el.querySelectorAll('.found-device-preview')].filter(card=>{
        const rect=card.getBoundingClientRect();
        return rect.left>=bounds.left-1 && rect.right<=bounds.right+1;
      }).map(card=>{
        const rect=card.getBoundingClientRect();
        return {id:card.dataset.discoveredDevice,complete:[card,...card.querySelectorAll('img,strong')].every(part=>{
          const box=part.getBoundingClientRect();
          return box.left>=rect.left-1 && box.right<=rect.right+1 && box.top>=rect.top-1 && box.bottom<=rect.bottom+1 && part.scrollWidth<=part.clientWidth+1 && part.scrollHeight<=part.clientHeight+1 && (part.tagName!=='IMG' || part.naturalWidth>0);
        })};
      });
    });
    const chooseSaved = async id=>{await open('B03');await go('B04');await phone.locator(`[data-device="${id}"]`).click();await at('B03');};

    assert.equal(await page.locator('#screen-C05,[data-go="C05"]').count(),0);
    assert.equal(await page.locator('.phone .record-status').count(),0);
    assert.equal(await page.locator('#screen-A04 .app-actions').count(),0);
    assert.equal(await page.locator('#screen-D02 [data-go="D04"],#screen-D03 [data-go="D04"]').count(),0);
    const warning=page.locator('#screen-C03 .review-warning');
    assert.equal(await warning.textContent(),'设备设置页面的设置项仅为示例，实际以设备返回为准。');
    assert.equal(await warning.evaluate(el=>getComputedStyle(el).color),'rgb(180, 35, 24)');
    assert.equal(await page.locator('#screen-C03 .phone .review-warning').count(),0);

    for(const width of [1440,390,320]) {
      await page.setViewportSize({width,height:1000});
      await page.evaluate(()=>UX_REVIEW.closePrototype());
      const boardPhone=page.locator('#screen-A05 .phone');
      await selectedPage(0,'#screen-A05');
      assert.deepEqual(await completeDevices(boardPhone.locator('.discovered-viewport')),[{id:'m500-8ab2',complete:true},{id:'m500-3f91',complete:true}]);
      await boardPhone.screenshot({path:path.join(out,`discovered-board-${width}.png`)});
      await open('A05');
      for(const count of [1,2,3]) {
        await page.locator('[data-discovery-count]').selectOption(String(count));
        assert.equal(await phone.locator('.found-device-preview').count(),count);
        assert.equal(await phone.locator('.found-device-preview > .icon').count(),0);
        assert.equal(await phone.locator('.discovered-pagination').isVisible(),count>2);
        assert.equal(await phone.locator('.discovered-dot').count(),Math.max(1,count-1));
        await selectedPage(0);
        const visible=await completeDevices(phone.locator('.discovered-viewport'));
        assert.equal(visible.length,Math.min(2,count));
        assert(visible.every(device=>device.complete),`Both device images and names must fit at ${width}px`);
        assert.equal(await phone.locator('.found-device-preview[tabindex="0"]').count(),Math.min(2,count));
        if(count>2) {
          const lastIndex=count-2;
          await phone.locator('.discovered-dot').last().click();await selectedPage(lastIndex);
          assert.deepEqual(await completeDevices(phone.locator('.discovered-viewport')),[{id:'m500-3f91',complete:true},{id:'s720',complete:true}]);
          await phone.locator('.phone').screenshot({path:path.join(out,`discovered-pair-2-3-${width}.png`)});
          await phone.locator('.discovered-viewport').focus();
          await page.keyboard.press('Home');await selectedPage(0);
          await page.keyboard.press('ArrowRight');await selectedPage(1);
          await page.keyboard.press('End');await selectedPage(lastIndex);
          await page.keyboard.press('ArrowRight');await selectedPage(lastIndex);
          await page.keyboard.press('Home');await selectedPage(0);
        }
        await phone.locator('.app-nav h4').click();
        await page.mouse.move(0,0);
        await phone.locator('.phone').screenshot({path:path.join(out,`discovered-${count}-${width}.png`)});
        const fits=await phone.locator('.phone').evaluate(host=>[...host.querySelectorAll('.app-main,.app-content,.search-card,.found-device-preview strong')].every(el=>el.scrollWidth<=el.clientWidth+2));
        assert(fits,`Discovery content must fit at ${width}px`);
      }
      await open('B04');
      assert.equal(await phone.locator('.saved-device-intro,.saved-device-add').count(),0);
      assert.equal(await phone.getByText('已保存设备',{exact:true}).count(),0);
      assert.equal(await phone.getByText('添加新设备',{exact:true}).count(),0);
      assert.equal(await phone.locator('.saved-device-row').count(),6);
      assert((await phone.locator('.saved-device-main small').allTextContents()).every(text=>text.startsWith('Wi-Fi：')));
      assert.equal(await phone.locator('.sheet-layer').count(),0);
      await page.mouse.move(0,0);
      await phone.locator('.phone').screenshot({path:path.join(out,`saved-devices-clean-${width}.png`)});
      for(const id of ['A04','C01','C03','D01','D02','B06']) {
        await open(id);
        await phone.locator('.phone').screenshot({path:path.join(out,`feedback-${id}-${width}.png`)});
        assert(await phone.locator('.app-main').evaluate(el=>el.scrollWidth<=el.clientWidth+1 && el.scrollHeight<=el.clientHeight+2),`${id} must fit at ${width}px`);
      }
    }
    passed.push('Two complete device images and names fit on the board and preview at 1440/390/320px; 1/2/3 results preserve pagination and keyboard boundaries');

    await page.setViewportSize({width:1440,height:1000});
    await open('A05');
    const viewport=phone.locator('.discovered-viewport');
    const bounds=await viewport.boundingBox();
    await page.mouse.move(bounds.x+bounds.width*.85,bounds.y+bounds.height/2);
    await page.mouse.down();
    await page.mouse.move(bounds.x+bounds.width*.2,bounds.y+bounds.height/2,{steps:12});
    await page.mouse.up();await selectedPage(1);await at('A05');
    passed.push('Mouse drag changes the device without starting a connection');

    await page.setViewportSize({width:390,height:844});
    await open('A05');
    await phone.locator('.discovered-dot').first().click();await selectedPage(0);
    const touchBounds=await viewport.boundingBox();
    const session=await page.context().newCDPSession(page);
    const touchPoint=(x)=>({x:touchBounds.x+touchBounds.width*x,y:touchBounds.y+touchBounds.height/2});
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touchPoint(.85)]});
    for(const x of [.72,.58,.42,.25,.1])await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[touchPoint(x)]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await selectedPage(1);await at('A05');
    await page.emulateMedia({reducedMotion:'reduce'});
    await phone.locator('.discovered-dot').first().click();await selectedPage(0);
    await phone.locator('.discovered-dot').last().click();await selectedPage(1);
    await page.emulateMedia({reducedMotion:'no-preference'});
    passed.push('Native touch swipe and reduced-motion pagination');

    await page.setViewportSize({width:1440,height:1000});
    for(const [index,id,ssid] of [[0,'m500-8ab2','70mai_M500_8ab2'],[0,'m500-3f91','70mai_M500_3f91'],[1,'s720','VM_S720_9A52']]) {
      await phone.locator('.discovered-dot').nth(index).click();await selectedPage(index);
      await phone.locator(`[data-discovered-device="${id}"]`).click();await at('B01');
      assert((await phone.locator('.ios-dialog').textContent()).includes(ssid));
      await go('A05');await selectedPage(index);
    }
    passed.push('Either visible device opens the matching Wi-Fi confirmation and cancelling restores the same pair');
    await phone.locator('.discovered-dot').nth(1).click();await selectedPage(1);
    await phone.locator('[data-discovered-device="m500-3f91"]').click();await at('B01');
    assert((await phone.locator('.ios-dialog').textContent()).includes('70mai_M500_3f91'));
    await go('A05');await selectedPage(1);
    await phone.locator('[data-discovered-device="m500-3f91"]').click();await at('B01');
    await go('B02');
    assert((await phone.locator('.state-hero p').textContent()).includes('70mai_M500_3f91'));
    await at('B03');
    assert.equal(await phone.locator('[data-active-device-ssid]').textContent(),'70mai_M500_3f91');
    await go('B04');
    assert.equal(await phone.locator('[data-device="m500-3f91"]').count(),1);
    passed.push('Same-model devices retain the selected identity through cancel, retry, connection and saved records');

    await reset();await chooseSaved('s720');
    assert.equal(await phone.locator('[data-active-device-state]').textContent(),'未连接');
    await page.waitForTimeout(2200);await at('B03');
    await go('B04');
    assert.equal(await phone.locator('[data-device="m2"] [data-saved-status]').textContent(),'已连接');
    assert.equal(await phone.locator('[data-device="s720"] [data-saved-status]').textContent(),'未连接');
    assert.equal(await phone.locator('[data-device="s720"]').getAttribute('aria-current'),'true');
    await phone.locator('[data-device="s720"]').click();await at('B03');
    await phone.locator('[data-go="D01"]').click();await at('B01');
    assert((await phone.locator('.ios-dialog').textContent()).includes('VM_S720_9A52'));
    assert((await phone.locator('.ios-dialog').textContent()).includes('设备相册'));
    await go('B03');
    assert.equal(await phone.locator('[data-active-device-state]').textContent(),'未连接');
    await phone.locator('[data-go="D01"]').click();await at('B01');await go('B02');
    await phone.getByRole('button',{name:'取消连接',exact:true}).click();await at('B03');
    await page.waitForTimeout(2200);await at('B03');
    assert.equal(await phone.locator('[data-active-device-state]').textContent(),'未连接');
    passed.push('Switching does not connect; album entry verifies selected Wi-Fi; cancelling prevents stale completion');

    for(const [result,width] of [['wifi',1440],['timeout',1440],['mismatch',390],['permission',320],['info',320]]) {
      await page.setViewportSize({width,height:1000});
      await reset();await chooseSaved('s720');
      await phone.locator('[data-go="D01"]').click();await at('B01');
      assert(await phone.locator('.ios-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth));
      await phone.locator('.phone').screenshot({path:path.join(out,`wifi-confirm-${width}.png`)});
      await page.locator('[data-connection-result]').selectOption(result);
      await go('B02');await at('B06');
      assert((await phone.locator('.connection-target').textContent()).includes('VM_S720_9A52'));
      assert.equal(await phone.locator('.step-list .error').count(),1);
      const failedStep=await phone.locator('.step-list .error').textContent();
      assert(failedStep.includes(result==='wifi'?'连接 Wi-Fi':result==='info'?'读取设备信息':'校验记录仪连接'));
      assert.equal(await phone.locator('.album-grid').count(),0);
      assert(await phone.locator('.app-main').evaluate(el=>el.scrollWidth<=el.clientWidth));
      await phone.locator('.phone').screenshot({path:path.join(out,`wifi-gate-${result}.png`)});
      if(result==='timeout') {
        await page.locator('[data-connection-result]').selectOption('success');
        await action('retry-connection');await at('B01');await go('B02');await at('D01');
        await phone.getByRole('button',{name:'返回',exact:true}).click();await at('B03');
        assert.equal(await phone.locator('[data-active-device-name]').textContent(),'VIETMAP S720');
        assert.equal(await phone.locator('[data-active-device-state]').textContent(),'已连接');
        await go('D01');
      } else {
        await action('cancel-connection');await at('B03');
        assert.equal(await phone.locator('[data-active-device-state]').textContent(),'未连接');
      }
    }
    passed.push('Wi-Fi, timeout, wrong-device, permission and device-info failures mark the failed step and block entry; retry resumes the intended album');

    await page.setViewportSize({width:1440,height:1000});
    await reset();await chooseSaved('s720');
    await phone.locator('[data-go="C02"]').click();await at('B01');
    assert((await phone.locator('.ios-dialog').textContent()).includes('设备设置'));
    await phone.locator('.phone').screenshot({path:path.join(out,'settings-wifi-prerequisite.png')});
    await go('B02');await at('C02');
    await phone.locator('.dialog-actions [data-go="B03"]').click();await at('B03');
    await go('C02');await go('C03');
    assert.equal(await phone.locator('[data-active-device-name]').textContent(),'VIETMAP S720');
    await action('exit-settings');await at('B03');
    await page.waitForFunction(()=>!document.querySelector('#prototypePhone .recording-feedback'));
    await go('C01');await action('record');
    await phone.locator('[data-go="C02"]').first().click();await at('C03');
    await action('exit-settings');await at('C01');
    assert.equal(await phone.locator('[data-rec-label]').textContent(),'已暂停');
    passed.push('Settings connects before stop-recording confirmation, preserves cancel origin and prior recording state');

    for(const origin of ['C01','B03']) {
      for(const result of ['failure','timeout']) {
        await reset();await open(origin);await go('C02');await go('C03');
        await page.locator('[data-restore-result]').selectOption(result);
        await action('exit-settings');await at(origin);
        await page.waitForFunction(()=>document.querySelector('#prototypePhone .recording-feedback[role="alert"]'));
        assert(await phone.locator('[data-action="retry-recording"]').isVisible());
        if(origin==='C01')assert.equal(await phone.locator('[data-rec-label]').textContent(),'待确认');
        await phone.locator('.phone').screenshot({path:path.join(out,`restore-${origin}-${result}.png`)});
        await page.locator('[data-restore-result]').selectOption('success');
        await action('retry-recording');
        await page.waitForFunction(()=>!document.querySelector('#prototypePhone .recording-feedback'));
        await at(origin);
        if(origin==='C01')assert.equal(await phone.locator('[data-rec-label]').textContent(),'REC');
      }
    }
    await reset();await go('C02');await go('C03');
    await page.evaluate(()=>{
      document.querySelector('#prototypePhone [data-action="exit-settings"]').click();
      document.querySelector('#prototypePhone .device-switch').click();
      document.querySelector('#prototypePhone [data-device="s720"]').click();
    });
    await page.waitForTimeout(1100);await at('B03');
    assert.equal(await phone.locator('[data-active-device-name]').textContent(),'VIETMAP S720');
    assert.equal(await phone.locator('.recording-feedback').count(),0);
    await open('C01');
    assert.equal(await phone.locator('[data-rec-label]').textContent(),'已暂停');
    passed.push('Settings returns immediately; restore failures and timeouts retry on the source page; device switches invalidate old restore results');

    await reset();await open('D01');
    assert.deepEqual(await phone.locator('.category-tabs button').allTextContents(),['视频','紧急','图片']);
    await action('select-clips');await phone.locator('.clip').first().click();
    await phone.getByRole('button',{name:'紧急',exact:true}).click();
    assert.equal(await phone.locator('.selection-bar,.clip.selected').count(),0);
    assert.equal(await phone.locator('.clip:visible').count(),2);
    await phone.getByRole('button',{name:'图片',exact:true}).click();
    assert.equal(await phone.locator('.clip:visible').count(),6);
    assert.equal(await phone.locator('.clip-thumb > .icon:visible').count(),0);
    await phone.locator('.clip').first().click();await at('F06');
    assert(await phone.locator('[data-action="download-photo"]').isVisible());
    await open('D01');await phone.getByRole('button',{name:'图片',exact:true}).click();
    await phone.getByRole('button',{name:'视频',exact:true}).click();
    await phone.locator('.clip').first().click();await at('D04');
    await open('F01');await phone.getByRole('button',{name:'锁定',exact:true}).click();
    assert.equal(await phone.locator('.clip:visible').count(),2);
    await phone.getByRole('button',{name:'照片',exact:true}).click();
    assert.equal(await phone.locator('.clip:visible').count(),6);
    await open('D02');await phone.locator('[data-action="timeline"]').fill('41');
    assert.equal(await phone.locator('.video-time').textContent(),'12:41:00');
    await go('D03');assert.equal(await phone.locator('.video-time').textContent(),'12:41:00');
    assert.equal(await phone.locator('[data-go="D04"]').count(),0);
    await action('play');assert(await phone.getByRole('button',{name:'播放',exact:true}).isVisible());
    passed.push('Three album tabs preserve file type and clear stale selection; timeline playback works without the removed button');

    await reset();await open('A05');
    await phone.locator('[data-manual-entry]').click();await at('A06');
    await phone.getByRole('checkbox').check();await go('A07');
    await phone.getByRole('checkbox').check();await go('B02');
    await page.locator('[data-connection-result]').selectOption('timeout');await at('B06');
    await page.locator('[data-connection-result]').selectOption('success');
    await action('retry-connection');await at('B02');
    assert.equal(await phone.locator('.state-hero h5').textContent(),'正在验证记录仪连接');
    await at('B03');
    passed.push('Manual Wi-Fi retry rechecks the current network and keeps the manual flow');

    await reset();await chooseSaved('s720');
    await phone.locator('[data-go="D01"]').click();await at('B01');await go('B02');
    await open('B04');await phone.locator('[data-device="m1"]').click();await at('B03');
    await page.waitForTimeout(2300);
    assert.equal(await phone.locator('[data-active-device-name]').textContent(),'VIETMAP M1');
    assert.equal(await phone.locator('[data-active-device-state]').textContent(),'未连接');
    await at('B03');
    passed.push('Leaving a connection and selecting another device invalidates the old task');
    assert.deepEqual(errors,[]);
    const report={passed,errors};
    fs.writeFileSync(path.join(out,'device-flow-audit.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report));
  } finally {
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
