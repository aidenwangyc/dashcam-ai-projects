const fs = require('fs');
const path = require('path');
const sharp = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const lucide = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide');
const root = path.resolve(__dirname, '..');
const source = path.join(root, '.analysis');
const guidance = JSON.parse(fs.readFileSync(path.join(__dirname, 'guidance.json'), 'utf8'));
const appSource = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const screenIds = [...appSource.matchAll(/add\('([A-Z]\d{2})'/g)].map(match => match[1]);
if (screenIds.length !== Object.keys(guidance.screens).length) throw new Error('Guidance screen count mismatch');
for (const id of screenIds) {
  for (const key of ['business', 'interaction', 'exception', 'pending']) {
    const items = guidance.screens[id]?.[key];
    if (!Array.isArray(items) || !items.length || items.some(item => typeof item !== 'string' || !item.trim())) {
      throw new Error('Missing guidance: ' + id + '.' + key);
    }
  }
}
const iconNames = ['Menu','PanelsTopLeft','Smartphone','Minus','Plus','Scan','Printer','Search','SearchX','ListChecks','X','ArrowLeft','ArrowRight','LocateFixed','RotateCcw','ChevronLeft','ChevronRight','ChevronDown','ChevronUp','Signal','Wifi','WifiOff','BatteryFull','Camera','Video','Circle','Square','Pause','Play','Bluetooth','BluetoothSearching','Settings','Settings2','Images','Image','Folder','Download','Upload','Check','CheckCheck','CheckCircle2','CircleCheck','CircleHelp','Info','Ellipsis','RefreshCw','RefreshCcw','Radio','LoaderCircle','ShieldCheck','CircleAlert','TriangleAlert','Map','MapPin','Gauge','Volume2','VolumeX','Maximize','Share2','Trash2','CalendarDays','SlidersHorizontal','HardDrive','Clock3','LockKeyhole','Mail','MessageSquare','FileText','ExternalLink','Scissors','MoveHorizontal','FileVideo','ArrowUpRight','Navigation','Bell','CloudDownload','Cable','Power','MonitorSmartphone','List','LayoutGrid','Unplug','CircleX','Send','Copy','FileDown','Database','Navigation2','LogOut','Shield','BadgeCheck','Eye','CircleStop','OctagonAlert','CheckCircle','FileCheck','ArrowDownToLine','WifiHigh','BluetoothConnected','ChevronsUpDown','Paperclip','FileImage','Flag','CircleDot','MemoryStick','CircleChevronRight','Aperture'];
iconNames.push('Radar');
iconNames.push('Mic','MicOff','SquareChevronUp','SquareChevronDown');
const escape = value => String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const icons = {};
for (const name of iconNames) {
  if (!lucide[name]) throw new Error('Missing Lucide icon: ' + name);
  icons[name] = lucide[name].map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([key,value]) => `${key}="${escape(value)}"`).join(' ')}></${tag}>`).join('');
}
async function imageAsset(file, region, width, name, base = source) {
  const image = sharp(path.join(base,file)).extract(region).resize({width}).jpeg({quality:88});
  const data = await image.toBuffer();
  fs.mkdirSync(path.join(__dirname,'assets'),{recursive:true});
  fs.writeFileSync(path.join(__dirname,'assets',name+'.jpg'),data);
  return 'data:image/jpeg;base64,' + data.toString('base64');
}
(async () => {
  const assets = {};
  assets.device = await imageAsset('image_34_N29.png',{left:245,top:292,width:380,height:258},480,'device');
  assets.road = await imageAsset('image_20_G33.png',{left:4,top:224,width:434,height:153},868,'road');
  assets.map = await imageAsset('image_45_M51.png',{left:1,top:269,width:239,height:193},478,'map');
  const references = path.join(__dirname,'references');
  const figmaAssets = path.join(references,'figma-modular');
  const manifest = JSON.parse(fs.readFileSync(path.join(figmaAssets,'manifest.json'),'utf8'));
  for (const {key,file} of manifest.files) {
    const isSvg = path.extname(file) === '.svg';
    const data = isSvg ? fs.readFileSync(path.join(figmaAssets,file)) : await sharp(path.join(figmaAssets,file)).resize({width:key==='figmaRoad'?1000:750,withoutEnlargement:true}).jpeg({quality:85}).toBuffer();
    assets[key] = `data:${isSvg?'image/svg+xml':'image/jpeg'};base64,${data.toString('base64')}`;
  }
  assets.manualInstall = await imageAsset('manual-install-source.jpg',{left:60,top:1135,width:1050,height:705},700,'manual-install',references);
  assets.manualWifi = await imageAsset('manual-wifi-source.jpg',{left:60,top:1045,width:1050,height:870},600,'manual-wifi',references);
  const html = fs.readFileSync(path.join(__dirname,'index.html'),'utf8')
    .replace('/*__STYLES__*/',()=>fs.readFileSync(path.join(__dirname,'styles.css'),'utf8') + '\n' + fs.readFileSync(path.join(__dirname,'overrides.css'),'utf8'))
    .replace('/*__ASSETS__*/',()=>JSON.stringify(assets))
    .replace('/*__ICONS__*/',()=>JSON.stringify(icons))
    .replace('/*__APP__*/',()=> 'const GUIDE = ' + JSON.stringify(guidance).replace(/</g, '\\u003c') + ';\n' + appSource);
  const output = path.join(root,'VM_REC_4.0.0_UX展开图.html');
  fs.writeFileSync(output,html);
  console.log(JSON.stringify({output,bytes:Buffer.byteLength(html),icons:iconNames.length,assets:Object.keys(assets)}));
})().catch(error=>{console.error(error);process.exitCode=1;});
