const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'VM_REC_4.0.0_UX展开图.html'), 'utf8');
const captureStyle = `<style>
html, body { width: 3240px !important; height: auto !important; overflow: visible !important; }
.workbar, .sidebar, .node-open, .board-toast, #prototypeDialog { display: none !important; }
.workspace, #viewport { display: block !important; width: 3240px !important; height: auto !important; overflow: visible !important; }
.canvas-top, .handoff-intro, .lane-head { position: static !important; width: auto !important; }
.handoff-intro { width: 1500px !important; }
#stage { zoom: 1 !important; width: 3240px !important; padding: 0 36px 48px !important; }
.flow-lane { width: 3168px !important; min-width: 0 !important; }
.flow-row { width: max-content !important; }
.rules-section { width: 1800px !important; }
.guidance-source { display: block !important; }
* { animation: none !important; transition: none !important; }
</style>`;
const captureScript = `<script>
document.querySelectorAll('.guidance-source').forEach(node => node.open = true);
document.querySelectorAll('.screen-node').forEach(node => {
  node.setAttribute('data-figma-name', node.id.replace('screen-', '') + ' · ' + node.querySelector('h3').textContent);
});
document.querySelectorAll('.flow-lane').forEach(node => node.setAttribute('data-figma-name', node.querySelector('h2').textContent));
document.title = 'VM REC 4.0.0 · ' + document.querySelectorAll('.screen-node').length + ' 页面与业务规则 · 20260911 最新版';
</script><script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>`;
const output = source.replace('</head>', captureStyle + '</head>').replace('</body>', captureScript + '</body>');
const file = path.join(__dirname, 'figma-capture.html');
fs.writeFileSync(file, output);
console.log(JSON.stringify({file, bytes: Buffer.byteLength(output)}));
