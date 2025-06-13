const request = require('supertest');
const express = require('express');
const { limiter } = require('../config/rateLimit');
const { checkApiKey } = require('../middlewares/checkApiKey');
const markerRoutes = require('../routes/marker');
const videoRoutes = require('../routes/video');
const apiRouter = express.Router();

const app = express();
app.use(limiter);
apiRouter.use('/generate-marker', checkApiKey, markerRoutes);
apiRouter.use('/optimize-video', checkApiKey, videoRoutes);
app.use('/api', apiRouter);

const API_KEY = process.env.UPLOAD_API_KEY || 'test-key';

describe('API Endpoints', () => {
  it('debe rechazar sin API Key', async () => {
    const res = await request(app)
      .post('/generate-marker')
      .attach('image', Buffer.from(''), 'test.png');
    expect(res.statusCode).toBe(401);
  });

  it('debe rechazar si no se sube imagen', async () => {
    const res = await request(app)
      .post('/generate-marker')
      .set('Authorization', `Bearer ${API_KEY}`);
    expect(res.statusCode).toBe(400);
  });

  it('debe rechazar si no se sube video', async () => {
    const res = await request(app)
      .post('/optimize-video')
      .set('Authorization', `Bearer ${API_KEY}`);
    expect(res.statusCode).toBe(400);
  });

  // Puedes agregar más tests simulando archivos válidos y mocks de Supabase
});