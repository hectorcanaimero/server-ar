require('dotenv').config();
const express = require('express');
const { limiter } = require('./config/rateLimit');
const { checkSupabaseJWT } = require('./middlewares/checkSupabaseJWT');
const markerRoutes = require('./routes/marker');
const videoRoutes = require('./routes/video');
const apiRouter = express.Router();

const PORT = process.env.PORT || 4000;
const app = express();
app.use(limiter);
// Rutas
apiRouter.use('/generate-marker', checkSupabaseJWT, markerRoutes);
apiRouter.use('/optimize-video', checkSupabaseJWT, videoRoutes);
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Microservicio AR listo en puerto ${PORT}`);
});
