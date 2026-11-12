const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlSrc = path.join(__dirname, 'ShipMS_3D_Hologram_Study_Guide.html');
const pdfDest1 = path.join(__dirname, 'ShipMS_3D_Hologram_Study_Guide.pdf');

const home = os.homedir();
let desktop = path.join(home, 'Desktop');
if (!fs.existsSync(desktop)) {
  const onedriveDesktop = path.join(home, 'OneDrive', 'Desktop');
  if (fs.existsSync(onedriveDesktop)) {
    desktop = onedriveDesktop;
  }
}
const desktopFolder = path.join(desktop, 'hologram 2.o');
const pdfDest2 = path.join(desktopFolder, 'ShipMS_3D_Hologram_Study_Guide.pdf');
const htmlDest2 = path.join(desktopFolder, 'ShipMS_3D_Hologram_Study_Guide.html');

console.log('Generating PDF from:', htmlSrc);

const args = [
  '--headless',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${pdfDest1}`,
  `file:///${htmlSrc.replace(/\\/g, '/')}`
];

const result = spawnSync(edgePath, args, { stdio: 'inherit' });

if (fs.existsSync(pdfDest1)) {
  console.log('PDF successfully created at:', pdfDest1, 'Size:', fs.statSync(pdfDest1).size, 'bytes');
  if (!fs.existsSync(desktopFolder)) {
    fs.mkdirSync(desktopFolder, { recursive: true });
  }
  fs.copyFileSync(pdfDest1, pdfDest2);
  fs.copyFileSync(htmlSrc, htmlDest2);
  console.log('PDF & HTML successfully copied to Desktop folder:', pdfDest2);
} else {
  console.error('PDF creation failed, status:', result.status);
}
