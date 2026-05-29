const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const workspaceRoot = __dirname;
const distDir = path.join(workspaceRoot, 'dist');
const htmlPath = path.join(distDir, 'erp-production-book.html');
const pdfPath = path.join(distDir, 'erp-production-book.pdf');

function resolveBrowser() {
  const candidates = [
    process.env.BROWSER_PATH,
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);

  return candidates.find(candidate => fs.existsSync(candidate)) || '';
}

function main() {
  if (!fs.existsSync(htmlPath)) {
    console.error(`Missing HTML build artifact: ${htmlPath}`);
    console.error('Run `npm run build` before exporting the PDF.');
    process.exit(1);
  }

  const browserPath = resolveBrowser();
  if (!browserPath) {
    console.error('No supported browser executable was found for PDF export.');
    console.error('Set BROWSER_PATH or CHROME_PATH to a local Chrome/Edge executable.');
    process.exit(1);
  }

  const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  const args = [
    '--headless=new',
    '--disable-gpu',
    `--print-to-pdf=${pdfPath}`,
    fileUrl,
  ];

  const result = spawnSync(browserPath, args, {
    cwd: workspaceRoot,
    encoding: 'utf8',
    windowsHide: true,
  });

  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    console.error(`PDF export failed with exit code ${result.status ?? 'unknown'}.`);
    process.exit(result.status || 1);
  }

  if (!fs.existsSync(pdfPath)) {
    console.error('Chrome/Edge completed without producing the expected PDF file.');
    process.exit(1);
  }

  console.log(`PDF generated: ${pdfPath}`);
  console.log(`Browser: ${browserPath}`);
}

main();