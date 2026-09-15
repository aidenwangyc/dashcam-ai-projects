'use strict';
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function icon(name, cls = '') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.Circle}</svg>`; }
function hydrateIcons(parent = document) { $$('[data-icon]', parent).forEach(el => el.outerHTML = icon(el.dataset.icon)); }
function button(label, target, variant = 'primary', glyph = '') { return `<button class="btn ${variant}" data-go="${target}">${glyph ? icon(glyph) : ''}${label}</button>`; }
function actionButton(label, action, variant = 'secondary', glyph = '') { return `<button class="btn ${variant}" data-action="${action}">${glyph ? icon(glyph) : ''}${label}</button>`; }
function tool(glyph, label, target, extra = '') { return `<button class="tool" ${target ? `data-go="${target}"` : extra} aria-label="${label}" title="${label}">${icon(glyph)}</button>`; }
function nav(title, back = 'B03', actions = '') { return `<div class="app-nav ${back ? 'app-nav--page' : 'app-nav--root'}">${back ? tool('ChevronLeft','返回',back) : ''}<h4>${title}</h4><div class="nav-actions">${actions || '<span class="nav-spacer"></span>'}</div></div>`; }
function homeNav() { return `<div class="app-nav app-nav--home"><h4 class="app-brand">VIETMAP REC</h4><div class="nav-actions">${tool('Plus','添加设备','A03')}</div></div>`; }
function connectedHomeNav(name = 'VIETMAP M2') { return `<div class="app-nav app-nav--home"><button class="device-switch" data-go="B04" aria-label="切换设备" title="切换设备"><span data-active-device-name>${name}</span>${icon('ChevronDown')}</button><div class="nav-actions">${tool('Plus','添加设备','A04')}</div></div>`; }
function bottomNav(active = 'device', deviceHome = 'B03') {
  return `<nav class="bottom-nav" aria-label="主导航">${[['device','设备','Camera',deviceHome],['radar','Data','Database','G02'],['info','信息','Info','G01']].map(([key,label,glyph,target])=>`<button class="${active===key?'active':''}" data-tab="${key}" data-go="${target}" ${active===key?'aria-current="page"':''}>${icon(glyph)}<span>${label}</span></button>`).join('')}</nav>`;
}
function actions(content) { return `<div class="app-actions">${content}</div>`; }
function content(body, cls = '') { return `<div class="app-content ${cls}">${body}</div>`; }
function banner(text, type = '') { return `<div class="app-banner ${type}">${icon(type === 'info' ? 'Info' : 'CircleAlert')}<span>${text}</span></div>`; }
function state(glyph, title, description, type = '', extra = '') { return `<div class="state-hero"><div class="state-icon ${type}">${icon(glyph)}</div><h5>${title}</h5>${description ? `<p>${description}</p>` : ''}${extra}</div>`; }
function progress(value, left, right = '') { return `<div class="progress-track"><span style="width:${value}%"></span></div><div class="progress-caption"><span>${left}</span><span>${right}</span></div>`; }
function row(label, value = '', glyph = '', target = '', attrs = '') { const tag = target || attrs ? 'button' : 'div'; return `<${tag} class="list-row" ${target ? `data-go="${target}"` : ''} ${attrs}>${glyph ? icon(glyph) : ''}<span class="row-main">${label}</span>${value ? `<span class="row-value">${value}</span>` : ''}${target || attrs ? icon('ChevronRight','chevron') : ''}</${tag}>`; }
function setting(label, value, name) { return `<button class="list-row" data-action="choose-setting" data-setting="${name}"><span class="row-main">${label}</span><span class="row-value" data-setting-value="${name}">${value}</span>${icon('ChevronRight','chevron')}</button>`; }
function toggleRow(label, on = true) { return `<div class="list-row"><span class="row-main">${label}</span><button role="switch" aria-label="${label}" aria-checked="${on}" class="switch ${on ? 'on' : ''}" data-action="toggle"></button></div>`; }
function steps(items) { return `<div class="step-list">${items.map(([label,status]) => `<div class="${status}">${icon(status === 'done' ? 'CircleCheck' : status === 'current' ? 'LoaderCircle' : status === 'error' ? 'CircleX' : 'Circle')}${label}${status==='error'?'<span class="step-error-label">失败</span>':''}</div>`).join('')}</div>`; }
const CONNECTION_ERRORS = {
  wifi:['设备连接失败','未能加入记录仪 Wi-Fi。请检查记录仪电源、Wi-Fi 开关及密码后重试。',0],
  timeout:['连接超时','未收到目标记录仪的响应。请检查电源、Wi-Fi 和距离后重试。',1],
  mismatch:['连接的设备不匹配','当前网络不是目标记录仪。请连接下方 Wi-Fi 后重试。',1],
  permission:['无法访问记录仪','本地网络权限未开启。请在手机系统设置中允许访问后重试。',1],
  info:['设备信息读取失败','已连接记录仪，但未能读取必要设备信息。请保持连接并重试。',2]
};
function connectionFailureBody(device,error='wifi') {
  const [title,description,failedStep]=CONNECTION_ERRORS[error] || CONNECTION_ERRORS.wifi;
  return content(state('WifiOff',title,description,'error')+`<div class="connection-target"><strong>${esc(device.name)}</strong><span>Wi-Fi：${esc(device.ssid)}</span></div>`+steps(['连接 Wi-Fi','校验记录仪连接','读取设备信息'].map((label,index)=>[label,index<failedStep?'done':index===failedStep?'error':''])))+actions(actionButton('重试连接','retry-connection','primary','RefreshCw')+actionButton('取消连接','cancel-connection','outline'));
}
function manualWifiEntry(variant = 'row') {
  return variant==='row' ? row('手动连接 Wi-Fi','','Wifi','A06','data-manual-entry') : `<button class="btn ${variant}" data-go="A06" data-manual-entry>${icon('Wifi')}手动连接 Wi-Fi</button>`;
}
function manualActions(key, label, target) {
  return `<div class="app-actions manual-actions"><label class="manual-confirm"><input type="checkbox" data-manual-confirm="${key}"><span>${label}</span></label><button class="btn primary" data-go="${target}" data-manual-next="${key}" disabled>下一步${icon('ArrowRight')}</button></div>`;
}
function deviceChoice(name = 'VIETMAP M2', connected = false, target = 'B01') { return `<button class="device-choice" data-go="${target}"><img src="${ASSETS.device}" alt="记录仪参考外观"><span class="choice-main"><strong>${name}</strong><small>${connected ? '已连接 · VM_M2_82C1' : '蓝牙可用 · Wi-Fi 记录仪'}</small></span>${icon(connected ? 'Check' : 'ChevronRight')}</button>`; }
const SAVED_DEVICES = [
  {id:'m2',name:'VIETMAP M2',ssid:'VM_M2_82C1',status:'已连接'},
  {id:'s720',name:'VIETMAP S720',ssid:'VM_S720_9A52'},
  {id:'m1',name:'VIETMAP M1',ssid:'VM_M1_31D8'},
  {id:'s860',name:'VIETMAP S860',ssid:'VM_S860_44A1',status:'离线'},
  {id:'l110',name:'VIETMAP L110',ssid:'VM_L110_76C0'},
  {id:'m3',name:'VIETMAP M3',ssid:'VM_M3_08F2'}
];
const DISCOVERED_DEVICES = [
  {id:'m500-8ab2',name:'70mai M500',ssid:'70mai_M500_8ab2'},
  {id:'m500-3f91',name:'70mai M500',ssid:'70mai_M500_3f91'},
  {id:'s720',name:'VIETMAP S720',ssid:'VM_S720_9A52'}
];
function savedDeviceRow({id,name,ssid,status='未连接'}) { const current=status==='已连接'; return `<button class="saved-device-row ${current?'is-current':''}" data-action="select-saved-device" data-device="${esc(id)}" data-status="${esc(status)}"><span class="saved-device-avatar">${icon('Video')}</span><span class="saved-device-main"><strong>${esc(name)}</strong><small>Wi-Fi：${esc(ssid)}</small></span><span class="saved-device-status ${current?'connected':'offline'}" data-saved-status>${current?icon('Check'):''}${status}</span>${icon('ChevronRight','chevron')}</button>`; }
function discoveredCarousel(devices = DISCOVERED_DEVICES) {
  const pageCount=Math.max(1,devices.length-1);
  return `<div class="discovered-carousel" role="region" aria-label="发现的设备" aria-roledescription="轮播"><div class="discovered-viewport" tabindex="0" aria-label="附近设备">${devices.map((device,index)=>`<button class="found-device-preview" data-go="B01" data-discovered-device="${esc(device.id)}" aria-label="连接 ${esc(device.ssid)}，第 ${index+1} 台，共 ${devices.length} 台"><img src="${ASSETS.device}" alt="记录仪参考外观" draggable="false"><strong>${esc(device.ssid).replaceAll('_','_<wbr>')}</strong></button>`).join('')}</div><div class="discovered-pagination" ${devices.length<=2?'hidden':''} role="group" aria-label="浏览附近设备">${Array.from({length:pageCount},(_,index)=>`<button class="discovered-dot" data-action="discovery-page" data-index="${index}" aria-label="显示第 ${index+1} 至 ${Math.min(index+2,devices.length)} 台设备" aria-current="${index===0}"></button>`).join('')}</div></div>`;
}
function video({channel = '前路', speed = false, live = false, paused = false} = {}) { return `<div class="video-block"><img src="${ASSETS.road}" alt="记录仪道路画面示例"><div class="video-top">${speed ? '<span class="speed-watermark">72<small>km/h</small></span>' : live ? '<span class="rec"><b class="dot"></b><span data-rec-label>REC</span></span>' : '<span>10/09/2026 · 12:36:00</span>'}<span class="video-channel">${channel}</span></div><div class="video-bottom">${tool(paused ? 'Play' : 'Pause',paused ? '播放' : '暂停','', 'data-action="play"')}<span class="video-time">${live ? '实时画面' : '00:18 / 01:00'}</span>${tool('Volume2','声音','', 'data-action="volume"')}${tool('Maximize','全屏','', 'data-action="fullscreen"')}</div></div>`; }
function referenceIcon(key, cls = '') { return `<img class="reference-icon ${cls}" src="${ASSETS[key]}" alt="" aria-hidden="true">`; }
function referenceTool(key,label,attrs) { return `<button class="tool" ${attrs} aria-label="${label}" title="${label}">${referenceIcon(key)}</button>`; }
function albumNav(timelineActive = false) {
  return `<div class="app-nav app-nav--page app-nav--album">${tool('ChevronLeft','返回','C01')}<div class="album-view-switch" role="tablist" aria-label="设备相册视图"><button role="tab" aria-selected="${!timelineActive}" class="${timelineActive?'':'active'}" data-go="D01">列表</button><button role="tab" aria-selected="${timelineActive}" class="${timelineActive?'active':''}" data-go="D02">时间轴</button></div><div class="nav-actions">${referenceTool('figmaSelect','选择文件','data-action="select-clips"')}</div></div>`;
}
function deviceVideo({live=false,channel='前路',image=ASSETS.figmaThumb0,timeline=false}={}) {
  return `<div class="device-player ${live?'is-live':''}"><div class="video-block"><img class="device-video-image" src="${live?ASSETS.figmaRoad:image}" alt="${channel}记录仪画面"><div class="video-top">${live?'<span class="rec"><b class="dot"></b><span data-rec-label>REC</span></span>':'<span class="video-date" data-video-date>10/09/2026 · 12:36:00</span>'}<span class="video-channel" aria-label="${channel}" title="${channel}">${channel==='后路'?'R':channel==='车内'?'I':'F'}</span></div>${live?`<div class="live-video-tools">${referenceTool('figmaMirror','镜像画面','data-action="mirror-video" aria-pressed="false"')}${tool('Scan','校准线','', 'data-action="calibration" aria-pressed="false"')}</div><div class="calibration-guides" hidden></div>`:''}<div class="video-watermark"><strong>VIETMAP</strong><span>10/09/2026&nbsp;&nbsp;12:36:00</span></div>${live?`<div class="live-player-controls">${referenceTool('figmaSwitchPlayer','切换播放器','data-action="switch-player"')}${referenceTool('figmaFullscreen','全屏','data-action="fullscreen"')}</div>`:''}</div>${live?'':`<div class="video-bottom">${tool('Pause','暂停','', 'data-action="play"')}<span class="video-time">${timeline?'12:36:00':'00:18'}</span><input class="playback-seek" type="range" min="0" max="60" value="18" aria-label="播放进度" data-action="seek-video"><span class="video-duration">01:00</span>${tool('Volume2','声音','', 'data-action="volume"')}${referenceTool('figmaFullscreen','全屏','data-action="fullscreen"')}</div>`}</div>`;
}
function liveBody() {
  return deviceVideo({live:true})+`<div class="preview-quality"><span>预览画质仅供参考，原始画质请查看设备相册。</span><button data-go="X03">画面加载失败？</button></div><div class="live-open-space"></div><div class="preview-tools figma-live-tools" data-expanded="true"><button data-go="D01" aria-label="设备相册" title="设备相册">${icon('Images')}<span>设备相册</span></button><button class="record-tool" data-action="record" aria-label="停止录像" title="停止录像">${icon('CircleStop')}<span>停止录像</span></button><button data-action="live-channel" aria-label="切换镜头" title="切换镜头">${referenceIcon('figmaSwitchCamera')}<span>切换镜头</span></button><button data-action="expand-live-tools" aria-expanded="true" aria-label="收起工具栏" title="收起工具栏">${icon('SquareChevronDown')}<span>收起</span></button><button class="secondary-live-tool" data-go="F01" aria-label="本地相册" title="本地相册">${icon('Image')}<span>本地相册</span></button><button class="secondary-live-tool" data-action="device-audio" aria-pressed="true" aria-label="关闭设备录音" title="关闭设备录音">${icon('Mic')}<span>录音开启</span></button></div>`;
}
const DEVICE_FILES = [
  {id:'clip-0',time:'12:36:00',channel:'前路',image:'figmaThumb0',day:0,lapse:true,downloaded:true},
  {id:'clip-1',time:'12:35:00',channel:'后路',image:'figmaThumb1',day:0},
  {id:'clip-2',time:'12:34:00',channel:'前路',image:'figmaThumb2',day:0,downloaded:true},
  {id:'clip-3',time:'12:33:00',channel:'后路',image:'figmaThumb1',day:0,lapse:true},
  {id:'clip-4',time:'12:32:00',channel:'前路',image:'figmaThumb2',day:0},
  {id:'clip-5',time:'12:31:00',channel:'后路',image:'figmaThumb3',day:1,lapse:true,downloaded:true},
  {id:'clip-6',time:'12:30:00',channel:'前路',image:'figmaThumb1',day:1},
  {id:'clip-7',time:'12:29:00',channel:'后路',image:'figmaThumb4',day:1,downloaded:true}
];
function deviceAlbum(category='视频',date='2026-09-10',deleted=[],downloaded=[]) {
  const photo=category==='图片',files=(category==='紧急'?DEVICE_FILES.slice(0,2):photo?DEVICE_FILES.slice(0,6):DEVICE_FILES).filter(file=>!deleted.includes(category+':'+file.id));
  return `<div class="album-grid device-album-grid" data-category="${category}">${[0,1].map(day=>{
    const group=files.filter(file=>file.day===day);if(!group.length)return '';
    const when=new Date(date+'T12:00:00');when.setDate(when.getDate()-day);
    const label=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'long'}).format(when);
    return `<section class="album-day"><h5>${label}</h5><div class="album-day-grid">${group.map(file=>`<button class="clip" data-file-id="${file.id}" data-go="${photo?'F06':'D04'}" ${photo?'data-photo-source="device"':''} aria-label="${file.time} ${file.channel}${photo?'图片':'录像'}"><div class="clip-thumb"><img src="${ASSETS[file.image]}" alt="${file.time} ${file.channel}${photo?'图片':'录像'}缩略图">${!photo&&file.lapse&&category==='视频'?'<span class="clip-lapse">缩时</span>':''}<span class="clip-tag">${photo?'图片':file.channel==='前路'?'F':'R'}</span>${!photo?icon('Play','clip-play'):''}<div class="clip-meta">${photo?'':icon('Clock3')}<span class="clip-time">${photo?'JPG':'01:00'}</span>${file.downloaded||downloaded.includes(category+':'+file.id)?icon('CircleCheck','clip-downloaded'):''}</div><span class="clip-selection">${icon('Check')}</span></div><p>${file.time}</p><small hidden>${photo?'JPG':'3840 × 2160'}</small></button>`).join('')}</div></section>`;
  }).join('')}${files.length?'':'<div class="album-empty">此分类暂无文件</div>'}</div>`;
}
function devicePlayerBody(done=false) {
  return deviceVideo()+`<div class="device-playback-space">${done?`<div class="downloaded-feedback">${icon('CircleCheck')}已保存到本地相册</div><button class="local-playback-link" data-go="F02">查看本地录像${icon('ChevronRight')}</button>`:''}</div><div class="file-tools device-file-tools"><button data-dialog="delete-device">${icon('Trash2')}<span>删除</span></button><button data-go="${done?'F02':'D05'}">${icon(done?'Folder':'Download')}<span>${done?'查看本地':'下载'}</span></button></div>`;
}
function sheet(title, body, buttons, glyph = '') { return `<div class="sheet-layer app-dialog-layer"><div class="dialog-card">${glyph ? `<div class="state-icon ${glyph === 'Trash2' ? 'error' : ''}">${icon(glyph)}</div>` : ''}<h5>${title}</h5><p>${body}</p>${buttons}</div></div>`; }
function dialogActions(cancel, confirm) { return `<div class="dialog-actions">${cancel}${confirm}</div>`; }
function segments(labels, selected = 0, kind = 'category-tabs', targets = []) { return `<div class="${kind}">${labels.map((label,index) => `<button class="${index === selected ? 'active' : ''}" ${targets[index] ? `data-go="${targets[index]}"` : 'data-action="filter"'}>${label}</button>`).join('')}</div>`; }
function dateRow() { return `<div class="date-row">${tool('ChevronLeft','前一天','', 'data-action="date-prev"')}<b data-date-label>10/09/2026</b>${tool('CalendarDays','选择日期','', 'data-action="calendar"')}</div>`; }
function timelineDates() { return `<div class="date-row date-strip">${[-3,-2,-1].map(offset=>`<button data-action="date-offset" data-date-offset="${offset}" aria-label="2026-09-${10+offset}">09-${String(10+offset).padStart(2,'0')}</button>`).join('')}<b data-date-label>10/09/2026</b>${tool('CalendarDays','选择日期','', 'data-action="calendar"')}</div>`; }
function clips(local = false) { return `<div class="album-grid">${['12:36:00','12:35:00','12:34:00','12:33:00','12:32:00','12:31:00'].map((time,index) => `<button class="clip" data-go="${local ? 'F02' : 'D04'}"><div class="clip-thumb"><img src="${ASSETS.road}" style="object-position:${index % 2 ? 'left' : 'right'} center" alt="${time} 录像缩略图"><span class="clip-tag">${index % 2 ? '后路' : '前路'}</span><span class="clip-time">01:00</span>${icon('Play')}</div><p>${time}</p><small>${local ? '已下载 · ' : ''}${index % 2 ? '1920 × 1080' : '3840 × 2160'}</small></button>`).join('')}</div>`; }
function timeline(channel = 0, empty = false) {
  return (empty?`<div class="video-placeholder">${icon('Video')}车内摄像头未连接</div>`:deviceVideo({channel:['前路','后路','车内'][channel],timeline:true,image:ASSETS[channel===1?'figmaThumb1':'figmaThumb0']}))+`<div class="device-timeline-panel">${segments(['前路','后路','车内'],channel,'segment channel-segment',['D02','D03','X04'])}${timelineDates()}${empty?`<div class="timeline-empty">${icon('Unplug')}此通道没有可用录像</div>`:`<div class="timeline-wrap"><div class="timeline-caption"><strong data-timeline-label>12:36</strong></div><div class="timeline-track">${['normal','normal','emergency','gap','normal','parking','lapse','parking','normal','normal','normal','lapse','normal','gap','parking','parking','emergency','normal'].map(kind=>`<span class="interval-${kind}"></span>`).join('')}<b class="cursor"></b><input type="range" min="30" max="42" value="36" step="1" data-action="timeline" aria-label="选择录像时间"></div><div class="time-labels"><span>12:30</span><span>12:33</span><span>12:36</span><span>12:39</span><span>12:42</span></div><div class="timeline-legend"><span><b></b>普通录像</span><span><b class="legend-emergency"></b>紧急录像</span><span><b class="legend-parking"></b>停车监控</span><span><b class="legend-lapse"></b>缩时录像</span></div></div>`}${empty?actions(button('查看前路录像','D02','secondary','Video')):`<div class="timeline-download"><button data-action="download-timeline">${icon('Download')}<span>下载视频</span></button></div>`}</div>`;
}
function settingsBody() { return content(`<div class="small" style="padding-bottom:8px"><span data-active-device-name>VIETMAP M2</span><span style="float:right;color:#bd7a42">录像已暂停</span></div>${setting('视频分辨率','4K · 30fps','resolution')}${setting('循环录像','1 分钟','loop')}${toggleRow('录制声音',true)}${setting('碰撞灵敏度','中','sensitivity')}${toggleRow('停车监控',true)}${row('存储卡','128 GB','MemoryStick','', 'data-action="storage-info"')}${row('格式化存储卡','','','', 'data-dialog="format"')}${row('恢复默认设置','','','', 'data-dialog="reset"')}`); }
function appUpdateRow() { return `<button class="list-row app-update-row" data-action="check-app-update" data-app-update-row aria-label="检查 App 更新">${icon('CloudDownload')}<span class="row-main">App Update</span><span class="row-value"><span data-app-version>4.0.0</span><b class="app-update-dot" data-app-update-dot aria-label="有新版本"></b></span>${icon('ChevronRight','chevron')}</button>`; }
function generalBody() { return content(`<div class="section-label" style="margin-top:2px">我的文件</div>${row('本地相册','18 个文件','Folder','F01')}<div class="section-label">应用</div>${row('清除缓存','128 MB','HardDrive','G05')}${appUpdateRow()}${row('离线地图','Android','Map','G03')}${row('问题反馈','','MessageSquare','G06')}${row('关于','','Info','G07')}`); }
const DATA_PACKAGES = [
  {id:'m2',name:'VIETMAP M2',version:'2026.09'},
  {id:'m1',name:'VIETMAP M1',version:'2026.09'},
  {id:'s720',name:'VIETMAP S720',version:'2026.08'},
  {id:'s860',name:'VIETMAP S860',version:'2026.09'},
  {id:'l110',name:'VIETMAP L110',version:'2026.08'}
];
function dataPackageKey(item) { return item.id+':'+item.version; }
function dataPackageRows(downloads={},packages=DATA_PACKAGES) {
  return packages.map(item=>{
    const task=downloads[dataPackageKey(item)] || {status:'idle'},busy=['downloading','checking'].includes(task.status),done=task.status==='downloaded',failed=task.status==='error';
    const label=done?'已下载':failed?'重试':busy?'下载中':'下载';
    const status=task.status==='downloading'?`正在下载 ${task.progress}%`:task.status==='checking'?'正在校验数据包':failed?task.message:'';
    return `<div class="list-row data-package-row" data-package-id="${item.id}" data-package-version="${item.version}" data-status="${task.status}"><div class="data-package-main"><strong>${esc(item.name)}</strong><span class="data-package-version">数据版本 ${esc(item.version)}</span><span class="data-package-status ${failed?'is-error':''}" role="status">${esc(status)}</span>${busy?`<div class="data-package-progress" role="progressbar" aria-label="${esc(item.name)} 下载进度" aria-valuenow="${task.progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${task.progress}%"></span></div>`:''}</div><button class="btn ${done?'text':'outline'}" data-action="download-data" data-data-package="${item.id}" ${busy||done?'disabled':''} ${busy?'aria-busy="true"':''} aria-label="${label} ${esc(item.name)} 数据">${icon(done?'Check':failed?'RotateCcw':busy?'LoaderCircle':'Download')}<span>${label}</span></button></div>`;
  }).join('');
}
const OFFLINE_MAPS=[{id:'vn',name:'越南',size:'16.1 MB',version:'2026.09'},{id:'hcm',name:'胡志明市',size:'14.7 MB',version:'2026.09'},{id:'hn',name:'河内',size:'19.6 MB',version:'2026.09'}];
function offlineMapRows(installed=Object.fromEntries(OFFLINE_MAPS.map(item=>[item.id,item.version]))) {
  return OFFLINE_MAPS.filter(item=>installed[item.id]).map(item=>`<button class="offline-map-row" data-action="map-details" data-map-id="${item.id}"><span class="map-row-main"><strong>${item.name}</strong><small>${item.size}</small></span>${icon('ChevronRight','chevron')}</button>`).join('') || '<p class="map-empty">暂无已下载地图</p>';
}
function offlineMapPage() {
  return content(`<button class="map-download-card" data-action="download-map">${icon('Download')}<span>下载离线地图</span>${icon('ChevronRight','chevron')}</button><div class="map-section-title">${icon('CheckCircle2')}<span>已下载</span></div><div class="offline-map-list">${offlineMapRows()}</div><p class="map-task-status" role="status"></p>`,'scroll-content offline-map-page');
}
function shareBody() {
  return video({speed:false})+content(`<div class="range-field"><div class="range-label"><span>开始位置</span><output data-share-start>00:00</output></div><input type="range" min="0" max="59.9" step="0.1" value="0" data-action="share-start" aria-label="分享片段开始位置"><div class="filmstrip">${[0,1,2,3].map(()=>`<img src="${ASSETS.road}" alt="视频帧示例">`).join('')}</div><div class="range-label"><span>片段时长</span><output data-duration-output>60 秒</output></div><input type="range" min="0.1" max="60" step="0.1" value="60" data-action="share-duration" aria-label="分享片段时长"><div class="progress-caption"><span data-share-range>00:00 - 01:00</span><span>结束 <b data-end-time>01:00</b></span></div></div><div class="info-pair"><span>源视频时长</span><span data-source-duration>01:00</span></div><div class="info-pair"><span>输出分辨率</span><span>原始 · 3840 × 2160</span></div><div class="info-pair"><span>预计大小</span><span data-share-size>180 MB</span></div><p class="share-export-status" role="status"></p>`,'scroll-content share-content')+actions(button('继续分享','F04','primary','Share2')+'<button class="btn text" data-action="cancel-share-export" hidden>取消生成</button>');
}
function feedbackPage() {
  return content(`<section class="feedback-card feedback-message-card"><textarea class="issue-textarea" maxlength="150" data-feedback-message placeholder="Please describe the problem you encountered\n(required)" aria-label="问题描述（必填）"></textarea><div class="feedback-counter" data-feedback-count>0/150</div><div class="feedback-attachment"><button class="feedback-attach" data-action="attach" aria-label="添加照片或视频">${icon('Plus')}</button><div><strong>Add photos/videos <small>(optional)</small></strong><span>Max: 2 photos, 1 video</span></div></div></section><label class="feedback-contact-card"><input type="text" data-feedback-contact placeholder="Enter mobile number or email (Required)" aria-label="手机号或邮箱（必填）"></label><section class="feedback-card feedback-logs"><div class="feedback-log-row"><span>Device log file <small>(optional)</small><button class="feedback-help" data-action="feedback-help" aria-label="设备日志说明">?</button></span><button class="feedback-link" data-action="get-feedback-logs">Get logs</button></div><div class="feedback-log-row"><span>App log file <small>(optional)</small><button class="feedback-help" data-action="feedback-help" aria-label="App 日志说明">?</button></span><button class="switch on" role="switch" aria-label="App log file" aria-checked="true" data-action="toggle"></button></div></section><input type="file" accept="image/*,video/*" multiple hidden class="attach-input">`,'scroll-content feedback-page')+actions(`<button class="btn primary feedback-submit" data-action="submit-feedback">Submit</button>`);
}
function localPlayerBody(downloaded = true) { return video({speed:true}) + `<div class="file-title-bar"><strong>M2_20260910_123600_F.mp4</strong><small>10/09/2026 · 12:36:00 / 4K · 01:00</small></div><div class="route-map"><img src="${ASSETS.map}" alt="参考地图，仅示意轨迹区域"><span class="map-label">行驶轨迹</span><span class="map-pin">${icon('Navigation2')}</span></div><div class="date-row"><span>${icon('Gauge')} 平均速度 65 km/h</span><span>1.2 km</span></div><div class="file-tools">${button('分享','F03','primary','Share2')}${button('删除','F05','outline','Trash2')}</div>`; }

const LANES = [
  {id:'onboarding',number:'01',title:'启动与发现设备',description:'静态启动页进入设备首页；蓝牙发现或手动连接，手动路径先确认安装通电，再连接 Wi-Fi。',refs:'R17 · R23 · R25 · R26 · 手动连接参考图'},
  {id:'connection',number:'02',title:'连接与设备管理',description:'连接成功后保存设备；相册、设置与固件提醒集中在设备卡片。',refs:'R24 · R25 · R29'},
  {id:'preview',number:'03',title:'实时预览与设备设置',description:'本稿采用提示后自动停录的备选流程，返回时按进入前的录像状态恢复。',refs:'R32 · R33 · R40 · R41'},
  {id:'album',number:'04',title:'设备相册与三路时间轴',description:'列表查看文件；时间轴切换前 / 后 / 车内通道；设备视频下载后进入本地相册。',refs:'R34–R39 · R42'},
  {id:'ota',number:'05',title:'固件发现与升级',description:'先联网获取升级包，再连接记录仪传输；以设备返回状态确认升级结果。',refs:'R27 · R28 · R29'},
  {id:'local',number:'06',title:'本地回放与分享',description:'本地视频显示速度与轨迹；分享时长上限 60 秒，源文件质量与平台处理分开验收。',refs:'R45 · R46 · R50–R52'},
  {id:'general',number:'07',title:'信息、Data 与支持',description:'Data 为独立一级入口，保留文字列表；信息页提供本地文件、缓存、更新、离线地图、反馈与关于。',refs:'R30 · R43 · R44 · R53–R55'},
  {id:'recovery',number:'08',title:'异常与恢复路径',description:'拒绝权限、连接失败、缺失通道、空间不足和升级异常都有明确的返回与重试。',refs:'建议补齐 · 跨流程验收'}
];
const SCREENS = [];
function add(id,lane,title,options) { SCREENS.push({id,lane,title,status:'confirmed',notes:[],refs:'',after:'',...options}); }

add('A01','onboarding','静态启动页',{
  header:'',body:`<div class="app-main splash"><button class="splash-link" data-go="A02" aria-label="进入设备首页"><div class="splash-brand">VIETMAP<span>REC</span></div></button><div class="splash-line"></div><div class="splash-bottom">VIETMAP REC</div></div>`,raw:true,auto:{to:'A02',ms:1000},after:'启动完成',
  refs:'R17 · P17：Choose option 1',notes:['启动图采用静态方案；此处为文字占位，等待客户最终素材。','不增加动画或人为等待时长。']
});
add('A02','onboarding','设备首页 · 空态',{
  header:homeNav(),body:content(`<div class="state-hero" style="padding-top:65px"><img class="camera-product" src="${ASSETS.device}" alt="记录仪参考外观"><h5>尚未添加设备</h5><p>VIETMAP REC</p></div>`)+actions(button('添加设备','A03','primary','Plus')),bottom:'device',after:'添加设备',refs:'No.7 / R23 · No.8 / R24 · 最新导航评审',notes:['无登录、注册及 4G 类型选择。','按最新评审采用设备 / Data / 信息三个底部入口；Data 位于中间，首页右上角用于添加设备。']
});
add('A03','onboarding','添加设备 · 打开蓝牙',{
  header:nav('添加设备','A02',tool('CircleHelp','连接帮助','X02')),body:content(`<section class="search-card search-card--bluetooth-off"><h5>搜索附近设备</h5><div class="search-visual search-visual--phone">${icon('BluetoothOff')}</div><p>开启蓝牙，以便查找附近蓝牙设备</p><button class="search-outline-action" data-go="A04">开启蓝牙</button><button class="btn text search-settings-link" data-go="X01">前往系统设置</button></section><section class="connection-methods"><h5>其他连接方式</h5>${manualWifiEntry()}</section>`,'scroll-content') ,status:'proposed',after:'开始搜索',refs:'No.9 / R25 · 添加设备入口调整',notes:['进入添加设备页后先展示蓝牙状态，不自动弹出系统权限框；搜索区域采用参考图的卡片结构。','点击“开启蓝牙”后由正式 App 按系统版本申请必要权限；拒绝权限进入 X01，手动 Wi-Fi 仍可用。']
});
add('A04','onboarding','搜索附近设备',{
  header:nav('添加设备','A02',tool('CircleHelp','连接帮助','X02')),body:content(`<section class="search-card search-card--scanning"><h5>正在搜索蓝牙设备...</h5><p>部分设备无蓝牙功能，请尝试手动添加</p><div class="search-visual search-visual--camera">${icon('BluetoothSearching')}</div><p class="search-helper">请保持设备通电，并尽量靠近手机</p></section><section class="connection-methods"><h5>其他连接方式</h5>${manualWifiEntry()}</section>`,'scroll-content'),auto:{to:'A05',ms:2000},after:'发现设备',status:'proposed',refs:'No.9 / R25',notes:['移除底部“未找到设备”按钮；保留右上角帮助和手动连接入口。扫描超时按异常规则处理。','预览演示中会自动进入搜索结果，实际由扫描结果驱动；选择手动连接后停止自动跳转。']
});
add('A05','onboarding','选择发现的设备',{
  header:nav('添加设备','A02',tool('RefreshCw','重新搜索','A04')),body:content(`<section class="search-card search-card--found"><h5>正在搜索蓝牙设备...</h5><p>部分设备无蓝牙功能，请尝试手动添加</p>${discoveredCarousel()}</section><section class="connection-methods"><h5>其他连接方式</h5>${manualWifiEntry()}</section>`,'scroll-content'),after:'手动连接分支',status:'proposed',refs:'No.9 / R25 · 多设备发现反馈 · 机型为示例',notes:['同屏完整并排展示两台设备，三台及以上可左右滑动；圆点按浏览位置计算。仅一台时居中展示，一至两台隐藏圆点。','点击任一可见设备后将其唯一标识、名称及 SSID 带入连接流程；滑动不触发连接，手动连接进入 A06。']
});
add('A06','onboarding','手动连接 · 安装与供电',{
  header:nav('','A04'),body:content(`<h4 class="manual-title">安装记录仪<br>并接通电源</h4><p class="manual-description">将记录仪安装在前挡风玻璃上，接通电源，并确认记录仪的 Wi-Fi 已开启。</p><figure class="manual-figure manual-install-figure"><img src="${ASSETS.manualInstall}" width="700" height="470" alt="记录仪安装在前挡风玻璃后视镜附近，电源线沿玻璃边缘布置的参考示意图"></figure>`,'scroll-content manual-guide')+manualActions('installed','我已安装记录仪并接通电源','A07'),after:'确认已通电',status:'proposed',refs:'用户提供的安装与供电参考图 · 手动连接分支',notes:['页面结构与示意图沿用用户参考，中文文案适配当前评审稿。','本次新增引导不修改默认密码；确认后进入 Wi-Fi 连接说明。']
});
add('A07','onboarding','手动连接 · 连接 Wi-Fi',{
  header:nav('','A06'),body:content(`<h4 class="manual-title">连接记录仪的<br>Wi-Fi</h4><ol class="manual-steps"><li>打开手机 Wi-Fi 设置，选择记录仪网络。</li><li>输入默认密码 <strong>12345678</strong>，<br>或按设备说明书填写。</li><li>连接后返回 App，继续完成设置。</li></ol><figure class="manual-figure manual-wifi-figure"><img src="${ASSETS.manualWifi}" width="600" height="497" alt="手机 Wi-Fi 列表参考图，标出了需要选择的记录仪网络；图中名称仅为示例"></figure>`,'scroll-content manual-guide')+manualActions('wifi','我已连接记录仪 Wi-Fi','B02'),after:'校验连接到 B02',status:'proposed',refs:'用户提供的 Wi-Fi 连接参考图 · 手动连接分支',notes:['底部未勾选时下一步置灰；勾选只允许开始校验，不代表已完成握手。','HTML 不操作手机系统网络；实际网络与记录仪连接状态由正式 App 检测。']
});

add('B01','connection','确认连接设备 Wi-Fi',{
  header:nav('连接设备','A05'),body:content(`<div class="state-hero"><img class="camera-product" src="${ASSETS.device}" alt="记录仪参考外观"><h5>VIETMAP M2</h5><p>VM_M2_82C1</p></div>`)+`<div class="sheet-layer"><div class="ios-dialog"><h5>加入 Wi-Fi 网络<br>“VM_M2_82C1”？</h5><p>此网络用于连接记录仪，<br>可能无法访问互联网。</p><button class="dialog-option" data-go="B02">加入</button><button class="dialog-option" data-go="A05">取消</button></div></div>`,status:'proposed',after:'同意加入',refs:'No.9 / R25 · No.10 / R26',notes:['本页用于从发现列表选择设备后的系统入网确认；手动路径经 A06 / A07 后直接进入 B02。','不出现修改默认密码步骤；无互联网不等于连接失败。']
});
add('B02','connection','连接并读取设备信息',{
  header:nav('连接设备','A05'),body:content(state('Wifi','正在连接 VIETMAP M2','VM_M2_82C1')+steps([['连接 Wi-Fi','done'],['校验记录仪连接','current'],['读取设备信息','']]))+actions(button('取消连接','A05','outline')),auto:{to:'B03',ms:2000},after:'失败状态',status:'proposed',refs:'No.2 / R18 · No.9 / R25',notes:['连接成功以记录仪握手结果为准，不仅看 Wi-Fi 已加入。','失败进入紧邻的 B06：展示失败步骤、明确错误原因、重试和取消；取消不保存未完成的设备。']
});
add('B06','connection','连接设备 · 失败',{
  header:nav('连接设备','A05'),body:connectionFailureBody(SAVED_DEVICES[0]),after:'重试成功',status:'recovery',refs:'关联 B02 · 连接错误反馈',notes:['本页为 B02 的失败状态，保留设备、Wi-Fi 和步骤。失败步骤标红，后续步骤不显示完成。','涵盖设备连接失败、握手超时、连错设备、本地网络权限拒绝与设备信息读取失败；重试沿用原目标和来源。']
});
add('B03','connection','设备首页 · 已连接',{
  header:connectedHomeNav(),body:`<div class="device-feature"><div class="device-model-line"><div class="device-status">${icon('Wifi')}<span data-active-device-ssid>VM_M2_82C1</span><span class="status-pill"><b class="dot"></b><span data-active-device-state>已连接</span></span></div>${tool('Ellipsis','设备信息','B05')}</div><button class="device-photo-button" data-go="C01" aria-label="进入实时预览"><img src="${ASSETS.device}" alt="记录仪参考外观"></button><button class="live-entry" data-go="C01">${icon('Play')}实时预览${icon('ChevronRight')}</button><div class="quick-actions"><button data-go="D01">${icon('Images')}设备相册</button><button data-go="C02">${icon('Settings')}设备设置</button></div><button class="update-row" data-go="E01">${icon('CloudDownload')}<span><strong>发现新固件</strong><small>查看更新详情</small></span>${icon('ChevronRight','arrow')}</button></div>`,bottom:'device',after:'切换 / 管理',refs:'No.8 / R24 · No.13 / R29',notes:['点击左上角设备名称或箭头进入独立的设备列表页面，不使用弹窗。','选择已保存设备只切换当前设备上下文，不进入 B01 / B02，也不自动连接 Wi-Fi。','未连接设备保留未连接状态；实时预览、相册和设置等能力以真实连接状态为准。']
});
add('B04','connection','切换已保存设备',{
  header:nav('切换设备','B03',tool('Plus','添加设备','A04')),body:content(`<div class="saved-device-list">${SAVED_DEVICES.map(savedDeviceRow).join('')}</div>`,'scroll-content'),after:'设备信息',status:'proposed',refs:'No.13 / R29 · 多设备切换需求',notes:['设备列表独立成页，纵向滚动；不显示顶部说明或底部添加新设备按钮。','每行小字为设备 Wi-Fi 名称（SSID），用于区分同型号设备；连接时仍以设备唯一标识校验。','选择设备只更新当前设备上下文，不发起 Wi-Fi 连接；进入设备相册或设置前单独检查目标设备连接。','勾选表示当前设备，连接状态独立显示；不能将当前设备等同于已连接设备。']
});
add('B05','connection','设备信息',{
  header:nav('设备信息','B03'),body:content(`<img class="camera-product" src="${ASSETS.device}" alt="记录仪参考外观" style="height:116px;margin-bottom:9px">${row('设备型号','VIETMAP M2')}${row('Wi-Fi 名称','VM_M2_82C1')}${row('固件版本','1.0.8')}${row('序列号','M2••••82C1')}${row('固件更新','发现新版本','CloudDownload','E01')}`)+actions(`<button class="btn text" data-dialog="remove-device">移除此设备</button>`),refs:'No.13 / R29 · 数值为示例',notes:['移除仅清除 App 中的保存信息，不删除存储卡录像。','型号、固件版本及支持能力必须来自真实设备。']
});

add('C01','preview','实时预览',{
  header:nav('实时预览','B03',referenceTool('figmaSettings','设备设置','data-go="C02"')),body:liveBody(),after:'设备设置',status:'proposed',refs:'Figma 5:30 / 48:11189 · No.15 / R32 · No.16 / R33',notes:['布局与控件参照 Figma：全宽画面、画面内工具、底部可收起工具栏。','按已确认业务隐藏抓拍，不新增地图；录像与录音状态以设备响应为准。']
});
add('C02','preview','进入设置 · 自动停录确认',{
  header:nav('实时预览','B03'),body:liveBody()+sheet('进入设置并暂停录像？','修改设置期间，记录仪将停止录像。',dialogActions(button('取消','C01','text'),button('暂停录像并进入','C03','primary')),'CircleAlert'),after:'确认自动停录',status:'proposed',refs:'No.16 / P33 · 采用 Option 2 供评审',notes:['这是客户提出的备选方案，不是已定方案。','只有停录成功才进入设置；失败保持原页并提示。','取消时不改变录像状态。']
});
add('C03','preview','设备设置',{
  header:nav('设备设置','C01'),body:settingsBody(),after:'视频分辨率',status:'proposed',reviewWarning:'设备设置页面的设置项仅为示例，实际以设备返回为准。',refs:'No.23 / R40 · No.24 / R41',notes:['设置项、候选值和当前值均由实际设备能力返回，不写死所有机型设置。','退出直接回来源页；由本流程暂停的录像在原页恢复，不再展示独立恢复页。','曝光、日期格式、时区、速度单位及三项水印共七项隐藏，由固件保证默认值。']
});
add('C04','preview','设置选项 · 示例',{
  header:nav('设备设置','C03'),body:settingsBody()+sheet('视频分辨率','',`<button class="list-row" data-action="set-resolution" data-value="4K · 30fps"><span class="row-main">4K · 30fps</span>${icon('Check')}</button><button class="list-row" data-action="set-resolution" data-value="2K · 30fps"><span class="row-main">2K · 30fps</span></button><button class="list-row" data-action="set-resolution" data-value="1080p · 60fps"><span class="row-main">1080p · 60fps</span></button>${button('取消','C03','text')}`),after:'保存并返回',status:'proposed',reviewWarning:'设备设置页面的设置项仅为示例，实际以设备返回为准。',refs:'设置项示例 · 候选值以固件为准',notes:['保存中锁定重复提交，收到设备确认后更新显示。','失败保留旧值；这里展示选择结构，不定义实际支持档位。']
});

add('D01','album','设备相册 · 列表',{
  header:albumNav(),body:segments(['视频','紧急','图片'])+`<div class="album-scroll"><p class="album-download-note">下载的文件将自动保存到<button data-go="F01">本地相册</button></p>${deviceAlbum()}</div>`,after:'时间轴',refs:'Figma 95:8594 · No.17 / R34 · No.20 / R37',notes:['参照 Figma 的顶部视图切换、日期分组及三列方形缩略图。','业务分类保持视频 / 紧急 / 图片；不新增列表通道筛选。视频合并普通、停车和延时录像，归类按机型协议确认。']
});
add('D02','album','时间轴 · 前路',{
  header:albumNav(true),body:timeline(0),after:'切换后路',status:'proposed',refs:'Figma 95:8023 · No.19 / R36 · No.21 / R38',notes:['参照 Figma 的全宽预览、深色时间轴、录像类型色带及底部下载入口。','保留前 / 后 / 车内通道切换；分钟级定位，切换通道保留所选时间点。']
});
add('D03','album','时间轴 · 后路',{
  header:albumNav(true),body:timeline(1),after:'列表回放分支',status:'proposed',refs:'Figma 95:8023 · No.21 / R38',notes:['按时间定位匹配后路文件，并在上方播放器查看；不显示“查看此段录像”按钮。','车内通道示例进入 X04；不存在的通道不可展示虚假画面。']
});
add('D04','album','设备视频回放',{
  header:nav('20260910_123600_F.MP4','D01'),body:devicePlayerBody(),after:'下载',refs:'Figma 157:10137 · No.18 / R35 · R42',notes:['参照 Figma 的文件名标题、独立播放进度条与底部删除 / 下载工具栏。','不展示设备视频地图或编辑入口；删除需明确告知设备源文件范围。']
});
add('D05','album','下载录像到本地',{
  header:nav('下载录像','D04'),body:content(state('Download','正在下载录像','M2_20260910_123600_F.mp4')+progress(45,'81 MB / 180 MB','45%')+banner('下载期间请保持与记录仪的 Wi-Fi 连接。','info'))+actions(button('取消下载','D04','outline')),auto:{to:'D06',ms:2400},after:'文件校验成功',status:'proposed',refs:'R42 · R45 · 下载状态补齐',notes:['下载前校验手机可用空间；中断进入 X07，空间不足进入 X05。','成功前不把未完整文件计入本地相册。']
});
add('D06','album','下载完成',{
  header:nav('20260910_123600_F.MP4','D01'),body:devicePlayerBody(true),refs:'Figma 157:10137 · R42 · R45',notes:['下载完成使用同一回放结构，显示已保存并提供查看本地入口。','返回列表刷新对应文件下载标记；本地文件可在设备断开后继续使用。']
});

add('E01','ota','发现新固件',{
  header:nav('固件更新','B03'),body:content(`<div class="release-version"><div class="state-icon">${icon('CloudDownload')}</div><div><strong>新固件 1.0.9</strong><small>VIETMAP M2 · 24 MB</small></div></div><div class="info-pair"><span>当前版本</span><span>1.0.8</span></div><div class="release-notes"><strong>更新内容</strong><ul><li>优化设备连接稳定性</li><li>优化录像文件兼容性</li><li>修复已知问题</li></ul></div>${banner('升级包尚未下载，需要可访问互联网的网络。')}`)+actions(button('下载升级包','E02','primary','Download')+button('稍后处理','B03','text')),after:'联网下载',status:'proposed',refs:'No.11 / R27 · No.12 / R28',notes:['检测触发、提醒频率、包大小和更新说明由平台提供；本页均为示例。','不能在没有联网检查结果时显示“已经是最新版本”。']
});
add('E02','ota','下载升级包',{
  header:nav('固件更新','E01'),body:content(state('CloudDownload','正在下载升级包','VIETMAP M2 · 1.0.9')+progress(62,'14.9 MB / 24 MB','62%')+steps([['已检查可用版本','done'],['通过互联网下载升级包','current'],['校验完整性和适用机型','']]))+actions(button('取消下载','E01','outline')),auto:{to:'E03',ms:2300},after:'下载并校验成功',status:'proposed',refs:'No.11 / R27 · 网络步骤建议',notes:['下载使用可访问互联网的网络；预览中的自动进度仅用于演示。','校验失败重新下载，错误型号包禁止继续。']
});
add('E03','ota','切回记录仪 Wi-Fi',{
  header:nav('连接记录仪','E01'),body:content(state('Wifi','升级包已准备好','连接记录仪后继续升级。')+`<div class="info-pair"><span>目标设备</span><span>VIETMAP M2</span></div><div class="info-pair"><span>Wi-Fi 名称</span><span>VM_M2_82C1</span></div>${banner('升级过程中，记录仪需要保持供电。')}`)+actions(button('连接设备并继续','E04','primary','Wifi')+button('稍后升级','B03','text')),after:'连接并校验设备',status:'proposed',refs:'No.11–13 / R27:R29',notes:['包下载后缓存；此步骤连接目标设备并再次核验型号/版本。','Wi-Fi 系统授权与连接失败按 B01 / X02 处理。']
});
add('E04','ota','传输升级包',{
  header:nav('固件更新',null),body:content(state('Upload','正在传输升级包','VIETMAP M2 · Wi-Fi 已连接')+progress(48,'11.5 MB / 24 MB','48%')+banner('请保持与记录仪的连接，并保持设备供电。'))+actions(actionButton('查看连接状态','upgrade-status','text','Wifi')),auto:{to:'E05',ms:2300},after:'设备接收成功',status:'proposed',refs:'No.11 / R27 · 传输状态补齐',notes:['传输中的离页与取消是否允许，须按固件协议定稿；预览限制直接返回。','断连进入 X06，重新读取设备状态后再决定重传或等待。']
});
add('E05','ota','设备安装与重启',{
  header:nav('固件更新',null),body:content(state('LoaderCircle','记录仪正在更新','设备可能重启并暂时断开连接。')+steps([['升级包已传输','done'],['记录仪安装新固件','current'],['重连并核验版本','']])+banner('请勿关闭记录仪电源。'))+actions(actionButton('查看连接状态','upgrade-status','text','Wifi')),auto:{to:'E06',ms:2600},after:'重连并验证新版本',status:'proposed',refs:'No.11 / R27 · 安装/重连建议',notes:['不能用 App 倒计时推断升级成功，须重连并读取版本。','超时区分安装中、未升级、设备状态未知；进入 X06 恢复。']
});
add('E06','ota','固件升级完成',{
  header:nav('固件更新','B03'),body:content(state('CircleCheck','更新完成','VIETMAP M2 已更新至 1.0.9。','success')+`<div class="info-pair"><span>连接状态</span><span>已重新连接</span></div><div class="info-pair"><span>当前版本</span><span>1.0.9</span></div>`)+actions(button('返回设备首页','B03','primary','Check')),refs:'No.11 / R27 · 验收闭环建议',notes:['仅在设备返回版本匹配后展示成功；清除已完成的新固件提醒。','本原型不实际连接设备，成功为示例状态。']
});

add('F01','local','本地相册',{
  header:nav('本地相册','G01',tool('CheckCheck','选择文件','', 'data-action="select-clips"')),body:segments(['视频','锁定','照片'])+dateRow()+clips(true)+`<div class="hint" style="margin-top:auto;font-size:9px">18 个文件 · 2.4 GB</div>`,after:'打开已下载视频',refs:'No.27 / R45 · R50',notes:['保留 Video / Lock / Photo 顺序与紧凑间距；本地文件与设备文件分开。','4.0.0 主路径不放编辑 / AR / SR 入口。']
});
add('F02','local','本地回放 · 车速与轨迹',{
  header:nav('本地回放','F01',tool('Info','文件信息','', 'data-action="file-info"')),body:localPlayerBody(),after:'分享',refs:'No.28 / R46 · No.32 / P51',notes:['车速按已选方案显示在视频左上角，不沿轨迹移动。','缺失 GPS/速度时隐藏相应区域；地图素材仅示意区域布局。']
});
add('F03','local','选择分享片段',{
  header:nav('分享视频','F02'),body:shareBody(),after:'生成分享文件',status:'proposed',refs:'No.33 / R52 · 裁剪控件为分享所需',notes:['选择开始位置与时长，结束位置不得超过源视频，片段最长 60 秒。这里只生成分享副本，不修改源文件或增加通用编辑功能。','开始位置、时长、导出失败与取消为可演示交互；保留源分辨率是建议策略，编码、精度、大小估算与输出质量须真机验证。']
});
add('F04','local','系统分享面板',{
  header:nav('本地回放','F02'),body:localPlayerBody()+`<div class="sheet-layer"><div class="dialog-card"><div class="sheet-grip"></div><div class="mini-file"><img src="${ASSETS.road}" alt="分享视频缩略图"><span><strong>M2_20260910_123600_F.mp4</strong><small><span data-share-summary>60 秒 · 4K · 180 MB</span></small></span></div><div class="system-share-grid"><button data-action="share-system" data-target="Facebook"><span class="share-logo fb">f</span>Facebook</button><button data-action="share-system" data-target="Zalo"><span class="share-logo zalo">Zalo</span>Zalo</button><button data-action="save-video"><span class="share-logo">${icon('Download')}</span>存储视频</button><button data-action="share-system" data-target="更多"><span class="share-logo">${icon('Ellipsis')}</span>更多</button></div>${button('取消','F02','text')}</div></div>`,after:'取消 / 返回',status:'proposed',refs:'No.28 / R46 · No.33 / R52',notes:['系统分享样式和可用 App 由手机决定；这里只展示转交关系。','从第三方返回不等于发布成功，App 不显示“已发布”。']
});
add('F05','local','删除本地文件确认',{
  header:nav('本地回放','F01'),body:localPlayerBody()+sheet('删除本地视频？','该文件将从手机中删除。<br>记录仪存储卡中的原文件不受影响。',dialogActions(button('取消','F02','text'),actionButton('删除','delete-local','danger')),'Trash2'),refs:'R45 · R50 · 删除边界建议',notes:['本地 / 设备删除分别确认，明确影响范围。','删除后刷新本地文件数量；失败保留原文件记录。']
});
add('F06','local','照片预览 · 历史文件',{
  header:nav('照片预览','F01'),body:`<div style="flex:1;display:flex;align-items:center"><img src="${ASSETS.road}" alt="历史照片示例" style="width:100%;display:block"></div><div class="file-title-bar"><strong>M2_20260910_123601.jpg</strong><small>10/09/2026 · 12:36:01 / 3840 × 2160</small></div><div class="file-tools" data-photo-tools><button class="btn primary" data-action="share-photo">${icon('Share2')}分享</button><button class="btn outline" data-dialog="delete-photo">${icon('Trash2')}删除</button></div>`,refs:'No.5 / R21 · R50 · 历史照片入口',notes:['保留既有照片的浏览、下载或分享，不恢复实时预览抓拍入口。','设备照片先下载到本地，删除时明确设备与本地的影响范围。']
});

add('G01','general','信息',{
  header:nav('信息',null),body:generalBody(),bottom:'info',after:'底部切换 Data',refs:'No.25 / R43 · No.34 / R53 · App 更新页内提示修订',notes:['一级入口名称按最新评审调整为信息；移除使用手册及账号功能，问题反馈无需登录。','点击 App Update 显示居中 Loading Toast，列表项内容保持原样；检查结束关闭 Loading，新版显示居中弹窗，最新或失败显示 Toast。','App 更新不保留独立的检查结果页面，所有结果留在 Info 页；离线地图仅 Android 展示。']
});
add('G02','general','Data · 现版功能范围',{
  header:nav('Data',null),body:content(`<div class="data-list">${dataPackageRows()}</div>`,'scroll-content data-catalog-page'),bottom:'radar',after:'底部切换信息',status:'proposed',reviewWarning:'本期复用现版 Data 页面。此处仅示意已确认字段与下载状态；具体布局、机型数据及下载后的设备更新方式需核对现版 App。',refs:'No.14 · E30 / F30 / P30：选择 Option 1',notes:['Data 入口位置和名称按本轮用户要求保留；Excel 明确沿用的字段为记录仪名称、数据版本和下载按钮。','不展开方案 2 的图片、搜索与全量下载。刷新按钮在新方案中提出，未核对现版前不作为本期新增项；不显示没有来源的统一版本、包大小或更新时间。','下载完成仅表示该型号、该版本的数据包已下载，不表示设备已安装更新。示例响应仅用于评审，最终沿用现版下载与后续处理流程。']
});
add('G03','general','离线地图 · Android',{
  header:nav('离线地图','G01'),body:offlineMapPage(),after:'清除缓存',status:'proposed',refs:'No.26 / R44 · 参考图 2',notes:['页面改为“下载离线地图 + 已下载列表”的结构，下载入口保持单独卡片，已下载地图按名称和容量分组。','仅 Android 展示；地图名称、容量和可用区域由地图服务返回，当前内容为示例。','点击列表项查看地图包详情；删除、更新和真实下载状态需接入地图 SDK。']
});
add('G05','general','清除缓存确认',{
  header:nav('信息',null),body:generalBody()+sheet('清除 128 MB 缓存？','仅清理临时缓存。已下载的媒体、Data、地图和有效升级包将保留。',dialogActions(button('取消','G01','text'),actionButton('清除缓存','clear-cache','primary')),'HardDrive'),bottom:'info',after:'问题反馈',refs:'No.25 / R43 · No.34 / R53 · 缓存保护规则',notes:['缓存与完整下载文件分开管理，不删除用户媒体、Data、地图或有效固件包。','仅清理目录白名单内可重建且未被使用的临时文件；128 MB 为示例，实际清理量由客户端统计。']
});
add('G06','general','问题反馈',{
  header:nav('Report an Issue','G01'),body:feedbackPage(),after:'关于',status:'proposed',refs:'No.34 / R53 · 参考图 3',notes:['页面按参考图调整为问题描述、照片 / 视频附件、手机号或邮箱、设备日志和 App 日志。','问题描述和联系方式为必填；附件和日志为选填，提交前保留用户输入并就地提示错误。','当前原型仅本地校验，不向外发送；正式字段、附件限制和接收渠道需服务端确认。']
});
add('G07','general','关于与条款',{
  header:nav('关于','G01'),body:content(`<div class="about-logo">VIETMAP <span>REC</span></div><div class="about-version">版本 4.0.0</div>${row('服务条款','','FileText','', 'data-action="terms"')}${row('隐私政策','','Shield','', 'data-action="privacy"')}<div class="micro center" style="margin-top:50px">VIETMAP REC</div>`),refs:'No.35 / R55 · OSD / R54',notes:['条款与隐私政策内容维持现有；暂不新增未确认的 VML 下载入口。','所有界面为中文评审文案；正式越南语由客户回稿确认。']
});

add('X01','recovery','蓝牙权限未开启',{
  header:nav('添加设备','A02'),body:content(state('Bluetooth','蓝牙权限未开启','暂时无法发现附近的记录仪。','error'))+actions(button('前往系统设置','A03','primary','Settings')+manualWifiEntry('outline')+button('返回设备首页','A02','text')),after:'权限恢复 / 手动',status:'recovery',refs:'关联 A03 / A04 · No.9',notes:['允许去系统设置恢复权限，也允许跳过蓝牙使用手动 Wi-Fi。','从系统设置返回后重新检测权限，不预设用户已允许。']
});
add('X02','recovery','设备未找到 / 连接超时',{
  header:nav('连接设备','A02'),body:content(state('WifiOff','暂时无法连接设备','未能与记录仪建立连接。','error')+`<div class="list">${row('记录仪电源','需要保持开启','Power')}${row('设备 Wi-Fi','检查是否已开启','Wifi')}${row('连接范围','靠近记录仪重试','Radio')}</div>`)+actions(button('重新搜索','A04','primary','RefreshCw')+manualWifiEntry('outline')),after:'重试连接',status:'recovery',refs:'关联 A04 / B02 · No.9',notes:['扫描为空与握手超时应有不同错误码，当前合并展示恢复结构。','重试保留目标设备信息；无需重复注册或选设备类型。']
});
add('X03','recovery','预览加载失败',{
  header:nav('实时预览','B03'),body:`<div class="video-placeholder">${icon('Video')}暂时无法加载画面</div><div class="connection-line">${icon('Wifi')}VM_M2_82C1 · 仍已连接</div>`+content(state('CircleAlert','预览加载失败','记录仪连接正常，录像状态未知。','error'))+actions(button('重新加载画面','C01','primary','RefreshCw')+button('查看设备相册','D01','outline','Images')),after:'重新加载',status:'recovery',refs:'No.2 / R18 · 实时预览异常',notes:['区分取流失败与设备断连，避免全部引导重新配对。','没有读取到录像状态时显示未知，不显示假 REC。']
});
add('X04','recovery','三路时间轴 · 通道缺失',{
  header:albumNav(true),body:timeline(2,true),after:'切回可用通道',status:'recovery',refs:'No.21 / R38',notes:['只有型号支持该通道但暂不可用时展示缺失状态。','型号根本不支持的通道应不显示，不能用空态伪装为支持。']
});
add('X05','recovery','手机空间不足',{
  header:nav('下载录像','D04'),body:content(state('HardDrive','手机存储空间不足','此视频暂时无法下载。','error')+`<div class="info-pair"><span>本次下载需要</span><span>180 MB</span></div><div class="info-pair"><span>手机可用空间</span><span>86 MB</span></div>`)+actions(button('管理本地文件','F01','primary','Folder')+button('重新检查空间','D05','outline','RefreshCw')+button('返回录像','D04','text')),after:'释放空间后重试',status:'recovery',refs:'关联 D05 / F03 · 建议异常状态',notes:['下载与分享导出前计算可用空间，包含临时文件开销。','原视频仍在设备端，不静默删除现有本地文件。']
});
add('X06','recovery','升级结果尚未确认',{
  header:nav('固件更新','B03'),body:content(state('Unplug','暂时无法确认更新结果','记录仪尚未重新连接。','error')+banner('设备可能仍在更新。请保持供电，稍后重新检查。'))+actions(button('重新连接并检查','E05','primary','RefreshCw')+button('联系支持','G06','outline','MessageSquare')),after:'重新读取设备状态',status:'recovery',refs:'关联 E04 / E05 · No.11',notes:['状态未知时不显示失败已回滚，也不直接重新刷写。','重连后按实际版本分流：成功 E06、仍旧版本 E01 或继续等待。']
});
add('X07','recovery','录像下载中断',{
  header:nav('下载录像','D04'),body:content(state('WifiOff','下载已中断','与记录仪的 Wi-Fi 连接断开。','error')+`<div class="mini-file"><img src="${ASSETS.road}" alt="下载中断的视频缩略图"><span><strong>M2_20260910_123600_F.mp4</strong><small>未完整下载 · 81 MB / 180 MB</small></span></div>`)+actions(button('重新连接后下载','D05','primary','RefreshCw')+button('取消并返回','D04','text')),status:'recovery',refs:'关联 D05 · 下载失败恢复建议',notes:['已完成文件保留；未完整文件不作为可播放文件入库。','断点续传取决于协议能力；不支持时应明确重新下载。']
});

const DECISIONS = [
  ['导航与素材','三个底部入口依次为设备 / Data / 信息。Data 为中间一级页面；首页右上角用于添加设备，设备信息放三点菜单。静态启动图和具体机型外观待替换。','导航按最新评审指令调整，替代此前的两入口方案；原素材依据 R17、R19、R24、R29。'],
  ['连接能力','无登录 / 注册，无 4G 类型选择，无添加设备时修改默认密码步骤。手动连接按参考图先安装通电、再连接 Wi-Fi，确认后仍需校验设备。','R23、R25、R26 及用户参考图；Android / iOS 与各机型须评审。'],
  ['进入设置与抓拍','本稿按居中确认后停录、退出回来源页并恢复原录像状态展示。已停录不重复提示、不自动开始录像；实时预览隐藏抓拍入口。','布局和隐藏抓拍按用户确认执行；停录、状态查询与恢复命令由 App / 固件确认可用性，不用界面计时判定成功。'],
  ['三路时间轴','单路画面中切换前 / 后 / 车内；保留定位时间，分钟级查找。不增加列表通道筛选或设备相册地图。','R34–R39；三路同时播放尚未被明确，不计入此稿。'],
  ['固件默认与隐藏','曝光 0.0；日期 DD/MM/YYYY；时区 GMT+7；速度 km/h；Logo / 型号 / 日期时间水印 ON。七项由固件固定并从菜单隐藏。','R41；按机型指定固件版本，App 页面不是实际默认值生效的证据。'],
  ['OTA 与地图依赖','OTA 先下载包再连接设备传输，重连核验结果。离线地图只在 Android 展示，保留场景、覆盖区域、SDK/Key、包和版本待确认。','R27–R29、R44；协议、更新前提、超时与网络切换需要联合评审。'],
  ['分享与数据','本地车速显示在视频左上角。分享最长 60 秒，原始分辨率策略需验证，不保证社交平台最终不压缩。机型、版本号、文件和地图数值均为示例。','R46、R51、R52；图片摘自原表，地图只表示布局。'],
  ['后续版本与内容','基础视频编辑原计划 4.1.0，但配乐 / 变速的 Point 3 歧义待确认。AR/SR 待商务授权后定版本，AI 后续评估。VML 链接及问题反馈渠道待确认。','R22、R47、R48、R53、R55；本稿不新增未授权功能入口。']
];

function phone(screen) {
  const top = `<div class="statusbar"><span>9:41</span><span class="status-icons">${icon('Signal')}${icon('Wifi')}${icon('BatteryFull')}</span></div>`;
  const template = document.createElement('template');
  const reference=['C01','C02','D01','D02','D03','D04','D06','X03','X04'].includes(screen.id);
  template.innerHTML = `<div class="phone ${reference?'figma-device':''}" data-screen-id="${screen.id}" aria-label="${screen.id} ${screen.title}">${top}${screen.header || ''}${screen.raw ? screen.body : `<div class="app-main">${screen.body}</div>`}${screen.bottom ? bottomNav(screen.bottom,screen.id==='A02'?'A02':'B03') : ''}<div class="home-indicator"></div></div>`;
  const host = template.content.firstElementChild;
  // Anchor overlays to the complete App screen, outside the clipped content area.
  $$('.sheet-layer',host).forEach(layer=>host.append(layer));
  syncSheetBackground(host);
  return host.outerHTML;
}
function syncSheetBackground(host) {
  const activeLayer = $$(':scope > .sheet-layer',host).at(-1);
  [...host.children].forEach(child=>{
    if(activeLayer && child!==activeLayer) {
      if(!child.inert) { child.inert=true; child.dataset.sheetInert=''; }
    } else if(child.hasAttribute('data-sheet-inert')) {
      child.inert=false; delete child.dataset.sheetInert;
    }
  });
}
function dismissDynamicSheet(host) {
  $$('.dynamic-layer',host).forEach(layer=>layer.remove());
  syncSheetBackground(host);
  if(host.sheetTrigger?.isConnected) host.sheetTrigger.focus({preventScroll:true});
  delete host.sheetTrigger;
}
function screenGuidance(screen) {
  const guidance = GUIDE.screens[screen.id];
  if (!guidance) throw new Error('Missing screen guidance: ' + screen.id);
  return guidance;
}
function guidanceMarkup(screen) {
  const guidance = screenGuidance(screen);
  const sections = [['business','业务规则'],['interaction','交互说明'],['exception','异常处理']];
  return `<div class="guidance-sections" data-guidance-id="${screen.id}"><div class="guidance-caption">${screen.id} · 规则与依赖 <span>开发评审</span></div>${sections.map(([key,label])=>`<section class="guidance-block is-${key}" data-guidance-kind="${key}"><h4>${label}</h4><ol>${guidance[key].map(item=>`<li>${esc(item)}</li>`).join('')}</ol></section>`).join('')}<section class="guidance-pending"><h4>外部依赖 / 原型边界</h4><ul>${guidance.pending.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></section></div>`;
}
function reviewNotes(screen) {
  return `${screen.reviewWarning?`<p class="review-warning">${esc(screen.reviewWarning)}</p>`:''}${guidanceMarkup(screen)}<details class="guidance-source"><summary>原反馈依据与评审注记</summary>${screen.notes.map(note=>`<p>${esc(note)}</p>`).join('')}<span class="refs">${esc(screen.refs)}</span></details>`;
}
function commonGuidanceMarkup() {
  return `<div class="handoff-common"><h3>跨页面共用规则</h3><p>${esc(GUIDE.notice)}</p><ol>${GUIDE.common.map(item=>`<li>${esc(item)}</li>`).join('')}</ol><h3>联合确认清单</h3><dl>${GUIDE.decisions.map(([owner,item])=>`<div><dt>${esc(owner)}</dt><dd>${esc(item)}</dd></div>`).join('')}</dl></div>`;
}
function renderBoard() {
  $('#screenCount').textContent = `${SCREENS.length} 页`;
  $('#totalScreens').textContent = `${SCREENS.length} 个页面 / 状态`;
  $('#flowNav').innerHTML = LANES.map((lane,index)=>`<a class="flow-nav-link ${index === 0 ? 'active' : ''}" data-section="${lane.id}" href="#${lane.id}"><span class="nav-index">${lane.number}</span><span>${lane.title.replace('设备管理','设备').replace('实时预览与设备设置','预览与设置').replace('设备相册与三路时间轴','相册与时间轴').replace('固件发现与升级','固件升级').replace('信息、电子狗与支持','信息与电子狗').replace('启动与发现设备','启动与发现').replace('异常与恢复路径','异常与恢复')}</span><span class="count">${SCREENS.filter(s=>s.lane===lane.id).length}</span></a>`).join('');
  $('#stage').innerHTML = LANES.map(lane=>{
    const screens = SCREENS.filter(screen=>screen.lane===lane.id);
    return `<section class="flow-lane" id="${lane.id}" data-lane="${lane.id}"><header class="lane-head"><span class="lane-number">${lane.number}</span><div><h2>${lane.title}</h2><p>${lane.description}</p></div><span class="lane-source">${lane.refs}</span></header><div class="flow-row">${screens.map((screen,index)=>`<article class="screen-node ${screen.status}" id="screen-${screen.id}" data-search="${esc(screen.id+' '+screen.title+' '+screen.refs+' '+screen.notes.join(' ')+' '+Object.values(screenGuidance(screen)).flat().join(' '))}"><div class="screen-label"><span class="screen-id">${screen.id}</span><h3>${screen.title}</h3><button class="tool node-open" data-go="${screen.id}" title="打开交互预览" aria-label="预览 ${screen.title}">${icon('ArrowUpRight')}</button></div>${phone(screen)}<div class="screen-note">${reviewNotes(screen)}</div></article>${index < screens.length-1 ? `<div class="connector ${['general','recovery'].includes(lane.id)?'parallel':''}">${icon(['general','recovery'].includes(lane.id)?'Ellipsis':'ArrowRight')}<span>${['general','recovery'].includes(lane.id)?'并列页面':screen.after || '相关页面'}</span></div>` : ''}`).join('')}</div></section>`;
  }).join('') + `<section id="decisions" class="rules-section"><h2>范围与待定规则</h2><p>以下用于产品 / 研发评审。页面内容是方案示例，不代表机型能力、接口、文案、授权或工期已经确认。</p><table class="rule-table"><thead><tr><th>决策点</th><th>本稿采用的方案</th><th>依据与待确认</th></tr></thead><tbody>${DECISIONS.map(row=>`<tr>${row.map(text=>`<td>${text}</td>`).join('')}</tr>`).join('')}</tbody></table><div class="scope-line"><strong>本期不展开</strong><p>平板 / 车机适配、自定义三导航、列表通道筛选、设备相册地图、横转竖视频、新电子狗图文 / 搜索 / 全量下载、AI 编辑。</p></div><div class="scope-line"><strong>上线前确认</strong><p>越南语 OSD、静态启动图、真实机型图片、蓝牙 / OTA / GPS / 通道能力矩阵、协议异常处理、性能基线、分享输出策略、测试包与客户验收。</p></div><div class="source-footer">来源：VM-R&amp;D- VM REC - VM FEEDBACK - 04092026.xlsx / 6-REPORT / 客户反馈 2026.09.03，以及用户提供的手动连接参考图。<br>单文件离线评审稿 · 图标 Lucide（ISC）· 示意素材来自原始工作簿及用户参考图 · 所有交互均为本地原型，不连接设备或外部服务。</div></section>`;
  $('.rules-section > p').insertAdjacentHTML('afterend', commonGuidanceMarkup());
  $('#screenSelect').innerHTML = LANES.map(lane=>`<optgroup label="${lane.number} ${lane.title}">${SCREENS.filter(screen=>screen.lane===lane.id).map(screen=>`<option value="${screen.id}">${screen.id} ${screen.title}</option>`).join('')}</optgroup>`).join('');
}

let zoom = window.innerWidth < 760 ? .94 : .8;
let activeLane = LANES[0].id;
let currentScreen = 'B03';
let history = [];
let autoTimer = null;
let toastTimer = null;
let previewSession = 0;
const stateData = {deviceHome:'B03',activeDevice:{...SAVED_DEVICES[0],connected:true},connectedDeviceId:'m2',savedDevices:[...SAVED_DEVICES],connection:null,connectionResult:'success',discoveredCount:3,discoveryIndex:0,settingsOrigin:'C01',albumOrigin:'C01',manual:{origin:'A04',installed:false,wifi:false,checking:false},duration:60,recording:true,wasRecording:true,pausedForSettings:null,restore:null,restoreResult:'success',timelineMinute:36,date:'2026-09-10',photoSource:'local',firmwareUpdated:false,appUpdateResult:'available',currentAppVersion:'4.0.0',availableAppVersion:'4.1.0',settings:{resolution:'4K · 30fps',loop:'1 分钟',sensitivity:'中'},deletedLocal:false};
stateData.appUpdateKnown=true;
const appUpdateChecks=new Map();
stateData.dataDownloads={};
stateData.dataDownloadResult='success';
stateData.share={start:0,sourceDuration:60,result:'success',error:''};
stateData.localOrigin='G01';
stateData.storageOrigin='download';
stateData.maps={installed:Object.fromEntries(OFFLINE_MAPS.map(item=>[item.id,item.version])),result:'success'};
let shareExportJob=null,mapDownloadJob=null;
function clearSupportTasks() {
  if(shareExportJob){const host=shareExportJob.host;clearTimeout(shareExportJob.timer);shareExportJob=null;if(host.isConnected)renderShare(host);}
  if(mapDownloadJob){const host=mapDownloadJob.host;clearTimeout(mapDownloadJob.timer);mapDownloadJob=null;if(host.isConnected)dismissDynamicSheet(host);}
}
function mediaTime(value) {
  const tenths=Math.round(value*10),seconds=Math.floor(tenths/10);
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}${tenths%10?'.'+tenths%10:''}`;
}
function renderShare(host) {
  const share=stateData.share,min=Math.min(.1,share.sourceDuration);
  share.start=Math.max(0,Math.min(share.start,share.sourceDuration-min));
  stateData.duration=Math.round(Math.max(min,Math.min(stateData.duration,60,share.sourceDuration-share.start))*10)/10;
  const start=$('[data-action="share-start"]',host),duration=$('[data-action="share-duration"]',host);
  if(start){start.max=share.sourceDuration-min;start.value=share.start;start.disabled=!!shareExportJob;}
  if(duration){duration.min=min;duration.max=Math.min(60,share.sourceDuration-share.start);duration.value=stateData.duration;duration.disabled=!!shareExportJob;}
  $$('[data-share-start]',host).forEach(el=>el.textContent=mediaTime(share.start));
  $$('[data-source-duration]',host).forEach(el=>el.textContent=mediaTime(share.sourceDuration));
  const time=$('.share-content',host)?.previousElementSibling?.querySelector('.video-time');if(time)time.textContent=`${mediaTime(share.start)} / ${mediaTime(share.sourceDuration)}`;
  $$('[data-duration-output]',host).forEach(el=>el.textContent=stateData.duration+' 秒');
  $$('[data-end-time]',host).forEach(el=>el.textContent=mediaTime(share.start+stateData.duration));
  $$('[data-share-range]',host).forEach(el=>el.textContent=`${mediaTime(share.start)} - ${mediaTime(share.start+stateData.duration)}`);
  const size=Math.round(stateData.duration*30)/10;
  $$('[data-share-size]',host).forEach(el=>el.textContent=size+' MB');
  $$('[data-share-summary]',host).forEach(el=>{el.textContent=`${stateData.duration} 秒 · 4K · ${size} MB`;el.parentElement.querySelector('[data-share-range]')?.remove();el.insertAdjacentHTML('afterend',`<span class="share-range-summary" data-share-range>${mediaTime(share.start)} - ${mediaTime(share.start+stateData.duration)}</span>`);});
  const proceed=$('.share-content + .app-actions [data-go="F04"]',host),cancel=$('[data-action="cancel-share-export"]',host),status=$('.share-export-status',host);
  if(proceed){proceed.disabled=!!shareExportJob;proceed.innerHTML=icon(shareExportJob?'LoaderCircle':'Share2')+(shareExportJob?'正在生成…':'继续分享');}
  if(cancel)cancel.hidden=!shareExportJob;
  if(status)status.textContent=share.error;
}
function beginShareExport(el) {
  if(shareExportJob)return;
  const host=el.closest('.phone'),result=stateData.share.result;
  stateData.share.error='';
  const job={host};shareExportJob=job;renderShare(host);
  job.timer=setTimeout(()=>{
    if(shareExportJob!==job || !host.isConnected)return;
    shareExportJob=null;
    if(result==='space'){stateData.storageOrigin='share';openScreen('X05');return;}
    if(result==='failure'){stateData.share.error='生成失败，请重试';renderShare(host);return;}
    openScreen('F04');
  },900);
}
function mapPicker(el) {
  const rows=OFFLINE_MAPS.map(item=>`<button class="list-row" data-action="start-map-download" data-map-id="${item.id}" ${stateData.maps.installed[item.id]===item.version?'disabled':''}><span class="row-main">${item.name}<small>${item.size}</small></span><span class="row-value">${stateData.maps.installed[item.id]===item.version?'已下载':stateData.maps.installed[item.id]?'更新':'下载'}</span></button>`).join('');
  showDynamicSheet(el,'下载离线地图','',rows+actionButton('关闭','dismiss-dialog','text'));
}
function startMapDownload(el) {
  if(mapDownloadJob)return;
  const item=OFFLINE_MAPS.find(item=>item.id===el.dataset.mapId),host=el.closest('.phone');if(!item)return;
  $('.inline-toast',host)?.remove();
  const result=stateData.maps.result,job={host};mapDownloadJob=job;
  showDynamicSheet(el,item.name,'正在下载并校验地图包…',actionButton('取消','cancel-map-download','text'),'LoaderCircle');
  job.timer=setTimeout(()=>{
    if(mapDownloadJob!==job || !host.isConnected)return;mapDownloadJob=null;
    const errors={offline:'网络不可用，请联网后重试',storage:'存储空间不足，请清理后重试',integrity:'地图包校验失败，请重新下载'};
    if(errors[result]){showDynamicSheet(host,item.name,errors[result],dialogActions(actionButton('关闭','dismiss-dialog','text'),`<button class="btn primary" data-action="start-map-download" data-map-id="${item.id}">重试</button>`),'CircleAlert');return;}
    stateData.maps.installed[item.id]=item.version;
    $('.offline-map-list',host).innerHTML=offlineMapRows(stateData.maps.installed);
    dismissDynamicSheet(host);phoneToast(host,'地图已下载');
  },1100);
}
const dataDownloadJobs=new Map();
function renderDataPackages(host,item) {
  const list=$('.data-catalog-page .data-list',host);
  if(!list)return;
  if(item){const row=$(`[data-package-id="${item.id}"]`,list);if(row)row.outerHTML=dataPackageRows(stateData.dataDownloads,[item]);}
  else list.innerHTML=dataPackageRows(stateData.dataDownloads);
}
function clearDataDownloads() {
  const hosts=new Set();
  for(const [key,task] of dataDownloadJobs){task.timers.forEach(clearTimeout);delete stateData.dataDownloads[key];hosts.add(task.host);}
  dataDownloadJobs.clear();
  hosts.forEach(host=>{if(host.isConnected)renderDataPackages(host);});
}
function downloadDataPackage(button) {
  const item=DATA_PACKAGES.find(item=>item.id===button.dataset.dataPackage);
  if(!item)return;
  const key=dataPackageKey(item),host=button.closest('.phone');
  if(dataDownloadJobs.has(key) || stateData.dataDownloads[key]?.status==='downloaded')return;
  const job={host,timers:[],result:stateData.dataDownloadResult};dataDownloadJobs.set(key,job);
  const update=(status,progress,message='')=>{stateData.dataDownloads[key]={status,progress,message};if(host.isConnected)renderDataPackages(host,item);};
  const later=(ms,callback)=>job.timers.push(setTimeout(()=>{if(dataDownloadJobs.get(key)===job)callback();},ms));
  const finish=(status,message='')=>{job.timers.forEach(clearTimeout);dataDownloadJobs.delete(key);update(status,status==='downloaded'?100:0,message);};
  update('downloading',0);
  if(job.result==='offline' || job.result==='storage') {
    later(400,()=>finish('error',job.result==='offline'?'网络不可用，请联网后重试':'存储空间不足，请清理后重试'));return;
  }
  later(350,()=>update('downloading',30));
  later(700,()=>update('downloading',70));
  later(1050,()=>update('checking',100));
  later(1400,()=>job.result==='integrity'?finish('error','数据包校验失败，请重新下载'):finish('downloaded'));
}
stateData.media={category:'视频',scroll:0,file:null,download:null,deleted:{},downloaded:{},localFile:null,channel:0,expanded:true,mic:true,mirrored:false,calibration:false,player:'自动'};
function fileContext(file=DEVICE_FILES[0],category=stateData.media.category) {
  const when=new Date(stateData.date+'T12:00:00');when.setDate(when.getDate()-file.day);
  const date=[when.getFullYear(),String(when.getMonth()+1).padStart(2,'0'),String(when.getDate()).padStart(2,'0')].join('-');
  return {...file,category,date,key:category+':'+file.id,filename:`${date.replaceAll('-','')}_${file.time.replaceAll(':','')}_${file.channel==='前路'?'F':file.channel==='后路'?'R':'I'}.${category==='图片'?'JPG':'MP4'}`};
}
function renderDeviceAlbum(host) {
  const grid=$('.device-album-grid',host);if(!grid)return;
  const media=stateData.media,id=stateData.activeDevice.id;
  grid.outerHTML=deviceAlbum(media.category,stateData.date,media.deleted[id]||[],media.downloaded[id]||[]);
  $$('.category-tabs button',host).forEach(el=>el.classList.toggle('active',el.textContent===media.category));
}
function clearSelection(host) {
  $('.selection-bar',host)?.remove();host.classList.remove('is-selecting');
  $$('.clip',host).forEach(el=>{el.classList.remove('selected');el.style.outline='';el.removeAttribute('aria-pressed');});
  const select=$('[data-action="select-clips"]',host);
  if(select && host.dataset.screenId==='D01'){select.innerHTML=referenceIcon('figmaSelect');select.setAttribute('aria-label','选择文件');select.title='选择文件';}
}
function updateSelection(host) {
  const count=$$('.clip.selected',host).length,total=$$('.clip:not([hidden])',host).length;
  const label=$('[data-selection-count]',host);if(label)label.textContent=`已选择 ${count} 个文件`;
  $$('.clip',host).forEach(el=>el.setAttribute('aria-pressed',el.classList.contains('selected')));
  $$('[data-action="download-selected"],[data-action="delete-selected"]',host).forEach(el=>el.disabled=count===0);
  const all=$('[data-action="select-all"]',host);if(all)all.textContent=count===total&&count?'取消全选':'全选';
}
function applyLiveControls(host) {
  const media=stateData.media,toolbar=$('.figma-live-tools',host);if(!toolbar)return;
  toolbar.dataset.expanded=String(media.expanded);
  const expand=$('[data-action="expand-live-tools"]',toolbar),label=media.expanded?'收起':'展开';
  expand.innerHTML=icon(media.expanded?'SquareChevronDown':'SquareChevronUp')+`<span>${label}</span>`;
  expand.setAttribute('aria-expanded',String(media.expanded));expand.setAttribute('aria-label',label+'工具栏');expand.title=label+'工具栏';
  const mic=$('[data-action="device-audio"]',toolbar);
  mic.innerHTML=icon(media.mic?'Mic':'MicOff')+`<span>${media.mic?'录音开启':'录音关闭'}</span>`;
  mic.setAttribute('aria-pressed',String(media.mic));mic.setAttribute('aria-label',media.mic?'关闭设备录音':'开启设备录音');mic.title=mic.getAttribute('aria-label');
  const badge=$('.video-channel',host),name=['前路','后路','车内'][media.channel];
  badge.textContent=['F','R','I'][media.channel];badge.setAttribute('aria-label',name);badge.title=name;
  const img=$('.device-video-image',host);img.src=ASSETS[media.channel===0?'figmaRoad':media.channel===1?'figmaThumb4':'figmaThumb2'];img.alt=name+'记录仪画面';img.classList.toggle('is-mirrored',media.mirrored);
  $('[data-action="mirror-video"]',host).setAttribute('aria-pressed',String(media.mirrored));
  $('[data-action="calibration"]',host).setAttribute('aria-pressed',String(media.calibration));
  $('.calibration-guides',host).hidden=!media.calibration;
}
function beginDownload(files,origin) {
  if(origin==='D01')stateData.media.scroll=$('#prototypePhone .album-scroll')?.scrollTop || 0;
  stateData.media.download={files,origin,deviceId:stateData.activeDevice.id};
  stateData.media.file=files[0];openScreen('D05');
}
let restoreTimer=null;
function reviewControls(id) {
  if(id==='F03')return `<label class="review-scenario">源视频时长（演示）<select data-share-source>${[.5,30,60,180].map(value=>`<option value="${value}" ${stateData.share.sourceDuration===value?'selected':''}>${value} 秒</option>`).join('')}</select></label><label class="review-scenario">生成结果（演示）<select data-share-result>${[['success','成功'],['failure','生成失败'],['space','空间不足']].map(([value,label])=>`<option value="${value}" ${stateData.share.result===value?'selected':''}>${label}</option>`).join('')}</select></label>`;
  if(id==='G03')return `<label class="review-scenario">地图下载结果（演示）<select data-map-result>${[['success','成功'],['offline','网络不可用'],['storage','空间不足'],['integrity','校验失败']].map(([value,label])=>`<option value="${value}" ${stateData.maps.result===value?'selected':''}>${label}</option>`).join('')}</select></label><label class="review-scenario">地图资源（演示）<select data-map-catalog><option value="current">当前版本</option><option value="update">河内有新版本</option><option value="empty">未下载任何地图</option></select></label>`;
  if(id==='G02') return `<label class="review-scenario">单项下载结果（演示）<select data-data-result>${[['success','下载成功'],['offline','网络不可用'],['storage','空间不足'],['integrity','校验失败']].map(([value,label])=>`<option value="${value}" ${stateData.dataDownloadResult===value?'selected':''}>${label}</option>`).join('')}</select></label>`;
  if(id==='A05') return `<label class="review-scenario">发现设备（演示）<select data-discovery-count>${[1,2,3].map(n=>`<option value="${n}" ${stateData.discoveredCount===n?'selected':''}>${n} 台设备</option>`).join('')}</select></label>`;
  if(id==='G01') return `<label class="review-scenario">App 更新结果（演示）<select data-app-update-result>${[['available','发现新版本'],['latest','已是最新版本'],['offline','无互联网连接'],['timeout','检查超时'],['failure','服务检查失败']].map(([value,label])=>`<option value="${value}" ${stateData.appUpdateResult===value?'selected':''}>${label}</option>`).join('')}</select></label>`;
  if(id==='C03' || (['C01','B03'].includes(id) && stateData.restore))return `<label class="review-scenario">恢复录像结果（演示）<select data-restore-result>${[['success','恢复成功'],['failure','恢复失败'],['timeout','结果超时']].map(([value,label])=>`<option value="${value}" ${stateData.restoreResult===value?'selected':''}>${label}</option>`).join('')}</select></label>`;
  if(['B01','B02','B06','X02'].includes(id) && stateData.connection) return `<label class="review-scenario">${id==='B06'?'下次连接结果':'连接结果'}（演示）<select data-connection-result>${[['success','连接成功'],['wifi','设备连接失败'],['timeout','握手超时'],['mismatch','连接了其他设备'],['permission','本地网络权限拒绝'],['info','设备信息读取失败']].map(([value,label])=>`<option value="${value}" ${stateData.connectionResult===value?'selected':''}>${label}</option>`).join('')}</select></label>`;
  return '';
}
function clearRecordingRestore() {
  clearTimeout(restoreTimer);stateData.restore=null;
}
function updateRecordingUI(host) {
  const task=stateData.restore?.deviceId===stateData.activeDevice.id?stateData.restore:null;
  const pending=task?.phase==='pending',failed=task?.phase==='failed';
  const rec=$('[data-rec-label]',host),control=$('[data-action="record"]',host);
  if(rec) {
    rec.textContent=pending?'恢复中':failed?'待确认':stateData.recording?'REC':'已暂停';
    $('.dot',rec.parentElement).hidden=!!task || !stateData.recording;
  }
  if(control) {
    control.disabled=!!task;
    control.innerHTML=icon(pending?'LoaderCircle':failed?'CircleAlert':stateData.recording?'CircleStop':'Play')+`<span>${pending?'恢复中':failed?'状态待确认':stateData.recording?'停止录像':'开始录像'}</span>`;
    control.setAttribute('aria-label',$('span',control).textContent);control.title=control.getAttribute('aria-label');
  }
  $('.recording-feedback',host)?.remove();
  if(task && ['C01','B03'].includes(currentScreen))$('.app-main',host).insertAdjacentHTML('afterbegin',`<div class="app-banner recording-feedback ${pending?'info':'error'}" role="${failed?'alert':'status'}">${icon(pending?'LoaderCircle':'CircleAlert')}<span>${esc(pending?'正在恢复录像…':task.message)}</span>${failed?'<button data-action="retry-recording">重试</button>':''}</div>`);
}
function startRecordingRestore() {
  clearRecordingRestore();
  const task={deviceId:stateData.activeDevice.id,phase:'pending'};
  stateData.restore=task;
  const finish=()=>{
    if(stateData.restore!==task || stateData.activeDevice.id!==task.deviceId)return;
    if(!stateData.activeDevice.connected || stateData.restoreResult!=='success') {
      task.phase='failed';
      task.message=!stateData.activeDevice.connected?'连接已断开，请重连后确认录像状态':stateData.restoreResult==='timeout'?'录像状态待确认，请重试':'设置已保存，录像恢复失败';
    } else {
      stateData.recording=true;stateData.restore=null;
    }
    updateRecordingUI($('#prototypePhone'));
    if(!stateData.restore && ['C01','B03'].includes(currentScreen))phoneToast($('.phone',$('#prototypePhone')),'录像已恢复');
  };
  updateRecordingUI($('#prototypePhone'));
  if(!stateData.activeDevice.connected)return finish();
  // The prototype simulates a device acknowledgement without navigating away.
  restoreTimer=setTimeout(finish,900);
}
function exitSettings() {
  const shouldRestore=stateData.pausedForSettings===stateData.activeDevice.id;
  stateData.pausedForSettings=null;
  if(shouldRestore)stateData.restore={deviceId:stateData.activeDevice.id,phase:'pending'};
  openScreen(stateData.settingsOrigin);
  if(shouldRestore)startRecordingRestore();
}
function startConnection(device,returnTo='A05',destination='B03',source='discovery') {
  stateData.connection={device:{...device},returnTo,destination,source,phase:'confirm'};
  openScreen(source==='manual'?'B02':'B01');
}
function cancelConnection() {
  const returnTo=stateData.connection?.returnTo || 'A05';
  stateData.connection=null;
  openScreen(returnTo);
}
function gateDeviceEntry(target,origin) {
  if(!['C01','C02','C03','D01'].includes(target) || stateData.activeDevice.connected)return false;
  const returnTo=origin==='C02'?stateData.settingsOrigin:origin;
  startConnection(stateData.activeDevice,returnTo,target,'feature');
  return true;
}
function finishConnection(attempt) {
  if(!attempt || stateData.connection!==attempt || currentScreen!=='B02')return;
  if(CONNECTION_ERRORS[stateData.connectionResult]) {
    attempt.phase='failed';
    attempt.error=stateData.connectionResult;
    openScreen('B06');
    return;
  }
  if(attempt.device.id!==stateData.activeDevice.id){clearRecordingRestore();stateData.pausedForSettings=null;}
  stateData.connectedDeviceId=attempt.device.id;
  stateData.activeDevice={...attempt.device,connected:true};
  if(!stateData.savedDevices.some(device=>device.id===attempt.device.id))stateData.savedDevices.push({...attempt.device,status:'未连接'});
  stateData.connection=null;
  if(['C02','C03'].includes(attempt.destination)) {
    stateData.settingsOrigin=attempt.returnTo;
    stateData.wasRecording=stateData.recording;
    stateData.pausedForSettings=null;
    return openScreen(stateData.recording?'C02':'C03');
  }
  if(attempt.destination==='D01')stateData.albumOrigin=attempt.returnTo;
  openScreen(attempt.destination);
}
function discoveryMetrics(viewport) {
  const cards=$$('.found-device-preview',viewport);
  const step=(cards[0]?parseFloat(getComputedStyle(cards[0]).width):viewport.clientWidth)+(parseFloat(getComputedStyle(viewport).columnGap)||0);
  return {cards,step,lastIndex:Math.max(0,cards.length-2)};
}
function discoveryPage(carousel,index,behavior='smooth') {
  const viewport=$('.discovered-viewport',carousel),{step,lastIndex}=discoveryMetrics(viewport);
  const next=Math.max(0,Math.min(lastIndex,index));
  viewport.scrollTo({left:Math.min(next*step,viewport.scrollWidth-viewport.clientWidth),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':behavior});
}
function initCarousels(host) {
  $$('.discovered-carousel',host).forEach(carousel=>{
    if(carousel.carouselReady)return;
    carousel.carouselReady=true;
    const viewport=$('.discovered-viewport',carousel);
    const sync=()=>{
      const {cards,step,lastIndex}=discoveryMetrics(viewport);
      const index=Math.max(0,Math.min(lastIndex,Math.round(viewport.scrollLeft/Math.max(1,step))));
      stateData.discoveryIndex=index;
      $$('.discovered-dot',carousel).forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)));
      cards.forEach((button,i)=>button.tabIndex=i>=index && i<index+2?0:-1);
    };
    viewport.addEventListener('scroll',sync,{passive:true});
    viewport.addEventListener('keydown',event=>{
      const {step,lastIndex}=discoveryMetrics(viewport),index=Math.round(viewport.scrollLeft/step);
      const target={ArrowLeft:index-1,ArrowRight:index+1,Home:0,End:lastIndex}[event.key];
      if(target===undefined)return;
      event.preventDefault();viewport.focus({preventScroll:true});discoveryPage(carousel,target);
    });
    // Touch uses native scrolling; mouse dragging follows the same snap positions.
    let drag=null;
    viewport.addEventListener('pointerdown',event=>{
      if(event.button!==0 || event.pointerType==='touch')return;
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:viewport.scrollLeft,index:Math.round(viewport.scrollLeft/discoveryMetrics(viewport).step),moved:false};
    });
    viewport.addEventListener('pointermove',event=>{
      if(!drag || drag.id!==event.pointerId)return;
      const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
      if(!drag.moved && (Math.abs(dx)<8 || Math.abs(dx)<Math.abs(dy)))return;
      if(!drag.moved){drag.moved=true;viewport.setPointerCapture(event.pointerId);viewport.style.scrollSnapType='none';}
      event.preventDefault();
      viewport.scrollLeft=drag.left-dx/(viewport.getBoundingClientRect().width/viewport.clientWidth);
    });
    const endDrag=event=>{
      if(!drag || drag.id!==event.pointerId)return;
      if(drag.moved) {
        viewport.suppressClickUntil=performance.now()+400;
        viewport.style.scrollSnapType='';
        if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
        const dx=event.clientX-drag.x;
        discoveryPage(carousel,drag.index+(Math.abs(dx)>40?(dx<0?1:-1):0));
      }
      drag=null;
    };
    viewport.addEventListener('pointerup',endDrag);
    viewport.addEventListener('pointercancel',endDrag);
    viewport.addEventListener('dragstart',event=>event.preventDefault());
    discoveryPage(carousel,stateData.discoveryIndex,'instant');sync();
  });
}
function setZoom(value) { zoom = Math.max(.4,Math.min(1.3,value)); $('#stage').style.zoom = zoom; document.documentElement.style.setProperty('--scale',zoom); $('#zoomValue').textContent = `${Math.round(zoom*100)}%`; }
function boardToast(text) { const toast = $('#boardToast'); toast.textContent = text; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(()=>toast.classList.remove('show'),2600); }
function phoneToast(element,text,duration=2700) { const host = element.closest('.phone') || $('.phone',$('#prototypePhone')); if (!host) return boardToast(text); $('.inline-toast',host)?.remove(); const toast = document.createElement('div'); toast.className='inline-toast'; toast.setAttribute('role','status'); toast.textContent=text; host.append(toast); setTimeout(()=>toast.remove(),duration); }
function clearAppUpdateChecks(host) {
  for(const [screen,task] of appUpdateChecks) {
    if(host && screen!==host)continue;
    clearTimeout(task.timer);task.toast.remove();task.button.disabled=false;task.button.removeAttribute('aria-busy');appUpdateChecks.delete(screen);
  }
}
function checkAppUpdate(button) {
  const host=button.closest('.phone');
  if(appUpdateChecks.has(host))return;
  $('.inline-toast',host)?.remove();
  const toast=document.createElement('div');toast.className='app-loading-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');toast.setAttribute('aria-atomic','true');
  toast.innerHTML=icon('LoaderCircle')+'<span>正在检查更新</span>';
  const task={button,toast,result:stateData.appUpdateResult,version:stateData.availableAppVersion,restoreFocus:document.activeElement===button};
  appUpdateChecks.set(host,task);button.disabled=true;button.setAttribute('aria-busy','true');host.append(toast);
  // A task belongs to its Info view; navigation invalidates its pending result.
  task.timer=setTimeout(()=>{
    if(appUpdateChecks.get(host)!==task)return;
    clearAppUpdateChecks(host);
    if(!button.isConnected)return;
    if(task.restoreFocus && document.activeElement===document.body)button.focus({preventScroll:true});
    if(['available','latest'].includes(task.result)) {
      stateData.appUpdateKnown=task.result==='available';
      $$('[data-app-update-dot]',host).forEach(el=>el.hidden=!stateData.appUpdateKnown);
    }
    if(task.result==='available') {
      showDynamicSheet(button,'发现新版本',`已发现 Vietmap REC 新版本 ${esc(task.version)}，是否立即更新？`,dialogActions(actionButton('取消','dismiss-dialog','text'),actionButton('立即更新','open-store','primary','ExternalLink')),'CloudDownload');
    } else {
      const messages={latest:'当前已是最新版本',offline:'网络不可用，请联网后重试',timeout:'检查更新超时，请重试',failure:'检查更新失败，请稍后重试'};
      phoneToast(button,messages[task.result]||messages.failure,3400);
    }
  },900);
}
function applyState(host) {
  if(currentScreen==='G02')renderDataPackages(host);
  $$('[data-tab="device"]',host).forEach(el=>el.dataset.go=stateData.deviceHome);
  $$('[data-active-device-name]',host).forEach(el=>el.textContent=stateData.activeDevice.name);
  $$('[data-active-device-ssid]',host).forEach(el=>el.textContent=stateData.activeDevice.ssid);
  $$('[data-active-device-state]',host).forEach(el=>el.textContent=stateData.activeDevice.connected?'已连接':'未连接');
  $$('.status-pill',host).forEach(el=>el.classList.toggle('is-offline',!stateData.activeDevice.connected));
  const savedList=$('.saved-device-list',host);
  if(savedList)savedList.innerHTML=stateData.savedDevices.map(savedDeviceRow).join('');
  $$('.saved-device-row',host).forEach(rowEl=>{
    const isCurrent=rowEl.dataset.device===stateData.activeDevice.id;
    const connected=rowEl.dataset.device===stateData.connectedDeviceId;
    rowEl.classList.toggle('is-current',isCurrent);
    rowEl.setAttribute('aria-current',String(isCurrent));
    const statusEl=$('[data-saved-status]',rowEl);
    if(statusEl) {
      statusEl.classList.toggle('connected',connected);
      statusEl.classList.toggle('offline',!connected);
      statusEl.innerHTML=(isCurrent?icon('Check'):'')+(connected?'已连接':rowEl.dataset.status==='离线'?'离线':'未连接');
    }
  });
  $$('[data-app-version]',host).forEach(el=>el.textContent=stateData.currentAppVersion);
  $$('[data-app-update-dot]',host).forEach(el=>el.hidden=!stateData.appUpdateKnown);
  if(currentScreen==='A05')$('.discovered-carousel',host).outerHTML=discoveredCarousel(DISCOVERED_DEVICES.slice(0,stateData.discoveredCount));
  const attempt=stateData.connection;
  if(attempt && ['B01','B02'].includes(currentScreen)) {
    const {device,returnTo,destination}=attempt;
    $('.state-hero h5',host).textContent=currentScreen==='B01'?device.name:`正在连接 ${device.name}`;
    $('.state-hero p',host).textContent=`Wi-Fi：${device.ssid}`;
    if(currentScreen==='B01') {
      $('.ios-dialog h5',host).textContent=`加入 Wi-Fi 网络“${device.ssid}”？`;
      const purpose={D01:'设备相册',C01:'实时预览',C02:'设备设置',C03:'设备设置'}[destination];
      $('.ios-dialog p',host).textContent=(purpose?`连接此记录仪后进入${purpose}。`:'此网络用于连接记录仪。')+'此网络可能无法访问互联网。';
    }
    $$('[data-go="A05"]',host).forEach(el=>{el.dataset.go=returnTo;el.dataset.connectionCancel='';});
  }
  if(['B06','X02'].includes(currentScreen) && attempt?.phase==='failed') {
    $('.app-main',host).innerHTML=connectionFailureBody(attempt.device,attempt.error);
    const back=$('.app-nav [data-go]',host);back.dataset.go=attempt.returnTo;back.dataset.connectionCancel='';
  }
  if(currentScreen==='C02')$('.dialog-actions button',host).dataset.go=stateData.settingsOrigin;
  if(currentScreen==='C03') {
    const back=$('.app-nav [aria-label="返回"]',host);delete back.dataset.go;back.dataset.action='exit-settings';
  }
  if(['D01','D02','D03','X04'].includes(currentScreen))$('.app-nav [aria-label="返回"]',host).dataset.go=stateData.albumOrigin;
  if(currentScreen==='D01'){renderDeviceAlbum(host);$('.album-scroll',host).scrollTop=stateData.media.scroll;}
  if(['C01','C02'].includes(currentScreen))applyLiveControls(host);
  if(['D04','D06'].includes(currentScreen)) {
    if(!stateData.media.file || stateData.media.file.category==='图片')stateData.media.file=fileContext(DEVICE_FILES[0],'视频');
    const file=stateData.media.file;
    $('.app-nav h4',host).textContent=file.filename;
    $('.app-nav h4',host).title=file.filename;
    $('.device-video-image',host).src=ASSETS[file.image];
    $('.device-video-image',host).alt=file.channel+' '+file.time+' 录像';
    const badge=$('.video-channel',host);badge.textContent=file.channel==='前路'?'F':file.channel==='后路'?'R':'I';badge.setAttribute('aria-label',file.channel);badge.title=file.channel;
    $('[data-video-date]',host).textContent=file.date.split('-').reverse().join('/')+' · '+file.time;
    $('.video-watermark span',host).textContent=file.date.split('-').reverse().join('/')+'  '+file.time;
  }
  if(['D05','X05','X07'].includes(currentScreen) && stateData.media.download) {
    const download=stateData.media.download;
    $$('[data-go="D04"]',host).forEach(el=>el.dataset.go=download.origin);
    if(currentScreen==='D05')$('.state-hero p',host).textContent=download.files.length>1?`${download.files.length} 个文件`:download.files[0].filename;
  }
  $$('[data-manual-confirm]',host).forEach(el=>el.checked=stateData.manual[el.dataset.manualConfirm]);
  $$('[data-manual-next]',host).forEach(el=>el.disabled=!stateData.manual[el.dataset.manualNext]);
  if(currentScreen==='A06') $('.app-nav [data-go]',host).dataset.go=stateData.manual.origin;
  if(currentScreen==='B02' && stateData.manual.checking) {
    $('.state-hero h5',host).textContent='正在验证记录仪连接';
    $('.state-hero p',host).textContent='正在检查当前 Wi-Fi 与记录仪通信。';
    $('.step-list',host).outerHTML=steps([['检查当前 Wi-Fi','current'],['校验记录仪连接',''],['读取设备信息','']]);
    $$('[data-go="A05"]',host).forEach(el=>el.dataset.go='A07');
  }
  $$('[data-setting-value]',host).forEach(el=>el.textContent=stateData.settings[el.dataset.settingValue] || el.textContent);
  if(['F03','F04'].includes(currentScreen))renderShare(host);
  if(currentScreen==='G03')$('.offline-map-list',host).innerHTML=offlineMapRows(stateData.maps.installed);
  if(currentScreen==='F01')$('.app-nav [aria-label="返回"]',host).dataset.go=stateData.localOrigin;
  if(currentScreen==='X05') {
    const share=stateData.storageOrigin==='share';
    $('.app-nav h4',host).textContent=share?'分享视频':'下载录像';
    $('.state-hero p',host).textContent=share?'生成分享文件需要更多可用空间。':'此视频暂时无法下载。';
    $$('[data-go="D04"]',host).forEach(el=>el.dataset.go=share?'F03':'D04');
    const retry=$('[data-go="D05"]',host);retry.dataset.go=share?'F03':'D05';retry.textContent=share?'返回重新生成':'重新检查空间';
    if(share){$('.app-actions button:last-child',host).textContent='返回片段选择';$('.info-pair span:first-child',host).textContent='预计文件大小';$('.info-pair span:last-child',host).textContent=(Math.round(stateData.duration*30)/10)+' MB';}
  }
  $$('[data-timeline-label]',host).forEach(el=>el.textContent=`12:${stateData.timelineMinute}`);
  $$('[data-action="timeline"]',host).forEach(el=>el.value=stateData.timelineMinute);
  $$('.cursor',host).forEach(el=>el.style.left=((stateData.timelineMinute-30)/12*100)+'%');
  $$('[data-date-label]',host).forEach(el=>{const [y,m,d]=stateData.date.split('-');el.textContent=`${d}/${m}/${y}`;});
  $$('[data-date-offset]',host).forEach(el=>{const when=new Date(stateData.date+'T12:00:00');when.setDate(when.getDate()+Number(el.dataset.dateOffset));const month=String(when.getMonth()+1).padStart(2,'0'),day=String(when.getDate()).padStart(2,'0');el.textContent=`${month}-${day}`;el.setAttribute('aria-label',`${when.getFullYear()}-${month}-${day}`);});
  if(['C01','C02','B03'].includes(currentScreen))updateRecordingUI(host);
  if(['D02','D03'].includes(currentScreen)) {
    const [year,month,day]=stateData.date.split('-');
    $('.video-top > span',host).textContent=`${day}/${month}/${year} · 12:${stateData.timelineMinute}:00`;
    $('.video-time',host).textContent=`12:${stateData.timelineMinute}:00`;
    $('.video-watermark span',host).textContent=`${day}/${month}/${year}  12:${stateData.timelineMinute}:00`;
    const seek=$('[data-action="seek-video"]',host);seek.value=0;seek.style.setProperty('--played','0%');
  }
  if(currentScreen==='F06' && stateData.photoSource==='device') {
    $('.app-nav [data-go]',host).dataset.go='D01';
    $('[data-photo-tools]',host).innerHTML='<button class="btn primary" data-action="download-photo">'+icon('Download')+'下载照片</button><button class="btn outline" data-dialog="delete-device">'+icon('Trash2')+'删除</button>';
  }
  if(currentScreen==='F06') {
    const file=stateData.photoSource==='device'?stateData.media.file:stateData.media.localFile;
    if(file?.category==='图片'){$('.app-main img',host).src=ASSETS[file.image];$('.file-title-bar strong',host).textContent=file.filename;$('.file-title-bar small',host).textContent=file.date.split('-').reverse().join('/')+' · '+file.time+' / 3840 × 2160';}
  }
  if(['F02','F03','F04','F05'].includes(currentScreen) && stateData.media.localFile?.category!=='图片' && stateData.media.localFile) {
    const file=stateData.media.localFile;
    $$('.video-block > img,.filmstrip img,.mini-file img',host).forEach(img=>img.src=ASSETS[file.image]);
    $$('.file-title-bar strong,.mini-file strong',host).forEach(el=>el.textContent=file.filename);
    $$('.file-title-bar small',host).forEach(el=>el.textContent=file.date.split('-').reverse().join('/')+' · '+file.time+' / 4K · 01:00');
  }
  if(stateData.firmwareUpdated && currentScreen==='B03') $('.update-row',host)?.remove();
  if(stateData.deletedLocal && currentScreen==='F01') { $('.clip',host)?.remove(); const count=$('.hint',host); if(count)count.textContent='17 个文件 · 2.2 GB'; }
}
function openScreen(id, push = true) {
  const screen = SCREENS.find(item=>item.id===id);
  if(!screen) return boardToast('未找到页面 '+id);
  clearAppUpdateChecks();clearDataDownloads();clearSupportTasks();
  if(id==='F03'){
    const fileKey=stateData.media.localFile?.filename || 'sample-local-video';
    if(stateData.share.fileKey!==fileKey){stateData.share.fileKey=fileKey;stateData.share.start=0;stateData.share.sourceDuration=60;stateData.duration=60;stateData.share.error='';}
  }
  if(!['B01','B02','B06','X02'].includes(id))stateData.connection=null;
  if(id==='B06') {
    if(!stateData.connection)stateData.connection={device:{...stateData.activeDevice},returnTo:'A05',destination:'B03',source:'discovery'};
    stateData.connection.phase='failed';stateData.connection.error ||= 'wifi';
    stateData.connectedDeviceId=null;stateData.activeDevice.connected=false;
  }
  if(['B01','B02'].includes(id) && !stateData.connection)stateData.connection={device:{...SAVED_DEVICES[0]},returnTo:stateData.manual.checking?'A07':'A05',destination:'B03',source:stateData.manual.checking?'manual':'discovery',phase:'confirm'};
  if(id==='B02') {
    stateData.connection.phase='connecting';
    stateData.manual.checking=stateData.connection.source==='manual';
    stateData.connectedDeviceId=null;
    stateData.activeDevice.connected=false;
  }
  if(id!=='B02') stateData.manual.checking=false;
  if(id==='A02' || id==='B03') stateData.deviceHome=id;
  const dialog=$('#prototypeDialog');
  if(push && dialog.open && currentScreen!==id) history.push(currentScreen);
  if(!dialog.open) history=[];
  currentScreen=id; previewSession++; clearTimeout(autoTimer);
  $('#prototypeTitle').textContent=`${id} · ${screen.title}`;
  $('#prototypePhone').innerHTML=phone(screen);
  $('#screenSelect').value=id;
  $('#prototypeMeta').innerHTML=`<div class="review-status"><b class="dot ${screen.status}"></b>原页面方向：${screen.status==='confirmed'?'已确认':screen.status==='proposed'?'建议 / 待评审':'异常与恢复建议'}</div>${reviewControls(id)}${reviewNotes(screen)}`;
  $('.prototype-review').scrollTop=0;
  applyState($('#prototypePhone'));
  if(!dialog.open) dialog.showModal();
  initCarousels($('#prototypePhone'));
  dialog.scrollTop=0;
  if(id==='E06') stateData.firmwareUpdated=true;
  if(screen.auto) {
    const stamp=previewSession,attempt=stateData.connection;
    autoTimer=setTimeout(()=>{
      if(!dialog.open || previewSession!==stamp)return;
      if(id==='B02')return finishConnection(attempt);
      if(id==='D05' && stateData.media.download) {
        const task=stateData.media.download,media=stateData.media;
        media.downloaded[task.deviceId]=[...new Set([...(media.downloaded[task.deviceId]||[]),...task.files.map(file=>file.key)])];
        media.localFile=task.files[0];
        if(task.files.length>1){openScreen(task.origin);phoneToast($('.phone',$('#prototypePhone')),`${task.files.length} 个文件已保存到本地相册`);return;}
        if(task.files[0].category==='图片'){stateData.photoSource='local';openScreen('F06');phoneToast($('.phone',$('#prototypePhone')),'照片已保存到本地相册');return;}
      }
      openScreen(screen.auto.to);
    },screen.auto.ms);
  }
}
function closePrototype() { clearTimeout(autoTimer);clearRecordingRestore();clearAppUpdateChecks();clearDataDownloads();clearSupportTasks();previewSession++;stateData.connection=null;$('#prototypeDialog').close(); }
function goToSection(id) {
  const section=document.getElementById(id); if(!section)return;
  clearAppUpdateChecks();clearDataDownloads();clearSupportTasks();
  if(section.hidden) { $('#search').value=''; filterScreens(''); }
  activeLane=id;
  const viewport=$('#viewport'),a=section.getBoundingClientRect(),b=viewport.getBoundingClientRect();
  viewport.scrollTo({top:viewport.scrollTop+a.top-b.top-18,left:0,behavior:'smooth'});
  $$('.flow-nav-link').forEach(link=>link.classList.toggle('active',link.dataset.section===id));
  $('#sidebar').classList.remove('open');
}
function locateScreen(id) {
  closePrototype(); if($('#search').value){$('#search').value='';filterScreens('');}
  const node=$('#screen-'+id); const viewport=$('#viewport');
  const a=node.getBoundingClientRect(),b=viewport.getBoundingClientRect();
  viewport.scrollTo({top:viewport.scrollTop+a.top-b.top-80,left:viewport.scrollLeft+a.left-b.left-30,behavior:'smooth'});
  node.classList.add('located'); setTimeout(()=>node.classList.remove('located'),2500);
}
function filterScreens(query) {
  const normalized=query.trim().toLowerCase(); let matches=0;
  $$('.flow-lane').forEach(lane=>{
    let visible=0;
    $$('.screen-node',lane).forEach(node=>{const match=!normalized || node.dataset.search.toLowerCase().includes(normalized); node.classList.toggle('search-match',!!normalized&&match);if(match)visible++;});
    lane.hidden=visible===0;matches+=visible;
  });
  $('#decisions').hidden=!!normalized; $('#emptySearch').hidden=matches>0;
  $('#screenCount').textContent=normalized?`${matches} 个匹配`:`${SCREENS.length} 页`;
  if(normalized && matches) { const first=$('.screen-node.search-match'); if(first) { const viewport=$('#viewport'); const a=first.getBoundingClientRect(),b=viewport.getBoundingClientRect(); viewport.scrollTo({top:viewport.scrollTop+a.top-b.top-78,left:viewport.scrollLeft+a.left-b.left-30,behavior:'smooth'}); } }
}
function showDynamicSheet(origin,title,description,buttons,glyph='') {
  const host=origin.closest('.phone'); if(!host)return;
  dismissDynamicSheet(host);
  const holder=document.createElement('div'); holder.innerHTML=sheet(title,description,buttons,glyph);
  const layer=holder.firstElementChild;
  layer.classList.add('dynamic-layer'); host.append(layer);
  host.sheetTrigger=origin;
  syncSheetBackground(host);
  $('button, input',layer)?.focus({preventScroll:true});
}
const dialogCopy={
  'format':['格式化存储卡？','存储卡中的所有录像和照片将被删除。手机中已下载的文件将保留。','格式化'],
  'reset':['恢复默认设置？','设备设置将恢复为固件默认值。录像文件不会删除。','恢复默认'],
  'remove-device':['移除此设备？','只清除 App 中保存的设备信息，不删除记录仪中的录像。','移除设备'],
  'delete-device':['删除设备视频？','视频将从记录仪存储卡中删除，此操作无法撤销。手机中的副本不受影响。','删除视频'],
  'delete-map':['删除离线地图？','删除后，此区域需要重新下载才能离线使用。','删除地图'],
  'delete-photo':['删除本地照片？','该照片将从手机中删除，记录仪中的原文件不受影响。','删除照片']
};

function handleAction(action,el) {
  const host=el.closest('.phone');
  if(action==='cancel-share-export'){clearSupportTasks();openScreen('F02');return;}
  if(action==='cancel-map-download'){clearSupportTasks();return;}
  if(action==='start-map-download'){startMapDownload(el);return;}
  if(action==='delete-map'){
    const item=OFFLINE_MAPS.find(item=>item.id===el.dataset.mapId);if(!item)return;
    showDynamicSheet(el,'删除离线地图？',`删除“${item.name}”的本地地图包；已保存的视频和照片不受影响。`,dialogActions(actionButton('取消','dismiss-dialog','text'),`<button class="btn danger" data-action="confirm-map-delete" data-map-id="${item.id}">删除</button>`),'Trash2');return;
  }
  if(action==='confirm-map-delete'){delete stateData.maps.installed[el.dataset.mapId];$('.offline-map-list',host).innerHTML=offlineMapRows(stateData.maps.installed);dismissDynamicSheet(host);phoneToast(host,'地图已删除');return;}
  if(action==='check-map-update'){phoneToast(host,stateData.maps.result==='success'?'当前地图已是最新版本':'检查地图更新失败，请联网后重试');return;}
  if(action==='exit-settings'){exitSettings();return;}
  if(action==='retry-recording'){startRecordingRestore();return;}
  if(action==='discovery-page'){discoveryPage(el.closest('.discovered-carousel'),Number(el.dataset.index));return;}
  if(action==='cancel-connection'){cancelConnection();return;}
  if(action==='retry-connection') {
    const attempt=stateData.connection;
    if(attempt)startConnection(attempt.device,attempt.returnTo,attempt.destination,attempt.source);
    return;
  }
  if(action==='select-saved-device') {
    const device=stateData.savedDevices.find(item=>item.id===el.dataset.device);
    if(!device)return phoneToast(el,'设备记录已变化，请重新选择');
    if(device.id!==stateData.activeDevice.id){clearRecordingRestore();stateData.pausedForSettings=null;Object.assign(stateData.media,{category:'视频',scroll:0,file:null,download:null,channel:0});}
    stateData.activeDevice={...device,connected:device.id===stateData.connectedDeviceId};
    stateData.deviceHome='B03';
    openScreen('B03');
    phoneToast($('.phone',$('#prototypePhone')),stateData.activeDevice.connected?'已切换当前设备':'已切换设备；尚未连接 Wi-Fi');
    return;
  }
  if(action==='toggle'){const on=el.getAttribute('aria-checked')!=='true';el.setAttribute('aria-checked',on);el.classList.toggle('on',on);return;}
  if(action==='play'){const paused=el.getAttribute('aria-label')==='暂停';el.innerHTML=icon(paused?'Play':'Pause');el.setAttribute('aria-label',paused?'播放':'暂停');el.title=paused?'播放':'暂停';return;}
  if(action==='volume'){const mute=el.dataset.muted!=='true';el.dataset.muted=String(mute);el.innerHTML=icon(mute?'VolumeX':'Volume2');el.setAttribute('aria-label',mute?'开启声音':'关闭声音');el.title=el.getAttribute('aria-label');return;}
  if(action==='record'){if(stateData.restore)return;stateData.recording=!stateData.recording;updateRecordingUI(host);phoneToast(el,stateData.recording?'示例：录像已开始':'示例：录像已暂停');return;}
  if(action==='live-channel'){stateData.media.channel=(stateData.media.channel+1)%3;applyLiveControls(host);return;}
  if(action==='expand-live-tools'){stateData.media.expanded=!stateData.media.expanded;applyLiveControls(host);return;}
  if(action==='device-audio'){stateData.media.mic=!stateData.media.mic;applyLiveControls(host);return;}
  if(action==='mirror-video'){stateData.media.mirrored=!stateData.media.mirrored;applyLiveControls(host);return;}
  if(action==='calibration'){stateData.media.calibration=!stateData.media.calibration;applyLiveControls(host);return;}
  if(action==='switch-player'){showDynamicSheet(el,'切换播放器','', ['自动','播放器 1','播放器 2'].map(name=>`<button class="list-row" data-action="set-player" data-player="${name}"><span class="row-main">${name}</span>${stateData.media.player===name?icon('Check'):''}</button>`).join('')+actionButton('取消','dismiss-dialog','text'));return;}
  if(action==='set-player'){stateData.media.player=el.dataset.player;dismissDynamicSheet(host);phoneToast(host,'已选择'+stateData.media.player);return;}
  if(action==='fullscreen') { const videoEl=el.closest('.device-player') || el.closest('.video-block'); if(document.fullscreenElement)document.exitFullscreen?.();else if(videoEl?.requestFullscreen)videoEl.requestFullscreen().catch(()=>phoneToast(el,'全屏预览不可用'));return; }
  if(action==='download-timeline') {
    const channel=host.dataset.screenId==='D03'?'后路':'前路',time=`12:${stateData.timelineMinute}:00`;
    const file=fileContext({id:`timeline-${channel}-${time}`,time,channel,image:channel==='后路'?'figmaThumb1':'figmaThumb0',day:0},'视频');
    beginDownload([file],host.dataset.screenId);return;
  }
  if(action==='filter') {
    const changed=!el.classList.contains('active');
    const group=el.parentElement;$$('button',group).forEach(button=>button.classList.toggle('active',button===el));
    if(host.dataset.screenId==='D01') {
      if(changed){clearSelection(host);stateData.media.category=el.textContent.trim();stateData.media.scroll=0;renderDeviceAlbum(host);$('.album-scroll',host).scrollTop=0;}
      return;
    }
    const grid=$('.album-grid',host);
    if(grid){
      if(changed){$('.selection-bar',host)?.remove();$$('.clip',grid).forEach(clip=>{clip.classList.remove('selected');clip.style.outline='';});}
      const label=el.textContent.trim(),isPhoto=['照片','图片'].includes(label),local=host.dataset.screenId!=='D01';
      $$('.clip',grid).forEach((clip,index)=>{
        clip.hidden=label==='紧急'||label==='锁定'?index>1:false;
        const tag=$('.clip-tag',clip),time=$('.clip-time',clip),playIcon=$('.clip-thumb > .icon',clip);
        if(playIcon)playIcon.style.display=isPhoto?'none':'';
        $('small',clip).textContent=(local?'已下载 · ':'')+(isPhoto?'JPG · 3840 × 2160':index%2?'1920 × 1080':'3840 × 2160');
        if(tag && isPhoto){tag.textContent=label;clip.dataset.go='F06';clip.dataset.photoSource=local?'local':'device';if(time)time.textContent='JPG';}
        else{if(tag)tag.textContent=index%2?'后路':'前路';clip.dataset.go=local?'F02':'D04';delete clip.dataset.photoSource;if(time)time.textContent='01:00';}
      });
    }
    return;
  }
  if(action==='select-clips') {
    if(['D02','D03','X04'].includes(host.dataset.screenId)){stateData.media.category='视频';openScreen('D01');handleAction('select-clips',$('#prototypePhone [data-action="select-clips"]'));return;}
    if($('.selection-bar',host)){clearSelection(host);return;}
    if(host.dataset.screenId==='D01') {
      host.classList.add('is-selecting');el.innerHTML=icon('X');el.setAttribute('aria-label','取消选择');el.title='取消选择';
      $('.app-main',host).insertAdjacentHTML('beforeend',`<div class="app-actions selection-bar device-selection-bar"><div class="device-selection-summary"><span data-selection-count>已选择 0 个文件</span><button data-action="select-all">全选</button></div><div class="device-selection-tools"><button data-action="delete-selected" disabled>${icon('Trash2')}<span>删除</span></button><button data-action="download-selected" disabled>${icon('Download')}<span>下载</span></button></div></div>`);
      updateSelection(host);return;
    }
    const bar=document.createElement('div');bar.className='app-actions selection-bar';bar.innerHTML=`<div class="small" data-selection-count>已选择 0 个文件</div><div class="button-row"><button class="btn secondary" data-action="select-all">全选</button><button class="btn danger" data-action="delete-selected">${icon('Trash2')}删除</button></div>`;$('.app-main',host).append(bar);phoneToast(el,'选择需要管理的文件');return;
  }
  if(action==='select-all'){const clips=$$('.clip:not([hidden])',host),selected=clips.every(c=>c.classList.contains('selected'));clips.forEach(c=>{c.classList.toggle('selected',!selected);if(host.dataset.screenId!=='D01')c.style.outline=selected?'':'2px solid #078a96';});updateSelection(host);return;}
  if(action==='download-selected') {
    const files=$$('.clip.selected',host).map(el=>fileContext(DEVICE_FILES.find(file=>file.id===el.dataset.fileId)));
    if(files.length)beginDownload(files,'D01');return;
  }
  if(action==='delete-selected'){const count=$$('.clip.selected',host).length;if(!count)return phoneToast(el,'尚未选择文件');showDynamicSheet(el,`删除 ${count} 个文件？`,currentScreen==='F01'?'将删除手机中的所选文件，设备原文件不受影响。':'将删除记录仪存储卡中的所选文件。',dialogActions(actionButton('取消','dismiss-dialog','text'),actionButton('删除','confirm-selection-delete','danger')),'Trash2');return;}
  if(action==='confirm-selection-delete'){
    if(host.dataset.screenId==='D01'){
      const id=stateData.activeDevice.id,keys=$$('.clip.selected',host).map(c=>stateData.media.category+':'+c.dataset.fileId);
      stateData.media.deleted[id]=[...new Set([...(stateData.media.deleted[id]||[]),...keys])];clearSelection(host);renderDeviceAlbum(host);
    }else{$$('.clip.selected',host).forEach(c=>c.remove());clearSelection(host);}
    dismissDynamicSheet(host);phoneToast(host,'示例：所选文件已删除');return;
  }
  if(action==='choose-setting') { if(el.dataset.setting==='resolution')return openScreen('C04');const key=el.dataset.setting,values=key==='loop'?['1 分钟','3 分钟','5 分钟']:['低','中','高'];showDynamicSheet(el,key==='loop'?'循环录像':'碰撞灵敏度','',values.map(value=>`<button class="list-row" data-action="set-value" data-setting="${key}" data-value="${value}"><span class="row-main">${value}</span>${stateData.settings[key]===value?icon('Check'):''}</button>`).join('')+'<button class="btn text" data-action="dismiss-dialog">取消</button>');return;}
  if(action==='set-resolution'){stateData.settings.resolution=el.dataset.value;openScreen('C03');phoneToast($('.phone',$('#prototypePhone')),'示例：设置已保存');return;}
  if(action==='set-value'){stateData.settings[el.dataset.setting]=el.dataset.value;applyState(host);dismissDynamicSheet(host);phoneToast(host,'示例：设置已保存');return;}
  if(action==='dismiss-dialog'){dismissDynamicSheet(host);return;}
  if(action==='confirm-dialog'){
    const kind=el.dataset.kind;dismissDynamicSheet(host);
    if(kind==='remove-device')return openScreen('A02');
    if(kind==='delete-photo'){openScreen('F01');return boardToast('示例：本地照片已删除');}
    if(kind==='delete-device'){const id=stateData.activeDevice.id,file=stateData.media.file||fileContext();stateData.media.deleted[id]=[...new Set([...(stateData.media.deleted[id]||[]),file.key])];openScreen('D01');return phoneToast($('.phone',$('#prototypePhone')),'示例：设备文件已删除');}
    if(kind==='delete-map'){const row=$('.list-row',host);if(row)row.innerHTML='<span class="row-main">尚未下载离线地图</span>';return phoneToast(host,'示例：地图已删除');}
    if(kind==='format'||kind==='reset') return phoneToast(host,'示例操作完成，未操作真实设备');
    return;
  }
  if(action==='delete-local'){stateData.deletedLocal=true;openScreen('F01');return phoneToast($('.phone',$('#prototypePhone')),'示例：本地文件已删除');}
  if(action==='download-photo'){stateData.media.localFile=stateData.media.file;stateData.photoSource='local';openScreen('F06',false);return boardToast('示例：照片已保存到本地');}
  if(action==='share-photo'){showDynamicSheet(el,'分享照片','M2_20260910_123601.jpg',dialogActions(actionButton('取消','dismiss-dialog','text'),'<button class="btn primary" data-action="share-system" data-target="系统分享">'+icon('Share2')+'打开系统分享</button>'));return;}
  if(action==='clear-cache'){openScreen('G01');$$('.row-value',$('#prototypePhone')).forEach(v=>{if(v.textContent==='128 MB')v.textContent='0 MB';});return phoneToast($('.phone',$('#prototypePhone')),'示例：缓存已清除，录像已保留');}
  if(action==='download-data'){downloadDataPackage(el);return;}
  if(action==='download-map'){mapPicker(el);return;}
  if(action==='map-details'){
    const item=OFFLINE_MAPS.find(item=>item.id===el.dataset.mapId);if(!item)return;
    const outdated=stateData.maps.installed[item.id]!==item.version;
    showDynamicSheet(el,'离线地图详情',`${item.name}<br>${item.size} · ${stateData.maps.installed[item.id]}<br>${outdated?'有新版本 '+item.version:'已下载'}`,`<div class="dialog-actions"><button class="btn text" data-action="delete-map" data-map-id="${item.id}">删除地图</button><button class="btn primary" data-action="${outdated?'start-map-download':'check-map-update'}" data-map-id="${item.id}">${outdated?'更新地图':'检查更新'}</button></div>`+actionButton('关闭','dismiss-dialog','text'),'Map');return;
  }
  if(action==='check-app-update'){checkAppUpdate(el);return;}
  if(action==='open-store'){dismissDynamicSheet(host);phoneToast(host,'将打开应用商店，正式链接待接入');return;}
  if(action==='get-feedback-logs'){el.textContent='已获取';el.disabled=true;return phoneToast(el,'设备日志已准备（示例）');}
  if(action==='feedback-help'){return phoneToast(el,'日志仅在用户确认后附加到反馈');}
  if(action==='attach'){$('.attach-input',host).click();return;}
  if(action==='submit-feedback'){const textarea=$('[data-feedback-message]',host),contact=$('[data-feedback-contact]',host);if(!textarea.value.trim()){textarea.focus();return phoneToast(el,'请填写问题描述');}if(!contact.value.trim()){contact.focus();return phoneToast(el,'请输入手机号或邮箱');}if(contact.value.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.value.trim())){contact.focus();return phoneToast(el,'请填写有效的邮箱地址');}if(!contact.value.includes('@') && !/^[+\d][\d\s-]{6,}$/.test(contact.value.trim())){contact.focus();return phoneToast(el,'请填写有效的手机号或邮箱');}phoneToast(el,'本地校验通过；提交接口待接入，未发送');return;}
  if(action==='share-system'){phoneToast(el,`交互终点：交给${el.dataset.target==='更多'?'系统分享':el.dataset.target}，未实际发布`);return;}
  if(action==='save-video'){phoneToast(el,'交互终点：存储到系统相册，原型未生成真实视频');return;}
  if(action==='terms'||action==='privacy'){showDynamicSheet(el,action==='terms'?'服务条款':'隐私政策','沿用现有正式文档。文档内容和正式地址需接入后展示。','<button class="btn primary" data-action="dismiss-dialog">返回</button>','FileText');return;}
  if(action==='calendar'){showDynamicSheet(el,'选择日期','',`<input class="feedback-input" type="date" value="${stateData.date}" aria-label="录像日期">${dialogActions(actionButton('取消','dismiss-dialog','text'),actionButton('确定','set-date','primary'))}`);return;}
  if(action==='set-date'){const date=$('input[type=date]',host).value;if(!date)return phoneToast(el,'请选择日期');stateData.date=date;applyState(host);dismissDynamicSheet(host);phoneToast(host,'日期已选择；录像数据为示例');return;}
  if(action==='date-prev'){const label=$('[data-date-label]',host);const [day,month,year]=label.textContent.split('/').map(Number);const previous=new Date(year,month-1,day-1);stateData.date=`${previous.getFullYear()}-${String(previous.getMonth()+1).padStart(2,'0')}-${String(previous.getDate()).padStart(2,'0')}`;applyState(host);return;}
  if(action==='date-offset'){stateData.date=el.getAttribute('aria-label');applyState(host);return;}
  if(action==='file-info'){showDynamicSheet(el,'文件信息','M2_20260910_123600_F.mp4<br>3840 × 2160 · 30fps<br>01:00 · 180 MB', '<button class="btn primary" data-action="dismiss-dialog">关闭</button>','FileVideo');return;}
  if(action==='storage-info'){showDynamicSheet(el,'存储卡','总容量 128 GB<br>可用空间 32.4 GB<br>状态正常','<button class="btn primary" data-action="dismiss-dialog">关闭</button>','MemoryStick');return;}
  if(action==='upgrade-status'){phoneToast(el,'正在等待设备重连与版本响应');return;}
}

document.addEventListener('click',event=>{
  const sectionLink=event.target.closest('[data-section]');if(sectionLink){event.preventDefault();goToSection(sectionLink.dataset.section);return;}
  const el=event.target.closest('button');if(!el || el.disabled)return;
  const command=el.dataset.command;
  if(command){
    if(command==='restart'){clearSupportTasks();clearDataDownloads();stateData.share={start:0,sourceDuration:60,result:'success',error:''};stateData.duration=60;stateData.localOrigin='G01';stateData.storageOrigin='download';stateData.maps={installed:Object.fromEntries(OFFLINE_MAPS.map(item=>[item.id,item.version])),result:'success'};stateData.appUpdateKnown=true;stateData.dataDownloads={};stateData.dataDownloadResult='success';}
    if(command==='menu')$('#sidebar').classList.toggle('open');
    if(command==='prototype')openScreen('B03');
    if(command==='board')closePrototype();
    if(command==='close-prototype')closePrototype();
    if(command==='zoom-in')setZoom(zoom+.1);
    if(command==='zoom-out')setZoom(zoom-.1);
    if(command==='fit'){const lane=document.getElementById(activeLane);const row=lane?.querySelector('.flow-row');setZoom(row?($('#viewport').clientWidth-60)/row.offsetWidth:.8);$('#viewport').scrollLeft=0;}
    if(command==='print')window.print();
    if(command==='clear-search'){$('#search').value='';filterScreens('');}
    if(command==='back'){const previous=history.pop();if(previous)openScreen(previous,false);else boardToast('已经是本次预览的起点');}
    if(command==='restart'){history=[];clearRecordingRestore();stateData.pausedForSettings=null;stateData.restoreResult='success';stateData.activeDevice={...SAVED_DEVICES[0],connected:true};stateData.connectedDeviceId='m2';stateData.savedDevices=[...SAVED_DEVICES];stateData.connectionResult='success';stateData.appUpdateResult='available';stateData.currentAppVersion='4.0.0';stateData.availableAppVersion='4.1.0';stateData.settingsOrigin='C01';stateData.albumOrigin='C01';stateData.firmwareUpdated=false;stateData.deletedLocal=false;stateData.recording=true;stateData.wasRecording=true;stateData.media={category:'视频',scroll:0,file:null,download:null,deleted:{},downloaded:{},localFile:null,channel:0,expanded:true,mic:true,mirrored:false,calibration:false,player:'自动'};openScreen('B03',false);}
    if(command==='locate')locateScreen(currentScreen);
    return;
  }
  if(el.dataset.tab) {
    const origin=el.closest('.phone');
    if(!origin.closest('#prototypePhone') && ['A02','B03'].includes(origin.dataset.screenId)) stateData.deviceHome=origin.dataset.screenId;
    const target=el.dataset.tab==='device'?stateData.deviceHome:el.dataset.go;
    if(origin.closest('#prototypePhone') && target===currentScreen)return;
    history=[];openScreen(target,false);return;
  }
  if(el.hasAttribute('data-manual-entry')) {
    stateData.manual={origin:el.closest('.phone').dataset.screenId,installed:false,wifi:false,checking:false};
    openScreen('A06');return;
  }
  if(el.dataset.manualNext) {
    const key=el.dataset.manualNext;
    if(!$(`[data-manual-confirm="${key}"]`,el.closest('.phone')).checked)return;
    if(key==='wifi')stateData.manual.checking=true;
    openScreen(el.dataset.go);return;
  }
  if(el.hasAttribute('data-connection-cancel')){cancelConnection();return;}
  if(el.dataset.discoveredDevice) {
    if(performance.now()<(el.closest('.discovered-viewport').suppressClickUntil || 0))return;
    const device=DISCOVERED_DEVICES.find(item=>item.id===el.dataset.discoveredDevice);
    if(device)startConnection(device);
    return;
  }
  if(el.closest('.clip') && $('.selection-bar',el.closest('.phone'))){const host=el.closest('.phone');el.classList.toggle('selected');if(host.dataset.screenId!=='D01')el.style.outline=el.classList.contains('selected')?'2px solid #078a96':'';updateSelection(host);return;}
  if(el.dataset.go){
    if(el.dataset.photoSource)stateData.photoSource=el.dataset.photoSource;
    const origin=el.closest('.phone')?.dataset.screenId;
    if(el.dataset.go==='F01' && ['G01','C01','D01','X05'].includes(origin))stateData.localOrigin=origin;
    if(el.dataset.go==='X05' && origin!=='F01')stateData.storageOrigin=origin==='F03'?'share':'download';
    if(el.dataset.go==='F04' && origin==='F03'){beginShareExport(el);return;}
    if(el.dataset.go==='F03' && origin==='F02')stateData.share.error='';
    if(origin==='D01')stateData.media.scroll=$('.album-scroll',el.closest('.phone')).scrollTop;
    if(el.dataset.fileId)stateData.media.file=fileContext(DEVICE_FILES.find(file=>file.id===el.dataset.fileId));
    if(el.dataset.go==='D05' && origin==='D04'){beginDownload([stateData.media.file || fileContext(DEVICE_FILES[0],'视频')],'D04');return;}
    if(origin && gateDeviceEntry(el.dataset.go,origin))return;
    if(el.dataset.go==='D01' && ['B03','C01'].includes(origin))stateData.albumOrigin=origin;
    if(el.dataset.go==='C02'){
      if(origin && stateData.restore)return phoneToast(el,stateData.restore.phase==='pending'?'正在恢复录像，请稍候':'请先重试并确认录像状态');
      stateData.settingsOrigin=origin || 'C01';
      stateData.wasRecording=stateData.recording;
      stateData.pausedForSettings=null;
      if(!stateData.recording && el.closest('#prototypePhone'))return openScreen('C03');
    }
    if(el.dataset.go==='C03' && currentScreen==='C02' && el.closest('#prototypePhone')) {
      stateData.wasRecording=stateData.recording;
      el.disabled=true;el.textContent='正在暂停录像…';
      const stamp=previewSession;
      setTimeout(()=>{if(previewSession!==stamp || !$('#prototypeDialog').open)return;stateData.pausedForSettings=stateData.wasRecording?stateData.activeDevice.id:null;stateData.recording=false;openScreen('C03');},700);
      return;
    }
    openScreen(el.dataset.go);return;
  }
  if(el.dataset.dialog){let [title,description,label]=dialogCopy[el.dataset.dialog];if(el.dataset.dialog==='delete-device' && currentScreen==='F06'){title='删除设备照片？';description='照片将从记录仪存储卡中删除，手机中的副本不受影响。';label='删除照片';}showDynamicSheet(el,title,description,dialogActions(actionButton('取消','dismiss-dialog','text'),`<button class="btn danger" data-action="confirm-dialog" data-kind="${el.dataset.dialog}">${label}</button>`),'CircleAlert');return;}
  if(el.dataset.action)handleAction(el.dataset.action,el);
});
document.addEventListener('input',event=>{
  const el=event.target,host=el.closest('.phone');
  if(el.dataset.action==='share-duration'){stateData.duration=Number(el.value);stateData.share.error='';renderShare(host);}
  if(el.dataset.action==='share-start'){stateData.share.start=Number(el.value);stateData.share.error='';renderShare(host);}
  if(el.dataset.action==='timeline'){stateData.timelineMinute=Number(el.value);applyState(host);}
  if(el.dataset.action==='seek-video'){
    const seconds=Number(el.value),time=$('.video-time',el.closest('.device-player'));
    el.style.setProperty('--played',(seconds/60*100)+'%');
    time.textContent=['D02','D03'].includes(host.dataset.screenId)?`12:${stateData.timelineMinute+Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`:`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  }
  if(el.matches('[data-feedback-message]')) $('[data-feedback-count]',host).textContent=`${el.value.length}/150`;
});
document.addEventListener('change',event=>{
  const el=event.target;
  if(el.hasAttribute('data-share-result'))stateData.share.result=el.value;
  if(el.hasAttribute('data-share-source')){clearSupportTasks();stateData.share.sourceDuration=Number(el.value);stateData.share.start=0;stateData.duration=Math.min(60,Number(el.value));stateData.share.error='';renderShare($('#prototypePhone'));}
  if(el.hasAttribute('data-map-result'))stateData.maps.result=el.value;
  if(el.hasAttribute('data-map-catalog')){clearSupportTasks();stateData.maps.installed=el.value==='empty'?{}:Object.fromEntries(OFFLINE_MAPS.map(item=>[item.id,el.value==='update'&&item.id==='hn'?'2026.08':item.version]));const host=$('#prototypePhone .phone');dismissDynamicSheet(host);$('.offline-map-list',host).innerHTML=offlineMapRows(stateData.maps.installed);}
  if(el.hasAttribute('data-discovery-count')) {
    stateData.discoveredCount=Number(el.value);stateData.discoveryIndex=0;
    const host=$('#prototypePhone');applyState(host);initCarousels(host);
  }
  if(el.hasAttribute('data-connection-result'))stateData.connectionResult=el.value;
  if(el.hasAttribute('data-restore-result'))stateData.restoreResult=el.value;
  if(el.hasAttribute('data-app-update-result')) { stateData.appUpdateResult=el.value;applyState($('#prototypePhone')); }
  if(el.hasAttribute('data-data-result'))stateData.dataDownloadResult=el.value;
  if(el.dataset.manualConfirm) {
    const key=el.dataset.manualConfirm;
    stateData.manual[key]=el.checked;
    if(key==='installed' && !el.checked)stateData.manual.wifi=false;
    $('[data-manual-next]',el.closest('.phone')).disabled=!el.checked;
  }
  if(el.classList.contains('attach-input')){const file=el.files[0];if(file)phoneToast(el,'已选择 '+file.name+'，未上传');}
});
$('#showNotes').addEventListener('change',event=>document.body.classList.toggle('notes-hidden',!event.target.checked));
$('#search').addEventListener('input',event=>filterScreens(event.target.value));
$('#screenSelect').addEventListener('change',event=>openScreen(event.target.value));
$('#prototypeDialog').addEventListener('cancel',()=>{clearTimeout(autoTimer);clearRecordingRestore();clearAppUpdateChecks();clearDataDownloads();clearSupportTasks();previewSession++;stateData.connection=null;});
$('#prototypeDialog').addEventListener('click',event=>{if(event.target===$('#prototypeDialog'))closePrototype();});
let printDetails = null;
window.addEventListener('beforeprint',()=>{
  if (printDetails) return;
  printDetails = $$('.guidance-source').map(node=>({node,open:node.open}));
  printDetails.forEach(({node})=>node.open=true);
});
window.addEventListener('afterprint',()=>{
  printDetails?.forEach(({node,open})=>node.open=open);
  printDetails=null;
});
let scrollTick=false;
$('#viewport').addEventListener('scroll',()=>{if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{scrollTick=false;const viewport=$('#viewport');const boundary=viewport.getBoundingClientRect().top+180;let current=null;$$('.flow-lane:not([hidden])').forEach(lane=>{if(lane.getBoundingClientRect().top<=boundary)current=lane.id;});if(current){activeLane=current;$$('.flow-nav-link').forEach(link=>link.classList.toggle('active',link.dataset.section===current));}});},{passive:true});
new ResizeObserver(entries=>{document.documentElement.style.setProperty('--view-width',entries[0].contentRect.width+'px');}).observe($('#viewport'));
renderBoard();hydrateIcons();setZoom(zoom);initCarousels(document);
window.UX_REVIEW = {screens:SCREENS.map(({id,lane,title,status,refs})=>({id,lane,title,status,refs})),lanes:LANES,openScreen,setZoom,goToSection,closePrototype};
