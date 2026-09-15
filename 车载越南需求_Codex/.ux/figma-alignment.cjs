const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const {pathToFileURL} = require('url');
const {chromium} = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out = path.join(__dirname,'checks');

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
    const at=id=>page.waitForFunction(id=>document.querySelector('#prototypePhone .phone')?.dataset.screenId===id,id,{timeout:7000});
    const action=name=>phone.locator(`[data-action="${name}"]`).first().click();
    const go=async id=>{await phone.locator(`[data-go="${id}"]`).first().click();await at(id);};
    await open('B03');
    await page.locator('[data-command="restart"]').click();
    for(const width of [1440,390,320]) {
      await page.setViewportSize({width,height:1000});
      for(const id of ['C01','D01','D02','D04','X04']) {
        await open(id);
        assert.equal(await phone.locator('.route-map').count(),0);
        assert.equal(await phone.getByRole('button',{name:'抓拍',exact:true}).count(),0);
        const audit=await phone.evaluate(host=>{
          const bounded=[...host.querySelectorAll('.app-main,.app-nav,.album-view-switch,.figma-live-tools,.device-file-tools,.device-timeline-panel')];
          return {overflow:bounded.filter(el=>el.scrollWidth>el.clientWidth+1 || el.scrollHeight>el.clientHeight+2).map(el=>el.className),broken:[...host.querySelectorAll('img')].filter(el=>!el.complete||!el.naturalWidth).length};
        });
        assert.deepEqual(audit,{overflow:[],broken:0},`${id} at ${width}px`);
        if(id==='D01') {
          assert.deepEqual(await phone.locator('.category-tabs button').allTextContents(),['视频','紧急','图片']);
          const boxes=await phone.locator('.album-day-grid').first().locator('.clip').evaluateAll(nodes=>nodes.slice(0,3).map(n=>n.getBoundingClientRect().toJSON()));
          assert(boxes.every(r=>Math.abs(r.top-boxes[0].top)<1),'Three thumbnails on one row');
          assert(boxes.every(r=>r.width>85),'Readable thumbnail size');
        }
        await page.mouse.move(0,0);
        await phone.screenshot({path:path.join(out,`figma-${id}-${width}.png`)});
      }
    }
    passed.push('Key layouts fit at desktop/390/320; three-column album, all reference assets, no map or snapshot');
    await page.setViewportSize({width:1440,height:1000});
    await open('C01');
    await action('device-audio');
    assert.equal(await phone.locator('[data-action="device-audio"]').getAttribute('aria-pressed'),'false');
    assert.equal(await phone.locator('[data-rec-label]').textContent(),'REC');
    await action('mirror-video');
    assert(await phone.locator('.device-video-image').evaluate(el=>getComputedStyle(el).transform.startsWith('matrix(-1')));
    await action('calibration');assert(await phone.locator('.calibration-guides').isVisible());
    await action('expand-live-tools');assert.equal(await phone.locator('.secondary-live-tool:visible').count(),0);
    await action('expand-live-tools');assert.equal(await phone.locator('.secondary-live-tool:visible').count(),2);
    await action('live-channel');assert.equal(await phone.locator('.video-channel').getAttribute('aria-label'),'后路');
    await action('switch-player');await phone.locator('[data-player="播放器 1"]').click();
    assert.equal(await phone.locator('.dynamic-layer').count(),0);
    await action('switch-player');assert.equal(await phone.locator('[data-player="播放器 1"] .icon').count(),1);
    await action('dismiss-dialog');
    passed.push('Live toolbar, recording microphone, mirror, guides, camera and player selection retain independent states');

    await open('D01');
    await phone.locator('[data-file-id="clip-7"]').click();await at('D04');
    const filename=await phone.locator('.app-nav h4').textContent();
    assert.match(filename,/_122900_R.MP4$/);
    assert.equal(await phone.locator('.video-channel').getAttribute('aria-label'),'后路');
    const image=await phone.locator('.device-video-image').getAttribute('src');
    await phone.locator('[data-action="seek-video"]').fill('41');
    assert.equal(await phone.locator('.video-time').textContent(),'00:41');
    await action('play');assert.equal(await phone.locator('[data-action="play"]').getAttribute('aria-label'),'播放');
    await action('volume');assert.equal(await phone.locator('[data-action="volume"]').getAttribute('aria-label'),'开启声音');
    await action('fullscreen');
    await page.waitForFunction(()=>document.fullscreenElement?.classList.contains('device-player'));
    await page.evaluate(()=>document.exitFullscreen());
    await go('D05');assert.equal(await phone.locator('.state-hero p').textContent(),filename);
    await go('D04');await go('D05');await at('D06');await go('F02');
    assert.equal(await phone.locator('.file-title-bar strong').textContent(),filename);
    assert.equal(await phone.locator('.video-block > img').getAttribute('src'),image);
    passed.push('Selected file identity and imagery survive playback, seek, fullscreen, download cancel and local playback');

    await open('D01');await action('select-clips');
    assert(await phone.locator('[data-action="download-selected"]').isDisabled());
    for(const id of ['clip-1','clip-4'])await phone.locator(`[data-file-id="${id}"]`).click();
    await action('download-selected');await at('D05');
    assert.equal(await phone.locator('.state-hero p').textContent(),'2 个文件');
    await at('D01');
    for(const id of ['clip-1','clip-4'])assert.equal(await phone.locator(`[data-file-id="${id}"] .clip-downloaded`).count(),1);
    await action('select-clips');await phone.locator('[data-file-id="clip-4"]').click();
    await action('delete-selected');await action('dismiss-dialog');
    assert.equal(await phone.locator('.clip.selected').count(),1);
    await action('delete-selected');await action('confirm-selection-delete');
    assert.equal(await phone.locator('[data-file-id="clip-4"]').count(),0);
    await go('D02');await go('D01');
    assert.equal(await phone.locator('[data-file-id="clip-4"]').count(),0);
    await action('select-clips');await action('select-all');assert.equal(await phone.locator('.clip.selected').count(),7);
    await action('select-all');assert.equal(await phone.locator('.clip.selected').count(),0);
    await phone.getByRole('button',{name:'图片',exact:true}).click();
    assert.equal(await phone.locator('.selection-bar').count(),0);
    const photo=await phone.locator('[data-file-id="clip-2"] img').getAttribute('src');
    await phone.locator('[data-file-id="clip-2"]').click();await at('F06');
    assert.equal(await phone.locator('.app-main img').getAttribute('src'),photo);
    await action('download-photo');
    assert.equal(await phone.locator('.app-main img').getAttribute('src'),photo);
    passed.push('Batch download refreshes exact markers, confirmed deletion persists, category change clears selection, photos retain their media');

    await open('D02');await phone.locator('[data-action="timeline"]').fill('41');await go('D03');
    await phone.locator('[data-date-offset="-1"]').click();
    const date=await phone.locator('[data-date-label]').textContent();
    await action('download-timeline');await at('D05');
    assert.match(await phone.locator('.state-hero p').textContent(),/_124100_R.MP4$/);
    await go('D03');
    assert.equal(await phone.locator('[data-date-label]').textContent(),date);
    assert.equal(await phone.locator('.video-time').textContent(),'12:41:00');
    await page.waitForTimeout(2600);await at('D03');
    await action('select-clips');await at('D01');assert(await phone.locator('.selection-bar').isVisible());
    passed.push('Timeline date and channel bind download identity; cancel preserves location and discards stale completion; selection returns to list');
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'figma-alignment-audit.json'),JSON.stringify({passed,errors},null,2));
    console.log(JSON.stringify({passed,errors}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
