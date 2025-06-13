const markerQueue = require('../queue/markerQueue');

exports.generateMarker = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const ar_experience_id = req.body.ar_experience_id;
    const markerId = ar_experience_id;
    const outputDir = `outputs/${markerId}`;

    // Encola el trabajo
    await markerQueue.add('generate', {
      imagePath: req.file.path,
      outputDir
    });

    res.json({
      status: 'enqueued',
      markerId,
      message: 'El trabajo fue puesto en la cola. Recibirás notificación cuando esté listo.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};