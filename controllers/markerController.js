const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabase');
const { spawn } = require('child_process');

exports.generateMarker = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const ar_experience_id = req.body.ar_experience_id;
    const markerId = ar_experience_id;
    const outputDir = `outputs/${markerId}`;
    fs.mkdirSync(outputDir, { recursive: true });

    // Cambia esta ruta según la ubicación real del CLI de AR.js
    const cliPath = './node_modules/.bin/ar-nft-marker-cli';
    await new Promise((resolve, reject) => {
      const cli = spawn('node', [cliPath, '-i', req.file.path, '-o', outputDir, '-n', markerId]);
      cli.stdout.on('data', data => process.stdout.write(data));
      cli.stderr.on('data', data => process.stderr.write(data));
      cli.on('close', code => code === 0 ? resolve() : reject(new Error('Error generating NFT marker')));
    });

    // Sube los archivos generados a Supabase Storage
    const files = ['fset', 'fset3', 'iset'];
    const urls = {};

    for (const ext of files) {
      const filePath = path.join(outputDir, `${markerId}.${ext}`);
      const fileBuffer = fs.readFileSync(filePath);
      const { error } = await supabase.storage
        .from('markers')
        .upload(`${markerId}/${markerId}.${ext}`, fileBuffer, {
          cacheControl: '3600',
          upsert: true,
        });
      if (error) throw error;

      const { publicURL } = supabase.storage
        .from('markers')
        .getPublicUrl(`${markerId}/${markerId}.${ext}`);
      urls[ext] = publicURL;
    }

    // (Opcional) Actualiza tabla ar_experiences
    if (req.body.ar_experience_id) {
      const { error: dbError } = await supabase
        .from('ar_experiences')
        .update({
          marker_fset_url: urls.fset,
          marker_fset3_url: urls.fset3,
          marker_iset_url: urls.iset,
        })
        .eq('id', ar_experience_id);
      if (dbError) throw dbError;
    }

    // Limpieza archivos temporales
    fs.rmSync(req.file.path, { force: true });
    fs.rmSync(outputDir, { recursive: true, force: true });

    res.json({
      markerId,
      nftMarker: urls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}; 