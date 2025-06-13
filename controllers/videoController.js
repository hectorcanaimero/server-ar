const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabase');
const { spawn } = require('child_process');

exports.optimizeVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video uploaded' });

    const experienceId = req.body.ar_experience_id;
    const inputPath = req.file.path;
    const outputDir = 'outputs';
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${experienceId}.mp4`);

    // Ejecuta FFmpeg para comprimir y convertir el video
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-vcodec', 'libx264',
        '-acodec', 'aac',
        '-b:v', '1500k',
        '-b:a', '96k',
        '-vf', 'scale=1280:720',
        '-preset', 'fast',
        outputPath
      ]);
      ffmpeg.stdout.on('data', data => process.stdout.write(data));
      ffmpeg.stderr.on('data', data => process.stderr.write(data));
      ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error('Error al comprimir video')));
    });

    // Sube el video optimizado a Supabase Storage
    const videoBuffer = fs.readFileSync(outputPath);

    const { error } = await supabase.storage
      .from('videos')
      .upload(`${experienceId}/${experienceId}.mp4`, videoBuffer, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    // Obtiene la URL pública
    const { publicURL } = supabase.storage
      .from('videos')
      .getPublicUrl(`${experienceId}/${experienceId}.mp4`);

    // (Opcional) Actualiza la tabla de experiencias
    if (req.body.ar_experience_id) {
      const { error: dbError } = await supabase
        .from('ar_experiences')
        .update({ video_url: publicURL })
        .eq('id', req.body.ar_experience_id);
      if (dbError) throw dbError;
    }

    // Limpieza archivos temporales
    fs.rmSync(inputPath, { force: true });
    fs.rmSync(outputPath, { force: true });

    res.json({
      ar_experience_id: experienceId,
      video_url: publicURL
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}; 