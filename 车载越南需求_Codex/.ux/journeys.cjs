const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const {pathToFileURL} = require('url');
const {chromium} = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
const out=path.join(__dirname,'checks');

(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const errors=[],passed=[];
  page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto(pathToFileURL(path.join(root,'VM_REC_4.0.0_UX展开图.html')).href);
    await page.waitForFunction(()=>window.UX_REVIEW);
    const phone=page.locator('#prototypePhone');
    const open=async id=>{await page.evaluate(id=>UX_REVIEW.openScreen(id),id);};
    const at=async id=>{await page.waitForFunction(id=>document.querySelector('#prototypePhone .phone')?.dataset.screenId===id,id,{timeout:12000});};
    const clickGo=async id=>{const overlay=phone.locator('.sheet-layer');const scope=await overlay.count()?overlay.last():phone;await scope.locator(`[data-go="${id}"]`).first().click();await at(id);};
    const action=async name=>phone.locator(`[data-action="${name}"]`).first().click();

    assert(!fs.readFileSync(path.join(root,'VM_REC_4.0.0_UX展开图.html'),'utf8').includes('showDeviceSwitcher'));
    await page.locator('#screen-B03 .device-switch').click();await at('B04');
    assert.equal(await page.locator('#screen-B03 .sheet-layer').count(),0);
    assert.equal(await phone.locator('.sheet-layer').count(),0);
    assert.equal(await phone.locator('.app-nav h4').textContent(),'切换设备');
    await phone.locator('.saved-device-row[data-device="s720"]').click();await at('B03');
    assert.equal(await phone.locator('[data-active-device-state]').textContent(),'未连接');
    await page.locator('[data-command="restart"]').click();
    await page.locator('[data-command="close-prototype"]').click();
    passed.push('展开图内点击设备名称进入 B04 独立页面；无切换弹窗，选设备不连接 Wi-Fi');

    await page.locator('[data-section="album"]').click();
    await page.waitForFunction(()=>{const top=document.querySelector('#album').getBoundingClientRect().top-document.querySelector('#viewport').getBoundingClientRect().top;return top>=0&&top<70;},{},{timeout:3000});
    const laneTop=await page.locator('#album').evaluate(el=>el.getBoundingClientRect().top-document.querySelector('#viewport').getBoundingClientRect().top);
    assert(laneTop>=0 && laneTop<70,'Section navigation must locate the chosen flow');
    await page.locator('[data-command="zoom-in"]').click();
    assert.equal(await page.locator('#zoomValue').textContent(),'90%');
    await page.locator('[data-command="zoom-out"]').click();
    await page.locator('#showNotes').uncheck();
    assert(await page.locator('#screen-D02 .screen-note').isHidden());
    await page.locator('#showNotes').check();
    await page.locator('#search').fill('No.24');
    assert(await page.locator('#screen-C03').evaluate(el=>el.classList.contains('search-match')));
    await page.locator('#search').fill('');
    passed.push('流程定位、缩放、注记显隐、需求编号搜索');

    for(const width of [1440,390,320]) {
      await page.setViewportSize({width,height:1000});
      for(const home of ['A02','B03']) {
        await open(home);
        assert.equal(await phone.locator('.app-nav [data-go="G02"]').count(),0);
        const tabs=phone.locator('.bottom-nav');
        assert.deepEqual(await tabs.locator('button').allTextContents(),['设备','Data','信息']);
        await tabs.locator('[data-tab="radar"]').click();await at('G02');
        assert.equal(await phone.locator('.app-nav h4').textContent(),'Data');
        assert.equal(await phone.locator('.app-nav [aria-label="返回"]').count(),0);
        assert.equal(await tabs.locator('[aria-current="page"]').textContent(),'Data');
        assert.equal(await phone.locator('.data-package-row').count(),5);
        assert.equal(await phone.locator('[data-action="refresh-data"],[data-refresh-time]').count(),0);
        await tabs.locator('[data-tab="radar"]').click();
        await at('G02');
        await tabs.locator('[data-tab="info"]').click();await at('G01');
        assert.equal(await phone.locator('.app-nav h4').textContent(),'信息');
        assert.equal(await tabs.locator('[aria-current="page"]').textContent(),'信息');
        await tabs.locator('[data-tab="device"]').click();await at(home);
        assert.equal(await tabs.locator('[aria-current="page"]').textContent(),'设备');
      }
    }
    await page.setViewportSize({width:1440,height:1000});
    await open('A02');
    await phone.locator('.app-nav [aria-label="添加设备"]').click();await at('A03');
    await open('B03');await phone.locator('[data-tab="info"]').click();await at('G01');
    await clickGo('G05');await clickGo('G01');
    assert.equal(await phone.locator('.bottom-nav [aria-current="page"]').textContent(),'信息');
    passed.push('设备 / Data / 信息三项导航在三种宽度下保持顺序、选中状态及空态 / 已连接上下文');

    const assertOverlay=async()=>{
      const audit=await phone.locator('.phone').evaluate(host=>{
        const layer=host.querySelector(':scope > .sheet-layer');
        if(!layer)return {anchored:false};
        const frame=host.getBoundingClientRect(),overlay=layer.getBoundingClientRect(),scale=frame.width/host.offsetWidth;
        const card=layer.querySelector('.dialog-card,.ios-dialog'),rect=card.getBoundingClientRect();
        const centered=layer.classList.contains('app-dialog-layer') || card.classList.contains('ios-dialog');
        const placement=centered ? Math.abs(rect.x+rect.width/2-overlay.x-overlay.width/2)<1 && Math.abs(rect.y+rect.height/2-overlay.y-overlay.height/2)<1 : Math.abs(rect.bottom-overlay.bottom)<1;
        const fits=rect.width<=overlay.width && rect.height<=overlay.height && card.scrollWidth<=card.clientWidth+1;
        const covered=['.statusbar','.app-nav','.home-indicator','.bottom-nav'].map(selector=>host.querySelector(selector)).filter(Boolean).every(el=>{
          const rect=el.getBoundingClientRect();
          const hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
          return layer.contains(hit);
        });
        return {anchored:true,fullBounds:Math.abs(overlay.x-frame.x-host.clientLeft*scale)<1 && Math.abs(overlay.y-frame.y-host.clientTop*scale)<1 && Math.abs(overlay.width-host.clientWidth*scale)<1 && Math.abs(overlay.height-host.clientHeight*scale)<1,placement,fits,covered,backgroundInert:[...host.children].filter(el=>el!==layer).every(el=>el.inert)};
      });
      assert.deepEqual(audit,{anchored:true,fullBounds:true,placement:true,fits:true,covered:true,backgroundInert:true});
    };
    for(const width of [1440,390,320]) {
      await page.setViewportSize({width,height:1000});
      for(const id of ['B01','C02','C04','F04','F05','G05']) {
        await open(id); await assertOverlay();
        if(id==='C02' || id==='C04')await phone.locator('.phone').screenshot({path:path.join(out,`centered-dialog-${id}-${width}.png`)});
      }
      await open('A02');
      assert.equal(await phone.locator('.phone').evaluate(el=>getComputedStyle(el).backgroundImage),'none');
      assert.equal(await phone.locator('.phone').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
      assert.equal(await phone.locator('.app-nav').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
      assert.equal(await phone.locator('.app-nav').evaluate(el=>getComputedStyle(el).boxShadow),'none');
      await phone.locator('.phone').screenshot({path:path.join(out,`white-home-${width}.png`)});
      await open('A02');await phone.locator('.app-actions [data-go="A03"]').click();await at('A03');
      assert.equal(await phone.locator('.sheet-layer').count(),0);
      assert(await phone.getByText('搜索附近设备',{exact:true}).isVisible());
      assert(await phone.getByRole('button',{name:'开启蓝牙',exact:true}).isVisible());
      await open('B03');
      await phone.locator('.device-switch').click();await at('B04');
      assert.equal(await phone.locator('.app-dialog-layer').count(),0);
      await phone.locator('.phone').screenshot({path:path.join(out,`device-switch-page-${width}.png`)});
      assert.equal(await phone.locator('.saved-device-row').count(),6);
      assert(await phone.locator('.app-content.scroll-content').evaluate(el=>getComputedStyle(el).overflowY==='auto'));
      await phone.locator('.saved-device-row[data-device="s720"]').click();await at('B03');
      assert.equal(await phone.locator('[data-active-device-name]').textContent(),'VIETMAP S720');
      assert.equal(await phone.locator('[data-active-device-ssid]').textContent(),'VM_S720_9A52');
      assert.equal(await phone.locator('[data-active-device-state]').textContent(),'未连接');
      assert.equal(await phone.locator('.sheet-layer').count(),0);
      await page.waitForTimeout(2200);
      assert.equal(await phone.locator('.phone').getAttribute('data-screen-id'),'B03');
      assert.equal(await phone.locator('.inline-toast').textContent(),'已切换设备；尚未连接 Wi-Fi');
    }
    await page.setViewportSize({width:1440,height:1000});
    await open('C03');
    await phone.locator('[data-setting="loop"]').first().click();await assertOverlay();
    await phone.locator('[data-value="3 分钟"]').click();
    assert.equal(await phone.locator('[inert]').count(),0);
    assert.equal(await phone.locator('[data-setting-value="loop"]').textContent(),'3 分钟');
    await phone.locator('[data-dialog="format"]').click();await assertOverlay();
    await action('confirm-dialog');assert.equal(await phone.locator('[inert]').count(),0);
    await open('D02');await action('calendar');await assertOverlay();
    await phone.locator('input[type=date]').fill('2026-09-09');await action('set-date');
    assert.equal(await phone.locator('[inert]').count(),0);
    assert.equal(await phone.locator('[data-date-label]').textContent(),'09/09/2026');
    passed.push('三种宽度下全屏遮罩覆盖标题和底部；白底首页、设备切换、弹窗关闭与设置保存');

    for(const width of [1440,390,320]) {
      await page.setViewportSize({width,height:1000});
      for(const origin of ['A04','A05','X01','X02']) {
        await open(origin);await phone.locator('[data-manual-entry]').click();await at('A06');
        assert(await phone.getByRole('button',{name:'下一步',exact:true}).isDisabled());
        assert(!(await phone.getByRole('checkbox').isChecked()));
        if(origin==='A04') {
          await page.waitForTimeout(2200);
          assert.equal(await phone.locator('.phone').getAttribute('data-screen-id'),'A06');
        }
        await phone.getByRole('checkbox').check();await clickGo('A07');
        await phone.getByRole('button',{name:'返回',exact:true}).click();await at('A06');
        assert(await phone.getByRole('checkbox').isChecked());
        await phone.getByRole('button',{name:'返回',exact:true}).click();await at(origin);
      }
      await open('A05');await phone.locator('[data-manual-entry]').click();await at('A06');
      await phone.locator('.phone').screenshot({path:path.join(out,`manual-install-${width}.png`)});
      await phone.getByRole('checkbox').check();
      assert(await phone.getByRole('button',{name:'下一步',exact:true}).isEnabled());
      await phone.getByRole('checkbox').uncheck();
      assert(await phone.getByRole('button',{name:'下一步',exact:true}).isDisabled());
      await phone.getByRole('checkbox').check();await clickGo('A07');
      assert(await phone.getByRole('button',{name:'下一步',exact:true}).isDisabled());
      await phone.locator('.phone').screenshot({path:path.join(out,`manual-wifi-${width}.png`)});
      await phone.getByRole('checkbox').check();
      await phone.getByRole('button',{name:'返回',exact:true}).click();await at('A06');
      await phone.getByRole('checkbox').uncheck();await phone.getByRole('checkbox').check();await clickGo('A07');
      assert(!(await phone.getByRole('checkbox').isChecked()));
      await phone.getByRole('checkbox').check();
      await phone.locator('.phone').screenshot({path:path.join(out,`manual-wifi-ready-${width}.png`)});
      await clickGo('B02');
      assert.equal(await phone.locator('.state-hero h5').textContent(),'正在验证记录仪连接');
      assert.equal(await phone.locator('.sheet-layer').count(),0);
      await phone.getByRole('button',{name:'取消连接',exact:true}).click();await at('A07');
      await page.waitForTimeout(2200);
      assert.equal(await phone.locator('.phone').getAttribute('data-screen-id'),'A07');
      await clickGo('B02');await at('B03');
    }
    passed.push('四个手动入口接入两步引导：确认门槛、回退保留、重新进入重置、扫描取消、校验取消及成功闭环');

    await page.setViewportSize({width:1440,height:1000});
    await open('A02');await clickGo('A03');
    assert.equal(await phone.locator('.sheet-layer').count(),0);
    assert(await phone.getByText('搜索附近设备',{exact:true}).isVisible());
    await clickGo('X01');await phone.locator('[data-manual-entry]').click();await at('A06');
    await phone.getByRole('checkbox').check();await clickGo('A07');await phone.getByRole('checkbox').check();await clickGo('B02');await at('B03');
    await open('A05');await clickGo('B01');await clickGo('A05');await clickGo('B01');await clickGo('B02');await at('B03');
    passed.push('拒绝蓝牙可经手动引导连接；选择发现的设备仍经系统 Wi-Fi 确认连接');

    await open('C01'); await clickGo('C02'); await clickGo('C03');
    await action('choose-setting'); await at('C04');
    await phone.locator('[data-value="2K · 30fps"]').click(); await at('C03');
    assert.equal(await phone.locator('[data-setting-value="resolution"]').textContent(),'2K · 30fps');
    await action('exit-settings'); await at('C01');
    await page.waitForFunction(()=>document.querySelector('#prototypePhone [data-rec-label]')?.textContent==='REC');
    await action('record');
    await phone.locator('[data-go="C02"]').first().click(); await at('C03');
    await action('exit-settings'); await at('C01');
    assert.equal(await phone.locator('[data-rec-label]').textContent(),'已暂停');
    passed.push('设置保存、原先录像中则恢复，原先停录则保持停录');

    await open('D02');
    await phone.locator('[data-action="timeline"]').fill('40');
    await clickGo('D03');
    assert.equal(await phone.locator('[data-timeline-label]').textContent(),'12:40');
    await clickGo('X04');assert(await phone.getByText('车内摄像头未连接').isVisible());
    await clickGo('D02');
    assert.equal(await phone.locator('[data-timeline-label]').textContent(),'12:40');
    await clickGo('D01');
    assert.equal(await phone.locator('.channel-segment').count(),0);
    passed.push('时间轴换通道保留定位，列表无通道筛选，缺失通道可恢复');

    await open('D04');
    assert.equal(await phone.locator('.route-map').count(),0);
    await clickGo('D05');await clickGo('D04');await clickGo('D05');await at('D06');await clickGo('F02');
    assert.equal(await phone.locator('.route-map').count(),1);
    assert.equal(await phone.locator('.speed-watermark').count(),1);
    passed.push('设备回放无地图，下载可取消/重试，成功后进入本地回放');

    await clickGo('F03');
    await phone.locator('[data-action="share-duration"]').fill('20');
    assert.equal(await phone.locator('[data-duration-output]').textContent(),'20 秒');
    await clickGo('F04');
    assert.equal(await phone.locator('[data-share-summary]').textContent(),'20 秒 · 4K · 60 MB');
    await action('share-system');
    assert((await phone.locator('.inline-toast').textContent()).includes('未实际发布'));
    await clickGo('F02');await clickGo('F05');await action('delete-local');await at('F01');
    assert((await phone.locator('.hint').textContent()).includes('17 个文件'));
    passed.push('分享片段时长贯穿系统分享，删除本地文件不指向设备删除');

    await phone.getByRole('button',{name:'照片',exact:true}).click();
    await phone.locator('.clip').first().click();await at('F06');
    assert(await phone.locator('[data-action="share-photo"]').isVisible());
    await open('D01'); await phone.getByRole('button',{name:'图片',exact:true}).click();
    await phone.locator('.clip').first().click();await at('F06');
    assert(await phone.locator('[data-action="download-photo"]').isVisible());
    await action('download-photo');
    assert(await phone.locator('[data-action="share-photo"]').isVisible());
    passed.push('照片分支区分设备下载与本地分享');

    await open('E01');await clickGo('E02');await at('E03');await clickGo('E04');await at('E05');await at('E06');await clickGo('B03');
    assert.equal(await phone.locator('.update-row').count(),0);
    await open('X06');
    assert(await phone.getByText('暂时无法确认更新结果').isVisible());
    passed.push('固件完整升级链路与提醒清理，异常不显示成功');

    await open('G06');await action('submit-feedback');
    assert.equal(await phone.locator('.inline-toast').textContent(),'请填写问题描述');
    await phone.locator('[data-feedback-message]').fill('设备连接后无法加载预览画面');
    await action('submit-feedback');
    assert.equal(await phone.locator('.inline-toast').textContent(),'请输入手机号或邮箱');
    await phone.locator('[data-feedback-contact]').fill('invalid');await action('submit-feedback');
    assert.equal(await phone.locator('.inline-toast').textContent(),'请填写有效的手机号或邮箱');
    await phone.locator('[data-feedback-contact]').fill('pm@example.com');await action('submit-feedback');
    assert((await phone.locator('.inline-toast').textContent()).includes('未发送'));
    await open('G05');await action('clear-cache');await at('G01');
    assert((await phone.locator('.list-row').filter({hasText:'清除缓存'}).textContent()).includes('0 MB'));
    passed.push('反馈必填/邮箱校验，不发送数据；清缓存保留本地文件');

    await open('G01');
    await page.locator('[data-app-update-result]').selectOption('latest');
    await action('check-app-update');
    await phone.locator('.inline-toast').waitFor();
    assert.equal(await phone.locator('.inline-toast').textContent(),'当前已是最新版本');
    await page.locator('[data-app-update-result]').selectOption('available');
    await action('check-app-update');
    await phone.locator('.dynamic-layer').waitFor();
    assert((await phone.locator('.dynamic-layer').textContent()).includes('发现新版本'));
    assert.equal(await phone.locator('.dynamic-layer [data-action="dismiss-dialog"]').count(),1);
    await phone.locator('.dynamic-layer [data-action="dismiss-dialog"]').click();
    await at('G01');
    await phone.locator('[data-go="G03"]').click();await at('G03');
    assert.equal(await phone.locator('.map-download-card').count(),1);
    assert.equal(await phone.locator('.offline-map-row').count(),3);
    await phone.locator('.offline-map-row').first().click();
    assert(await phone.locator('.dynamic-layer').textContent().then(text=>text.includes('离线地图详情')));
    await phone.locator('.dynamic-layer [data-action="dismiss-dialog"]').click();
    await open('G01');await page.locator('[data-app-update-result]').selectOption('offline');
    await action('check-app-update');await phone.locator('.inline-toast').waitFor();
    assert.equal(await phone.locator('.inline-toast').textContent(),'网络不可用，请联网后重试');
    passed.push('Info 页内 App Update 覆盖最新 Toast、新版居中弹窗和网络错误');

    await page.evaluate(()=>UX_REVIEW.closePrototype());
    await page.setViewportSize({width:390,height:844});
    await page.locator('[data-command="menu"]').click();
    assert(await page.locator('#sidebar').evaluate(el=>el.classList.contains('open')));
    await page.locator('[data-section="local"]').click();
    assert(!(await page.locator('#sidebar').evaluate(el=>el.classList.contains('open'))));
    await open('F03');
    assert((await page.locator('#prototypeDialog').boundingBox()).width<=390);
    await phone.locator('[data-action="share-duration"]').fill('35');
    await clickGo('F04');
    assert((await phone.locator('[data-share-summary]').textContent()).startsWith('35 秒'));
    passed.push('手机目录、单页预览与分享控件可操作');

    assert.deepEqual(errors,[]);
    await page.evaluate(()=>UX_REVIEW.closePrototype());
    await page.setViewportSize({width:1680,height:1060});
    await page.evaluate(()=>{UX_REVIEW.setZoom(.9);document.querySelector('#viewport').scrollTo({top:0,left:0,behavior:'instant'});});
    await page.screenshot({path:path.join(root,'VM_REC_UX_预览.png')});
    await page.pdf({path:path.join(out,'print-check.pdf'),printBackground:true,preferCSSPageSize:true});
    fs.writeFileSync(path.join(out,'journey-audit.json'),JSON.stringify({passed,errors},null,2));
    console.log(JSON.stringify({passed,errors}));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
