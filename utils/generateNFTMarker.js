const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const { Queue } = require('bullmq');
const { Worker } = require('bullmq');

async function generateNFTMarkerWithPuppeteer(imagePath, outputDir) {
  console.log(imagePath);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    const downloadPath = path.resolve(outputDir, 'downloads');
    if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath, { recursive: true });

    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadPath,
    });

    await page.goto('https://carnaux.github.io/NFT-Marker-Creator/', { waitUntil: 'networkidle2' });

    // Sube la imagen al input file
    const input = await page.$('input[type="file"]');
    await input.uploadFile(imagePath);

    // Captura de pantalla para depuración
    await page.screenshot({ path: path.join(outputDir, 'debug_nft_marker.png') });

    // Espera a que el botón de descarga esté presente (timeout 30s)
    await page.waitForSelector('button[onclick*="downloadMarker"]', { timeout: 30000 });
    const downloadBtn = await page.$('button[onclick*="downloadMarker"]');
    console.log(downloadBtn);
    const isDisabled = await page.evaluate(btn => btn.disabled, downloadBtn);
    if (!isDisabled) {
      await downloadBtn.click();
    } else {
      throw new Error('El botón de descarga sigue deshabilitado');
    }

    // Espera a que aparezca el ZIP y que no esté en descarga (.crdownload)
    let zipFile;
    for (let i = 0; i < 40; i++) { // hasta 20 segundos
      const files = fs.readdirSync(downloadPath);
      zipFile = files.find(f => f.endsWith('.zip'));
      const downloading = files.find(f => f.endsWith('.crdownload'));
      if (zipFile && !downloading) break;
      await new Promise(r => setTimeout(r, 500));
    }
    if (!zipFile) throw new Error('No se encontró el ZIP de markers descargado');
    const zipPath = path.join(downloadPath, zipFile);

    // Extrae .iset, .fset, .fset3
    const zip = new AdmZip(zipPath);
    zip.getEntries().forEach(entry => {
      if (
        entry.entryName.endsWith('.iset') ||
        entry.entryName.endsWith('.fset') ||
        entry.entryName.endsWith('.fset3')
      ) {
        const dest = path.join(outputDir, path.basename(entry.entryName));
        fs.writeFileSync(dest, entry.getData());
      }
    });

    // Limpia ZIP y descargas
    fs.unlinkSync(zipPath);
    fs.rmSync(downloadPath, { recursive: true, force: true });
  } finally {
    await browser.close();
  }
}

const myQueue = new Queue('markers', { connection: { host: 'localhost', port: 6379 } });

const worker = new Worker('markers', async job => {
  const { imagePath, outputDir } = job.data;
  await generateNFTMarkerWithPuppeteer(imagePath, outputDir);
  // Aquí puedes notificar al usuario, actualizar la base de datos, etc.
}, { connection: { host: 'localhost', port: 6379 } });

module.exports = { generateNFTMarkerWithPuppeteer, myQueue };
