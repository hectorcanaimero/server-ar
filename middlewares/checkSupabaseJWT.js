const { jwtVerify, createRemoteJWKSet } = require('jose');

async function checkSupabaseJWT(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No bearer token' });
    }
    const token = auth.replace('Bearer ', '');

    // Obtén el endpoint de JWKs (llave pública) de Supabase
    const jwksUri = `${process.env.SUPABASE_URL}/auth/v1/keys`;
    const JWKS = createRemoteJWKSet(new URL(jwksUri));

    // Valida el JWT
    await jwtVerify(token, JWKS);
    // Puedes extraer claims y validarlos si lo necesitas
    next();
  } catch (e) {
    console.error(e);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { checkSupabaseJWT }; 