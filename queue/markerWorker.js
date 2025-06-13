const { Worker } = require('bullmq');
const path = require('path');
const { generateNFTMarkerWithPuppeteer } = require('../utils/generateNFTMarker');

new Worker('markers', async job => {
  const { imagePath, outputDir } = job.data;
  await generateNFTMarkerWithPuppeteer(imagePath, outputDir);
  // Aquí puedes agregar lógica para notificar, actualizar DB, etc.
}, { 
  connection: { 
    port: 8768, 
    username: 'default', 
    host: '168.231.94.201', 
    password: '1rAsEOjoGqIQjRHyAPQIs9EooeX0eaYvcnOcI9maO1N9BaD8Ju2l5ndFJqVFQHpO', 
  } 
});

console.log('Worker de marcadores NFT iniciado...');
